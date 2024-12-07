import React, { useEffect, useRef, useState } from 'react'
import { LoadingScreen } from './LoadingScreen'

interface QuestionDisplayProps {
  question: string
  audioContent?: string
  isLoading: boolean
  onAudioEnd: () => void
}

export function QuestionDisplay({ question, audioContent, isLoading, onAudioEnd }: QuestionDisplayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (audioContent && audioRef.current) {
      // Create a Blob from the base64 audio content
      const binaryAudio = atob(audioContent)
      const arrayBuffer = new ArrayBuffer(binaryAudio.length)
      const byteArray = new Uint8Array(arrayBuffer)
      
      for (let i = 0; i < binaryAudio.length; i++) {
        byteArray[i] = binaryAudio.charCodeAt(i)
      }
      
      const blob = new Blob([arrayBuffer], { type: 'audio/mp3' })
      const url = URL.createObjectURL(blob)
      
      audioRef.current.src = url
      
      // Play audio after setting source
      const playAudio = async () => {
        try {
          if (audioRef.current) {
            setIsPlaying(true)
            await audioRef.current.play()
          }
        } catch (error) {
          console.error('Error playing audio:', error)
          setIsPlaying(false)
        }
      }
      
      playAudio()

      // Cleanup URL when component unmounts or audio content changes
      return () => URL.revokeObjectURL(url)
    }
  }, [audioContent])



  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-2">Interview Question:</h2>
      <p className="text-lg mb-4">{question}</p>
      <audio 
        ref={audioRef}
        controls
        className="w-full"
        onEnded={() => {
          setIsPlaying(false)
          onAudioEnd()
        }}
        onError={(e) => {
          console.error('Audio error:', e)
          setIsPlaying(false)
        }}
      />
      {isPlaying && <p className="mt-2 text-blue-600">Playing question...</p>}
    </div>
  )
}