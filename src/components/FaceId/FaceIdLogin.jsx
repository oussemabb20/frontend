import { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import * as faceapi from "face-api.js";

// MUI Components
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Custom Components
import VuiBox from "../VuiBox";
import VuiTypography from "../VuiTypography";
import VuiButton from "../VuiButton";

// Services
import { authService } from "../../services/auth.service";

const MODELS_URL = "/models";

function FaceIdLogin({ email, onSuccess, onError, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle, loading-models, ready, processing, success, error
  const [message, setMessage] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    setStatus("loading-models");
    setMessage("Loading face detection models...");

    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
      ]);

      setModelsLoaded(true);
      setStatus("ready");
      setMessage("Position your face in the frame");
    } catch (error) {
      console.error("Error loading models:", error);
      setStatus("error");
      setMessage("Failed to load face detection models.");
      onError?.("Failed to load face detection models");
    }
  }, [onError]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setStatus("error");
      setMessage("Unable to access camera. Please grant camera permissions.");
      onError?.("Camera access denied");
    }
  }, [onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Auto-capture and authenticate
  const authenticateWithFace = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded || status === "processing") return;

    setStatus("processing");
    setMessage("Verifying your face...");

    try {
      // Detect face and get descriptor
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("ready");
        setMessage("No face detected. Please ensure your face is clearly visible.");
        return;
      }

      // Get the 128-dimensional embedding
      const embedding = Array.from(detection.descriptor);

      // Draw detection on canvas
      if (canvasRef.current) {
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        canvasRef.current.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
      }

      // Authenticate with backend
      const result = await authService.loginWithFaceId(email, embedding);

      setStatus("success");
      setMessage("Authentication successful!");
      stopCamera();
      onSuccess?.(result);
    } catch (error) {
      console.error("Face authentication error:", error);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setStatus("error");
        setMessage("Too many failed attempts. Please use password login.");
        stopCamera();
        onError?.("Max attempts reached");
      } else {
        setStatus("ready");
        setMessage(
          error.response?.data?.message ||
            `Face verification failed. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`
        );
      }
    }
  }, [email, modelsLoaded, status, attempts, onSuccess, onError, stopCamera]);

  // Initialize on mount
  useEffect(() => {
    loadModels();
    startCamera();

    return () => {
      stopCamera();
    };
  }, [loadModels, startCamera, stopCamera]);

  return (
    <Card
      sx={{
        p: 3,
        background: "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)",
      }}
    >
      <VuiBox mb={2}>
        <VuiTypography variant="h5" color="white" fontWeight="bold">
          Face ID Login
        </VuiTypography>
        <VuiTypography variant="body2" color="text">
          Look at the camera to authenticate
        </VuiTypography>
      </VuiBox>

      {/* Video Container */}
      <VuiBox
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          mx: "auto",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "rgba(0,0,0,0.3)",
        }}
      >
        <video
          aria-label="Face recognition camera feed"
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "auto",
            display: status === "success" ? "none" : "block",
            transform: "scaleX(-1)",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: "scaleX(-1)",
          }}
        />

        {/* Loading/Processing Overlay */}
        {(status === "loading-models" || status === "processing") && (
          <VuiBox
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.6)",
            }}
          >
            <CircularProgress aria-label={status === "loading-models" ? "Loading face recognition models" : "Verifying face"} color="info" />
            <VuiTypography variant="caption" color="white" mt={1}>
              {status === "loading-models" ? "Loading..." : "Verifying..."}
            </VuiTypography>
          </VuiBox>
        )}

        {/* Success Overlay */}
        {status === "success" && (
          <VuiBox
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,100,0,0.6)",
            }}
          >
            <VuiTypography variant="h4" color="white">
              ✓
            </VuiTypography>
          </VuiBox>
        )}
      </VuiBox>

      {/* Status Message */}
      <VuiBox mt={2}>
        {status === "success" ? (
          <Alert severity="success">{message}</Alert>
        ) : status === "error" ? (
          <Alert severity="error">{message}</Alert>
        ) : (
          <VuiTypography variant="body2" color="text" textAlign="center">
            {message}
          </VuiTypography>
        )}
      </VuiBox>

      {/* Action Buttons */}
      <VuiBox mt={3} display="flex" justifyContent="center" gap={2}>
        {status === "ready" && (
          <VuiButton color="info" variant="contained" onClick={authenticateWithFace}>
            Verify Face
          </VuiButton>
        )}
        {(status === "ready" || status === "error") && (
          <VuiButton
            color="secondary"
            variant="outlined"
            onClick={() => {
              stopCamera();
              onCancel?.();
            }}
          >
            Use Password
          </VuiButton>
        )}
      </VuiBox>
    </Card>
  );
}

FaceIdLogin.propTypes = {
  email: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onCancel: PropTypes.func,
};

export default FaceIdLogin;
