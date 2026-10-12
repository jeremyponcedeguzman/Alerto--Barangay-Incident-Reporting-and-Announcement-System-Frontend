import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Custom hook to manage hardware camera video stream,
 * viewfinder preview, and canvas photo snapshot capture.
 */
export function useLiveCamera() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Stop all active tracks on the media stream
  const stopStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Open live webcam / back camera
  const openCamera = useCallback(async () => {
    setCameraError("");
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError(
        "Camera access was denied or is unavailable. Please allow camera permissions to capture live evidence."
      );
      setIsCameraOpen(false);
    }
  }, []);

  // Close live camera stream
  const closeCamera = useCallback(() => {
    stopStream();
    setIsCameraOpen(false);
  }, [stopStream]);

  // Capture current video frame to canvas as a JPEG data URL
  const captureSnapshot = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
      closeCamera();
      return dataUrl;
    }
    return null;
  }, [closeCamera]);

  // Reset captured image and re-open viewfinder
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    openCamera();
  }, [openCamera]);

  // Attach active stream to videoRef whenever camera opens
  useEffect(() => {
    if (isCameraOpen && mediaStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isCameraOpen]);

  // Clean up stream tracks when component unmounts
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    canvasRef,
    isCameraOpen,
    capturedImage,
    cameraError,
    openCamera,
    closeCamera,
    captureSnapshot,
    retakePhoto,
    setCapturedImage,
  };
}
