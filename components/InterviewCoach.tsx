'use client'

import React, { useState, useRef, useEffect } from 'react';
import ModernUpload from '@/components/ModernUpload';
import WaitingScreen from '@/components/WaitingScreen';
import ProgressTimeline from '@/components/ProgressTimeline';
import ResultsPage from '@/components/ResultsPage';
import { AnswerInput } from '@/components/AnswerInput';
import { useInterviewState } from '@/app/hooks/useInterviewState';
import { extractTextFromPDF } from '@/utils/pdfParser';

interface Answer {
  question: string;
  answer: string;
  feedback?: string;
}

interface VideoPreviewProps {
  isActive: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-[60vh] object-cover rounded-lg bg-black"
    />
  );
};

export function InterviewCoach() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [processingAnswers, setProcessingAnswers] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [audioContents, setAudioContents] = useState<string[]>([]);
  const [showEndButton, setShowEndButton] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const lastTranscriptRef = useRef<string>('');
  const [error, setError] = useState('');

  const {
    cvText,
    setCvText,
    isLoading,
    isRecording,
    interviewStarted,
    setInterviewStarted,
    generateQuestion,
    startRecording,
    stopRecording,
    resetInterview
  } = useInterviewState();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setError('');
    setFileName(file.name);

    try {
      const text = await extractTextFromPDF(file);
      setCvText(text);
    } catch (err) {
      setError('Failed to read PDF file');
      setFileName('');
    }
  };

  const startInterview = async () => {
    setIsWaiting(true);
    try {
      const q1 = await generateQuestion();
      const q2 = await generateQuestion();
      
      setQuestions([q1.question, q2.question]);
      setAudioContents([q1.audioContent, q2.audioContent]);
      setAnswers([]);
      setCurrentStep(1);
      setIsWaiting(false);
      setInterviewStarted(true);

      setTimeout(() => {
        const audio = new Audio(`data:audio/mp3;base64,${q1.audioContent}`);
        audio.onended = () => startRecording();
        audio.play();
      }, 1000);
    } catch (error) {
      console.error('Error starting interview:', error);
      setError('Failed to start interview');
      setIsWaiting(false);
    }
  };

  const handleTranscriptionComplete = async (transcript: string) => {
    console.log('Transcription completed:', transcript);
    lastTranscriptRef.current = transcript;
    
    const newAnswer: Answer = {
      question: questions[currentQuestionIndex],
      answer: transcript,
      feedback: undefined
    };

    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = newAnswer;
      return newAnswers;
    });

    if (currentQuestionIndex === 0) {
      stopRecording();
      setTimeout(() => {
        setCurrentQuestionIndex(1);
        console.log('Playing second question');
        const audio = new Audio(`data:audio/mp3;base64,${audioContents[1]}`);
        audio.onended = () => {
          console.log('Second question finished, starting recording');
          startRecording();
          setShowEndButton(true);
        };
        audio.play().catch(e => console.error('Error playing audio:', e));
      }, 1000);
    }
  };

  const handleEndInterview = async () => {
    setProcessingAnswers(true); // Show loading immediately
    stopRecording();

    try {
      // Wait for the final transcript to be available
      await new Promise<void>((resolve) => {
        const checkTranscript = () => {
          if (lastTranscriptRef.current) {
            resolve();
          } else {
            setTimeout(checkTranscript, 500); // Check every 500ms
          }
        };
        checkTranscript();
      });

      const finalAnswer: Answer = {
        question: questions[1],
        answer: lastTranscriptRef.current,
        feedback: undefined
      };

      setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[1] = finalAnswer;
        return newAnswers;
      });

      // Ensure state is updated before proceeding
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await fetch('/api/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: [answers[0], {
            question: questions[1],
            answer: lastTranscriptRef.current
          }],
          cvText
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        feedback: data.feedback
      })));

      setShowResults(true);
      setCurrentStep(2);
    } catch (error) {
      // Don't show error to user, just log it
      console.error('Error processing answers:', error);
    } finally {
      setProcessingAnswers(false);
    }
  };

  const handleRestart = () => {
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuestions([]);
    setAudioContents([]);
    setShowEndButton(false);
    lastTranscriptRef.current = '';
    setCurrentStep(0);
    setInterviewStarted(false);
    setError('');
    resetInterview();
  };

  if (isWaiting) {
    return (
      <>
        <WaitingScreen />
        <ProgressTimeline currentStep={currentStep} />
      </>
    );
  }

  if (showResults) {
    return (
      <>
        <ResultsPage answers={answers} onRestart={handleRestart} />
        <ProgressTimeline currentStep={currentStep} />
      </>
    );
  }

  return (
    <>
      {!interviewStarted ? (
        <>
          <ModernUpload
            onFileContent={handleFileUpload}
            onStart={startInterview}
            fileName={fileName}
            isLoading={isLoading}
            error={error}
          />
          <ProgressTimeline currentStep={currentStep} />
        </>
      ) : (
        <div className="min-h-screen bg-gray-50">
<header className="py-6 px-4 bg-white border-b">
  <div className="max-w-4xl mx-auto flex justify-between items-center">
    <div className="text-[#82dee4] text-3xl font-bold">AI Coach</div>
    <button className="text-black bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
      Help?
    </button>
  </div>
</header>

          <main className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h2 className="text-xl font-semibold mb-2">General Interview</h2>
              <p className="text-gray-600">Question {currentQuestionIndex + 1} of 2</p>
              <p className="mt-2 text-lg">{questions[currentQuestionIndex]}</p>
            </div>

            <div className="relative">
              <VideoPreview isActive={interviewStarted} />

              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <div className="flex gap-2">
                  <button className="bg-white/90 p-2 rounded-full hover:bg-white">
                    🎤
                  </button>
                  <button className="bg-white/90 p-2 rounded-full hover:bg-white">
                    🔊
                  </button>
                </div>

                {showEndButton && (
                  <button
                    onClick={handleEndInterview}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
                  >
                    End Interview
                  </button>
                )}
              </div>
            </div>

            <AnswerInput
              onSubmit={() => {}}
              isLoading={isLoading}
              isRecording={isRecording}
              onTranscriptionComplete={handleTranscriptionComplete}
              hideTranscript={true}
            />

{processingAnswers && (
  <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg text-center shadow-lg max-w-md mx-auto">
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-[#82dee4]/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#82dee4] border-t-transparent animate-spin"></div>
      </div>
      <h2 className="text-xl font-semibold text-black mb-2">Analyzing your interview</h2>
      <p className="text-gray-600">
        Our AI is reviewing your responses and preparing detailed feedback
      </p>
    </div>
  </div>
)}
          </main>

          <ProgressTimeline currentStep={currentStep} />
        </div>
      )}
    </>
  );
}