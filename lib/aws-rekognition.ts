import { RekognitionClient, DetectLabelsCommand, DetectTextCommand } from '@aws-sdk/client-rekognition'

// Initialize AWS Rekognition client
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface RecognizedItem {
  name: string
  confidence: number
  bbox?: [number, number, number, number] // [x, y, width, height]
  type: 'label' | 'text'
}

export async function detectLabels(imageBuffer: Buffer): Promise<RecognizedItem[]> {
  try {
    const command = new DetectLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MaxLabels: 10,
      MinConfidence: 70,
    })

    const response = await rekognitionClient.send(command)
    
    return response.Labels?.map(label => ({
      name: label.Name || 'Unknown',
      confidence: label.Confidence || 0,
      type: 'label' as const,
    })) || []
  } catch (error) {
    console.error('AWS Rekognition label detection error:', error)
    throw error
  }
}

export async function detectText(imageBuffer: Buffer): Promise<RecognizedItem[]> {
  try {
    const command = new DetectTextCommand({
      Image: {
        Bytes: imageBuffer,
      },
    })

    const response = await rekognitionClient.send(command)
    
    return response.TextDetections?.map(detection => ({
      name: detection.DetectedText || 'Unknown',
      confidence: detection.Confidence || 0,
      bbox: detection.Geometry?.BoundingBox ? [
        detection.Geometry.BoundingBox.Left || 0,
        detection.Geometry.BoundingBox.Top || 0,
        detection.Geometry.BoundingBox.Width || 0,
        detection.Geometry.BoundingBox.Height || 0,
      ] : undefined,
      type: 'text' as const,
    })) || []
  } catch (error) {
    console.error('AWS Rekognition text detection error:', error)
    throw error
  }
}

export async function recognizeImage(imageBuffer: Buffer): Promise<RecognizedItem[]> {
  try {
    // Run both label and text detection in parallel
    const [labels, texts] = await Promise.all([
      detectLabels(imageBuffer),
      detectText(imageBuffer),
    ])

    // Combine and filter results
    const allItems = [...labels, ...texts]
    
    // Remove duplicates and low confidence items
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(t => t.name === item.name)
    ).filter(item => item.confidence > 50)

    return uniqueItems
  } catch (error) {
    console.error('AWS Rekognition recognition error:', error)
    throw error
  }
} 