"use client"
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { drawOnCanvas } from './utils';

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ObjectDetection } from '@tensorflow-models/coco-ssd';


export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<ObjectDetection>();

  // 1. init model 
  const initModel = async () => {
    // Load the model.
    const loadedModel = await cocoSsd.load();
    // set the model in state
    setModel(loadedModel);
  }

  // 2. only on load
  useEffect(() => {
    initModel();
  }, []);


  // 3. run predictions
  const runPredictions = async () => {
    // Classify the image.
    if (model &&
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const predictions = await model?.detect(webcamRef.current?.video as HTMLVideoElement);
      console.log(predictions);

      resizeCanvas(canvasRef, webcamRef);
      drawOnCanvas(predictions, canvasRef.current?.getContext("2d"));
    }
  }
  // 4. with a interval
  setInterval(() => {
    runPredictions();
  }, 100);

  // 5. display
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          style={{ padding: 20, position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <canvas
          ref={canvasRef}
          style={{ zIndex: 10, padding: 20, position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}

function resizeCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, webcamRef: React.RefObject<Webcam>) {
  const canvas = canvasRef.current;
  const webcam = webcamRef.current.video;

  if (canvas && webcam) {
    const { videoWidth, videoHeight } = webcam;

    // Set canvas dimensions to match the video's intrinsic dimensions
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  }
}

