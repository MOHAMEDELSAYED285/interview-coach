import React from 'react'

interface FeedbackDisplayProps {
  feedback: string
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Feedback:</h2>
      <p className="text-lg whitespace-pre-wrap">{feedback}</p>
    </div>
  )
}

