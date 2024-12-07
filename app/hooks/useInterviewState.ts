'use client'

import { useState } from 'react'

export function useInterviewState() {
  const [cvText, setCvText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)

  const generateQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const data = await response.json();
      return {
        question: data.question,
        audioContent: data.audioContent
      };
    } catch (error) {
      console.error('Error generating question:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const resetInterview = () => {
    setInterviewStarted(false)
    setIsRecording(false)
    setIsLoading(false)
    setCvText('')
  }

  return {
    cvText,
    setCvText,
    isLoading,
    isRecording,
    interviewStarted,
    setInterviewStarted,
    generateQuestion,
    startRecording,
    stopRecording,
    resetInterview,
  }
}