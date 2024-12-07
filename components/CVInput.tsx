import React from 'react'

interface CVInputProps {
  cvText: string
  setCvText: (text: string) => void
  onStart: () => void
}

export function CVInput({ cvText, setCvText, onStart }: CVInputProps) {
  return (
    <div className="mb-4">
      <textarea
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
        className="w-full p-2 border rounded"
        rows={10}
        placeholder="Paste your CV text here..."
      />
      <button
        onClick={onStart}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        disabled={!cvText.trim()}
      >
        Start Interview
      </button>
    </div>
  )
}

