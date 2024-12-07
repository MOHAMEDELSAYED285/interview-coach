import React from 'react'
import { FileText, MessageSquare, CheckCircle } from 'lucide-react'

interface ProgressTimelineProps {
  currentStep: number
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ currentStep }) => {
  const steps = [
    { name: 'Upload Resume', duration: '30 sec', icon: FileText },
    { name: 'Take Interview', duration: '5 mins', icon: MessageSquare },
    { name: 'View Results', duration: '', icon: CheckCircle }
  ]

  return (
    <div className="w-full bg-white border-t shadow-lg mt-auto">
      <div className="max-w-4xl mx-auto flex justify-between py-6 px-6">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isPast = index < currentStep
          const Icon = step.icon

          return (
            <div key={step.name} className="flex items-center gap-4">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-[#82dee4] text-white' : 
                  isPast ? 'bg-[#82dee4]/20 text-[#82dee4]' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span 
                  className={`font-semibold ${
                    isActive ? 'text-[#82dee4]' : 
                    isPast ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step.name}
                </span>
                <span className="text-sm text-gray-400">{step.duration}</span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`hidden md:block h-0.5 w-12 mt-1 ${
                    isPast ? 'bg-[#82dee4]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressTimeline

