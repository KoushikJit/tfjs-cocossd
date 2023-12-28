import { DetectedObject, ObjectDetection } from "@tensorflow-models/coco-ssd";

export function drawOnCanvas(
  predictions: DetectedObject[],
  ctx: CanvasRenderingContext2D | null | undefined
) {
  //   ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //get x, y, width, height
  predictions.forEach((detectedObject) => {
    const name = detectedObject.class;
    const score = detectedObject.score;
    const [x, y, width, height] = detectedObject.bbox;
    // drawAesthetic(ctx, x, y, width, height, name);

    if (ctx) {
      // styling
      const color = "#00B612";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 5;
      ctx.font = "bold 16px Arial";

      // draw with x, y, widht, height
      ctx.beginPath();

      ctx.fillStyle = "#00B612";
      ctx.globalAlpha = 0.5;
      ctx.roundRect(ctx.canvas.width - x, y, -width, height, 8);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
      ctx.fillText(name, ctx.canvas.width - x - 100, y + 20);
    }
  });
}

function drawAesthetic(
  ctx: CanvasRenderingContext2D | null | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  name: string
) {
  if (ctx) {
    const rectWidth = width;
    const rectHeight = height;
    const rectX = ctx.canvas.width - x;
    const rectY = y;
    // Draw rectangle
    ctx.fillStyle = "#ccc";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

    // Draw text
    const text = name;
    ctx.fillStyle = "#333";
    ctx.font = "bold 16px Arial";
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, rectX + (rectWidth - textWidth) / 2, rectY + 20);
  }
}
