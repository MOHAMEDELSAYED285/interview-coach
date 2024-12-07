'use client'

import React, { useState, useEffect, useRef } from 'react'

interface AnswerInputProps {
  onSubmit: () => void;
  isLoading: boolean;
  isRecording: boolean;
  onTranscriptionComplete: (transcript: string) => void;
  hideTranscript?: boolean;
  autoStop?: boolean;
}

export function AnswerInput({
  onSubmit,
  isLoading,
  isRecording,
  onTranscriptionComplete,
  hideTranscript = true,
  autoStop = true
}: AnswerInputProps) {
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const SILENCE_THRESHOLD = -35 // dB
  const SILENCE_DURATION = 1000 // 1.5 seconds of silence

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else {
      stopRecording()
    }

    return () => {
      cleanupAudioResources()
    }
  }, [isRecording])

  const cleanupAudioResources = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current?.state !== 'closed') {
      try {
        audioContextRef.current?.close()
      } catch (err) {
        console.warn('Error closing audio context:', err)
      }
    }
    audioContextRef.current = null
    analyserRef.current = null
  }

  const detectSilence = (analyser: AnalyserNode, dataArray: Float32Array) => {
    if (analyser.context.state === 'closed') return;
    
    analyser.getFloatTimeDomainData(dataArray);
    
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    const db = 20 * Math.log10(rms);

    if (db < SILENCE_THRESHOLD) {
      if (!silenceTimeoutRef.current) {
        console.log('Silence detected, starting timeout');
        silenceTimeoutRef.current = setTimeout(() => {
          console.log('Silence timeout complete, stopping recording');
          if (mediaRecorderRef.current?.state !== 'inactive') {
            mediaRecorderRef.current?.stop();
            // This will trigger the onstop event which handles transcription
          }
        }, SILENCE_DURATION);
      }
    } else {
      if (silenceTimeoutRef.current) {
        console.log('Sound detected, clearing timeout');
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }
  };

  const startRecording = async () => {
    try {
      cleanupAudioResources()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 2048
      const dataArray = new Float32Array(analyserRef.current.fftSize)
      
      const checkSilence = () => {
        if (analyserRef.current && isRecording) {
          detectSilence(analyserRef.current, dataArray)
          requestAnimationFrame(checkSilence)
        }
      }
      checkSilence()

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/mp3' })
        await transcribeAudio(audioBlob)
      }

      mediaRecorder.start()
      console.log('Started recording...')
    } catch (err) {
      console.error('Error starting recording:', err)
      cleanupAudioResources()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
    cleanupAudioResources()
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('file', audioBlob)
      formData.append('model', 'whisper-1')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.text) {
        setTranscript(data.text)
        onTranscriptionComplete(data.text)
      }
    } catch (error) {
      console.error('Error transcribing audio:', error)
    }
  }

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
      {!hideTranscript && transcript && (
        <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-lg">
          <p className="text-gray-800">{transcript}</p>
          {isRecording && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="animate-pulse mr-2">●</span> Recording
            </div>
          )}
        </div>
      )}
    </div>
  )
}