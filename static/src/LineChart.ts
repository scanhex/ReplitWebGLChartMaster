import { Chart, Point } from './Chart';
import { WebGLRenderer } from './WebGLRenderer';

export class LineChart extends Chart {
    private renderer: WebGLRenderer;

    constructor(container: HTMLElement, data: Point[]) {
        super(container, data);
        this.renderer = new WebGLRenderer(this.gl);
    }

    public render(): void {
        console.log('Rendering LineChart');
        console.log('Canvas dimensions:', this.canvas.width, this.canvas.height);
        console.log('Scale:', this.scale, 'Offset:', this.offsetX, this.offsetY);
        console.log('Data range:', { xMin: this.xMin, xMax: this.xMax, yMin: this.yMin, yMax: this.yMax });

        const { width, height } = this.canvas;
        this.gl.viewport(0, 0, width, height);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Set clear color to white
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Draw axes
        const padding = 40;
        this.renderer.drawLines([
            padding, height - padding, width - padding, height - padding,  // X-axis
            padding, padding, padding, height - padding  // Y-axis
        ], [0, 0, 0, 1]);  // Black color for axes

        // Draw data
        const transformedData = this.transformData();
        console.log('Transformed data:', transformedData);
        this.renderer.drawLines(transformedData, [0, 0, 1, 1]);  // Blue color for data

        // Draw labels
        this.drawLabels();
    }

    private transformData(): number[] {
        const transformedData: number[] = [];
        const padding = 40;
        const xRange = this.xMax - this.xMin;
        const yRange = this.yMax - this.yMin;

        for (const point of this.data) {
            const x = padding + ((point.x - this.xMin) / xRange) * (this.canvas.width - 2 * padding);
            const y = this.canvas.height - padding - ((point.y - this.yMin) / yRange) * (this.canvas.height - 2 * padding);
            transformedData.push(x, y);

            console.log(`Original point: (${point.x}, ${point.y}) -> Transformed: (${x}, ${y})`);
        }

        return transformedData;
    }

    private drawLabels(): void {
        const { width, height } = this.canvas;
        const padding = 40;
        const labelColor: [number, number, number, number] = [0, 0, 0, 1];  // Black color for labels

        // X-axis labels
        for (let i = 0; i <= 5; i++) {
            const x = padding + (i / 5) * (width - 2 * padding);
            const value = this.xMin + (i / 5) * (this.xMax - this.xMin);
            this.renderer.drawText(value.toFixed(1), x, height - padding + 20, labelColor, '14px Arial');
        }

        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const y = height - padding - (i / 5) * (height - 2 * padding);
            const value = this.yMin + (i / 5) * (this.yMax - this.yMin);
            this.renderer.drawText(value.toFixed(1), padding - 30, y, labelColor, '14px Arial');
        }

        // Add chart title
        this.renderer.drawText('WebGL Chart Demo', width / 2, padding / 2, labelColor, 'bold 18px Arial');
    }
}
