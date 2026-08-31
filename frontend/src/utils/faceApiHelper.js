import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;
let modelLoadingPromise = null;

/**
 * Load Face-API models from local public/models directory
 */
export const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
      return true;
    } catch (error) {
      console.error("Failed to load FaceAPI models:", error);
      modelsLoaded = false;
      modelLoadingPromise = null;
      throw new Error("Could not load facial recognition neural models. Please check network/files.");
    }
  })();

  return modelLoadingPromise;
};

/**
 * Detect all faces in video frame or image element
 */
export const detectFacesInMedia = async (mediaElement) => {
  await loadFaceApiModels();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5,
  });

  const detections = await faceapi
    .detectAllFaces(mediaElement, options)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections;
};

/**
 * Detect a single face, validate quality/single-person, and extract 128-d biometric descriptor
 */
export const extractFaceDescriptor = async (mediaElement) => {
  await loadFaceApiModels();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5,
  });

  // Check face count first
  const allDetections = await faceapi.detectAllFaces(mediaElement, options);

  if (!allDetections || allDetections.length === 0) {
    return {
      success: false,
      reason: "NO_FACE",
      message: "No face detected in camera. Please look directly into the camera.",
    };
  }

  if (allDetections.length > 1) {
    return {
      success: false,
      reason: "MULTIPLE_FACES",
      message: "Multiple faces detected! Please ensure only one person is in front of camera.",
    };
  }

  // Single face present, compute landmark & descriptor
  const singleDetection = await faceapi
    .detectSingleFace(mediaElement, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!singleDetection || !singleDetection.descriptor) {
    return {
      success: false,
      reason: "LOW_CONFIDENCE",
      message: "Face was detected but biometric features could not be captured clearly. Please align your face.",
    };
  }

  const descriptorArray = Array.from(singleDetection.descriptor);

  return {
    success: true,
    descriptor: descriptorArray,
    box: singleDetection.detection.box,
    score: singleDetection.detection.score,
  };
};

/**
 * Capture snapshot image from video element as base64 JPEG
 */
export const captureVideoSnapshot = (videoElement) => {
  if (!videoElement || videoElement.videoWidth === 0) return "";

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext("2d");
  // Mirror if front camera
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.85);
};
