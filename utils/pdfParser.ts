// utils/pdfParser.ts
export async function extractTextFromPDF(file: File): Promise<string> {
    // Import pdf.js dynamically
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set up worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  
    return new Promise(async (resolve, reject) => {
      try {
        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
  
        let fullText = ''
  
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
          fullText += pageText + '\n'
        }
  
        resolve(fullText)
      } catch (error) {
        reject(error)
      }
    })
  }