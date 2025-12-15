import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";

// Initialize the Rekognition client
const rekognition = new RekognitionClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export async function compareFaces(sourceImage: string, targetImage: string): Promise<number> {
  try {
    // Convert base64 images to Uint8Array (browser-compatible)
    const base64ToUint8Array = (base64: string): Uint8Array => {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };

    const sourceBuffer = base64ToUint8Array(sourceImage.split(',')[1]);
    const targetBuffer = base64ToUint8Array(targetImage.split(',')[1]);

    const command = new CompareFacesCommand({
      SourceImage: { Bytes: sourceBuffer },
      TargetImage: { Bytes: targetBuffer },
      SimilarityThreshold: 70,
    });

    const response = await rekognition.send(command);

    if (response.FaceMatches && response.FaceMatches.length > 0) {
      // Return the highest similarity score
      return response.FaceMatches[0].Similarity || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error comparing faces:', error);
    throw new Error('Failed to compare faces');
  }
}