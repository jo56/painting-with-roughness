export interface DrawGridParams {
  ctx: CanvasRenderingContext2D;
  grid: number[][];
  cellSize: number;
  showGrid: boolean;
  gridColor: string;
  backgroundColor: string;
  palette: string[];
  customColor: string;
}

export function drawGrid({
  ctx,
  grid,
  cellSize,
  showGrid,
  gridColor,
  backgroundColor,
  palette,
  customColor,
}: DrawGridParams): void {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const canvasWidth = cols * cellSize;
  const canvasHeight = rows * cellSize;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const colorIndex = grid[r]?.[c];
      if (colorIndex > 0) {
        if (colorIndex === palette.length) {
          ctx.fillStyle = customColor;
        } else {
          ctx.fillStyle = palette[colorIndex];
        }
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  if (showGrid) {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvasWidth; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x + 0.25, 0);
      ctx.lineTo(x + 0.25, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.25);
      ctx.lineTo(canvasWidth, y + 0.25);
      ctx.stroke();
    }
  }
}
