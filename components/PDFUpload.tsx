'use client'

import React, { useState } from 'react'
import { extractTextFromPDF } from '@/utils/pdfParser'

interface PDFUploadProps {
  onFileContent: (content: string) => void
  onStart: () => void
}

export function PDFUpload({ onFileContent, onStart }: PDFUploadProps) {
  const [fileName, setFileName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    setError('')
    setIsLoading(true)
    setFileName(file.name)

    try {
      const text = await extractTextFromPDF(file)
      onFileContent(text)
    } catch (err) {
      console.error('PDF parsing error:', err)
      setError('Failed to read PDF file')
      setFileName('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-blue-500">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="pdf-input"
        />
        <label
          htmlFor="pdf-input"
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="text-4xl mb-2">📄</div>
          <span className="text-gray-600">
            {fileName || 'Click to upload your CV (PDF)'}
          </span>
          {isLoading && (
            <div className="mt-2 text-blue-500">Processing PDF...</div>
          )}
        </label>
      </div>

      {error && (
        <div className="text-red-500 text-center p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      <button
        onClick={onStart}
        disabled={!fileName || isLoading}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
          ${!fileName || isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
          }`}
      >
        {isLoading ? 'Processing...' : 'Start Interview'}
      </button>
    </div>
  )
}