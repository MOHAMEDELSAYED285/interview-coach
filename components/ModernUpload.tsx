"use client"

import React from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ProgressTimeline from '@/components/ui/ProgressTimeline'

interface ModernUploadProps {
  onFileContent: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStart: () => void
  fileName: string
  isLoading: boolean
  error: string
}

const ModernUpload: React.FC<ModernUploadProps> = ({
  onFileContent,
  onStart,
  fileName,
  isLoading,
  error
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="text-[#82dee4] text-3xl font-bold">AI Coach</div>
            <div className="ml-auto">
              <Button variant="ghost" size="sm">
                Help?
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 tracking-tight">
              Master Your Interview{" "}
              <span className="text-[#82dee4]">Skills</span>{" "}
              with AI
            </h1>
            <p className="text-gray-600 text-xl leading-relaxed mb-8">
              Join 300,000+ professionals in landing your dream job. Get personalized interview practice with our AI coach.
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <FileText className="w-12 h-12 text-[#82dee4] mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Get started</h2>
                <p className="text-gray-600">
                  Get instant feedback on your interview responses
                </p>
              </div>

              {!fileName ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#82dee4] transition-colors">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={onFileContent}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-[#82dee4] mb-4" />
                    <span className="text-[#82dee4] font-medium text-lg mb-2">
                      Upload resume
                    </span>
                    <span className="text-sm text-gray-500">
                      PDF format, max 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#82dee4]" />
                    <span className="font-medium text-gray-700">{fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileContent(null as any)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                onClick={onStart}
                disabled={!fileName || isLoading}
                className={`w-full mt-8 ${
                  !fileName || isLoading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#82dee4] hover:bg-[#6dbfc4]'
                }`}
              >
                {isLoading ? 'Processing...' : 'Start Interview'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <ProgressTimeline currentStep={0} />
    </div>
  )
}

export default ModernUpload

