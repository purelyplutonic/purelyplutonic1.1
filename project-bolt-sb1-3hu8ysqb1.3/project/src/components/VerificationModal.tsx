import React, { useRef, useState } from 'react';
import { Camera, X, Loader, RefreshCw } from 'lucide-react';
import Webcam from 'react-webcam';
import { supabase } from '../lib/supabase';
import { compareFaces } from '../lib/rekognition';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profilePictureUrl?: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  profilePictureUrl 
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [retakeCount, setRetakeCount] = useState(0);

  const captureSelfie = async () => {
    if (!webcamRef.current || !profilePictureUrl) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Capture selfie
      const selfie = webcamRef.current.getScreenshot();
      if (!selfie) throw new Error('Failed to capture selfie');

      setSelfieImage(selfie);

      // Compare faces using AWS Rekognition
      const similarityScore = await compareFaces(selfie, profilePictureUrl);
      setSimilarity(similarityScore);

      if (similarityScore >= 80) {
        // High similarity - automatically verify
        const { error: verificationError } = await supabase
          .from('users')
          .update({ verification_status: 'verified' })
          .eq('id', (await supabase.auth.getUser()).data.user?.id);

        if (verificationError) throw verificationError;

        onSuccess();
        onClose();
      } else if (similarityScore >= 60) {
        // Medium similarity - allow retry
        setError('Face similarity not high enough. Please retake the selfie.');
        setRetakeCount(prev => prev + 1);
      } else {
        // Low similarity - suggest manual verification
        setError('Unable to verify automatically. Please ensure good lighting and face the camera directly.');
        setRetakeCount(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const retakeSelfie = () => {
    setSelfieImage(null);
    setSimilarity(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">AI Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            {retakeCount >= 3 && (
              <p className="mt-2 text-sm">
                Having trouble? Make sure you're in a well-lit area and your face is clearly visible.
              </p>
            )}
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Take a clear selfie in good lighting for instant AI verification.
          </p>

          <div className="relative">
            {selfieImage ? (
              <div className="relative">
                <img
                  src={selfieImage}
                  alt="Verification Selfie"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {similarity !== null && (
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-3 py-1 text-sm">
                    Match: {Math.round(similarity)}%
                  </div>
                )}
              </div>
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
                className="w-full h-64 rounded-lg"
              />
            )}
          </div>

          <div className="flex justify-center mt-4 space-x-3">
            {selfieImage ? (
              <button
                onClick={retakeSelfie}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake Photo
              </button>
            ) : (
              <button
                onClick={captureSelfie}
                disabled={isProcessing}
                className={`flex items-center px-4 py-2 rounded-md text-white ${
                  isProcessing
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Your selfie is only used for verification and is not stored permanently.
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;