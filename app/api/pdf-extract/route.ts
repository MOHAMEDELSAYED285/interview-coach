// app/api/pdf-extract/route.ts
import { NextResponse } from 'next/server'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker path for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as Blob

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n'
    }

    return NextResponse.json({ text: fullText })
  } catch (error) {
    console.error('PDF processing error:', error)
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 })
  }
}