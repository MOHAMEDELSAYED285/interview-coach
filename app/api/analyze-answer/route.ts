// app/api/analyze-answer/route.ts
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string
})

export async function POST(req: Request) {
  try {
    const { answers, cvText } = await req.json()

    if (!answers || answers.length !== 2) {
      return NextResponse.json(
        { error: 'Both answers are required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: 'system',
          content: 'You are an interview coach. Analyze the answers to both interview questions and provide a comprehensive but concise feedback summary.'
        },
        {
          role: 'user',
          content: `
Question 1: ${answers[0].question}
Answer 1: ${answers[0].answer}

Question 2: ${answers[1].question}
Answer 2: ${answers[1].answer}

Provide a concise feedback summary addressing:
1. Key Strengths (2-3 points)
2. Areas for Improvement (2-3 points)
3. Overall Performance Summary (1-2 sentences)

Keep the feedback clear, actionable, and focused on the most important points.`
        }
      ]
    })

    const feedback = completion.choices[0].message?.content

    if (!feedback) {
      throw new Error('Failed to generate feedback')
    }

    return NextResponse.json({ feedback })
  } catch (error: any) {
    console.error('Error analyzing answers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze answers' },
      { status: 500 }
    )
  }
}