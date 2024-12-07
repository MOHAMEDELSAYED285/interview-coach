import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { cvText } = await req.json();

    // Generate question
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: 'system',
          content: 'You are an interviewer. Generate a relevant interview screening call questions based on the provided CV.'
        },
        {
          role: 'user',
          content: `CV: ${cvText}\n\nGenerate an interview question based on this CV.`
        }
      ]
    });

    const question = completion.choices[0].message?.content || '';

    // Generate speech
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: question
    });

    // Convert speech to base64
    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    const audioContent = audioBuffer.toString('base64');

    return NextResponse.json({ question, audioContent });
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}