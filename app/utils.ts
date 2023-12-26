import { DetectedObject, ObjectDetection } from "@tensorflow-models/coco-ssd";

export function drawOnCanvas(
  predictions: DetectedObject[],
  ctx: CanvasRenderingContext2D | null | undefined
) {
  ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //get x, y, width, height
  predictions.forEach((detectedObject) => {
    const name = detectedObject.class;
    const score = detectedObject.score;
    const [x, y, width, height] = detectedObject.bbox;

    if (ctx) {
      // styling
      const color = "#00B612";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      // draw with x, y, widht, height
      ctx.beginPath();
      ctx.fillText(name, x, y);
      ctx.rect(x, y, width, height);
      ctx.stroke();
    }
  });
}
