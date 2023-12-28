"use client"
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ObjectDetection } from '@tensorflow-models/coco-ssd';
import React, { useEffect, useRef, useState } from 'react';
import { Circles } from 'react-loader-spinner';
import Webcam from 'react-webcam';
import { drawOnCanvas } from './utils';

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<ObjectDetection>();
  const [loading, setLoading] = useState<boolean>(false);

  // recording states
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<any[]>([]);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  //
  let chunks: Blob[] = [];
  // Initialize MediaRecorder
  useEffect(() => {
    if (webcamRef.current && model) {
      const stream = (webcamRef.current.video as any)?.captureStream();
      if (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            console.log(`datasize: ${e.data.size}`)
            recordedChunksRef.current.push(e.data);
            console.log(`blobarray: ${recordedChunksRef.current.length}`)

            // Combine recorded chunks into a single video
            console.log('length before pop: ' + recordedChunksRef.current.length)
            const recordedBlob = new Blob([recordedChunksRef.current.shift()], { type: 'video' });
            const videoUrl = URL.createObjectURL(recordedBlob);
            console.log('Recorded video URL:', videoUrl);

            // Download the video or perform further actions with the video URL
            // For download:
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = `${formatDate(new Date())}.webm`;
            a.click();
          }
        };
      }
    }
  }, [webcamRef, model]);

  // Function to start recording
  const startRecording = () => {
    if (model && !recording) {
      // Start recording
      if (webcamRef.current && mediaRecorderRef.current?.state !== 'recording') {
        // recordedChunksRef.current = []; // Clear existing chunks
        console.log('starting media record')
        mediaRecorderRef.current?.start();
        // Stop recording after 30 seconds
        setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            console.log('requesting data')
            mediaRecorderRef.current.requestData();
            console.log('stopping media record')

            mediaRecorderRef.current.stop();
          }
        }, 30000);
      }
    }
  };



  // 1. init model 
  const initModel = async () => {
    // Load the model.
    setLoading(true);
    const loadedModel = await cocoSsd.load();
    // set the model in state
    setModel(loadedModel);
    setLoading(false);
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
      resizeCanvas(canvasRef, webcamRef);
      drawOnCanvas(predictions, canvasRef.current?.getContext("2d"));

      // Start recording when objects are detected

      if (predictions?.length > 0) {
        // if person
        let person: boolean = false;
        predictions.forEach(prediction => {
          person = prediction.class === 'person' && prediction.score > 0.40
        });
        if (person) {
          startRecording();
        }
      }
    }
  }

  setInterval(() => {
    console.log(recordedChunksRef.current)
  }, 4000)
  // 4. with a interval
  setInterval(() => {
    runPredictions();
  }, 300);

  // 5. display
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Webcam
          audio={false}
          mirrored={true}
          ref={webcamRef}
          style={{ padding: 20, position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <canvas
          ref={canvasRef}
          style={{ zIndex: 10, padding: 20, position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', }}
        />
        <div id="hidebox"
          style={{ zIndex: 10, padding: 20, position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', }}
        >

        </div>
      </div>
      {loading && renderLoader()}
    </div>
  )
}


function renderLoader() {
  return <div style={{ zIndex: 30, position: 'absolute', width: '100%', height: '100%', objectFit: 'fill', }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Circles
        height="80"
        width="80"
        color="#4fa94d"
        ariaLabel="circles-loading"
        wrapperStyle={{ marginBottom: '20px' }}
        wrapperClass=""
        visible={true} />
      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Model is loading . . .</p>
    </div>
  </div>;
}

function resizeCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, webcamRef: React.RefObject<Webcam>) {
  const canvas = canvasRef.current;
  const webcam = webcamRef.current?.video;

  if (canvas && webcam) {
    const { videoWidth, videoHeight } = webcam;

    // Set canvas dimensions to match the video's intrinsic dimensions
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  }
}


function formatDate(d: Date): string {
  const dformat =
    [(d.getMonth() + 1).toString().padStart(2, '0'),
    d.getDate().toString().padStart(2, '0'),
    d.getFullYear()].join('-')
    + ' ' +
    [d.getHours().toString().padStart(2, '0'),
    d.getMinutes().toString().padStart(2, '0'),
    d.getSeconds().toString().padStart(2, '0')].join('-');
  return dformat;
}