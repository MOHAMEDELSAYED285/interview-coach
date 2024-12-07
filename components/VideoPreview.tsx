'use client'

import React, { useEffect, useRef } from 'react'

interface VideoPreviewProps {
  isActive: boolean
}

export function VideoPreview({ isActive }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err)
        })

      // Cleanup function
      return () => {
        const stream = videoRef.current?.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
      }
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-black">
      <video 
        ref={videoRef}
        autoPlay 
        muted 
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  )
}