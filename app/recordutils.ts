import { useRef } from "react";
import Webcam from "react-webcam";
import { RecorderSingleton } from "./RecorderSingleton";

let webcamRef: Webcam | null = null;
let recordedChunks: Blob[] = [];
let mediaRecorderRef: MediaRecorder | null = null;
let instance: MediaRecorder | null = null;

export const initRecorder = async (webcam: Webcam) => {
  webcamRef = webcam;
  const webcamStream = webcamRef.video?.srcObject as MediaStream;
  if (!mediaRecorderRef) {
    // mediaRecorderRef = RecorderSingleton.getInstance(webcamStream);
    mediaRecorderRef = new MediaRecorder(webcamStream);
    console.log(mediaRecorderRef);
    mediaRecorderRef.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
  }
};

export const startRecording = (webcam: Webcam) => {
  initRecorder(webcam);
  if (mediaRecorderRef?.state !== "recording") {
    mediaRecorderRef!.start();
    console.log("started recording");
    setTimeout(() => {
      mediaRecorderRef?.stop();
      console.log("stopped recording");
      handleDownload();
    }, 15000);
  }
};

const handleDownload = () => {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  a.href = url;
  a.download = "recorded-video.webm";
  a.click();

  window.URL.revokeObjectURL(url);
  recordedChunks = [];
};
