import { Chart, Point } from './Chart';
import { WebGLRenderer } from './WebGLRenderer';

export class LineChart extends Chart {
    private renderer: WebGLRenderer;

    constructor(container: HTMLElement, data: Point[]) {
        super(container, data);
        this.renderer = new WebGLRenderer(this.gl);
    }

    public render(): void {
        const { width, height } = this.canvas;
        this.gl.viewport(0, 0, width, height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        const transformedData = this.transformData();
        this.renderer.drawLines(transformedData);
    }

    private transformData(): number[] {
        const { width, height } = this.canvas;
        const transformedData: number[] = [];

        const xMin = Math.min(...this.data.map(p => p.x));
        const xMax = Math.max(...this.data.map(p => p.x));
        const yMin = Math.min(...this.data.map(p => p.y));
        const yMax = Math.max(...this.data.map(p => p.y));

        const xRange = xMax - xMin;
        const yRange = yMax - yMin;

        for (const point of this.data) {
            const x = (((point.x - xMin) / xRange) * 2 - 1) * this.scale + this.offsetX * 2;
            const y = (((point.y - yMin) / yRange) * 2 - 1) * this.scale - this.offsetY * 2;
            transformedData.push(x, y);
        }

        return transformedData;
    }
}
