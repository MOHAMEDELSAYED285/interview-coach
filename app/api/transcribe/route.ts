import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('file') as Blob
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Convert Blob to File
    const file = new File([audioFile], 'audio.mp3', { type: 'audio/mp3' })

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en"
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error: any) {
    console.error('Error transcribing audio:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}