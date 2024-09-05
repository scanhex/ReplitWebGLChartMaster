export interface Point {
    x: number;
    y: number;
}

export abstract class Chart {
    protected container: HTMLElement;
    protected canvas: HTMLCanvasElement;
    protected gl: WebGLRenderingContext;
    protected data: Point[];
    protected scale: number = 1;
    protected offsetX: number = 0;
    protected offsetY: number = 0;
    protected xMin: number = 0;
    protected xMax: number = 0;
    protected yMin: number = 0;
    protected yMax: number = 0;
    private lastDataX: number = 0;
    private lastDataY: number = 0;

    constructor(container: HTMLElement, data: Point[]) {
        this.container = container;
        this.data = data;
        this.canvas = document.createElement('canvas');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        container.appendChild(this.canvas);

        const gl = this.canvas.getContext('webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        this.gl = gl;

        this.calculateDataRange();
        this.setupEventListeners();
    }

    protected abstract render(): void;

    private calculateDataRange() {
        this.xMin = Math.min(...this.data.map(p => p.x));
        this.xMax = Math.max(...this.data.map(p => p.x));
        this.yMin = Math.min(...this.data.map(p => p.y));
        this.yMax = Math.max(...this.data.map(p => p.y));
    }

    private setupEventListeners() {
        let isDragging = false;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.lastDataX = this.screenToDataX(e.clientX);
            this.lastDataY = this.screenToDataY(e.clientY);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const currentDataX = this.screenToDataX(e.clientX);
                const currentDataY = this.screenToDataY(e.clientY);
                this.offsetX += (currentDataX - this.lastDataX) * 2; // Increase X-axis speed
                this.offsetY -= (currentDataY - this.lastDataY); // Invert Y-axis
                this.lastDataX = currentDataX;
                this.lastDataY = currentDataY;
                this.render();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale *= zoomFactor;
            this.render();
        });
    }

    private screenToDataX(screenX: number): number {
        return (screenX / this.canvas.width) * (this.xMax - this.xMin) / this.scale + this.xMin - this.offsetX;
    }

    private screenToDataY(screenY: number): number {
        return ((this.canvas.height - screenY) / this.canvas.height) * (this.yMax - this.yMin) / this.scale + this.yMin - this.offsetY;
    }

    public simulatePanning(deltaX: number, deltaY: number): void {
        console.log('Simulating panning');
        console.log('Before panning - offsetX:', this.offsetX, 'offsetY:', this.offsetY);
        this.offsetX += deltaX * 2;
        this.offsetY -= deltaY;
        console.log('After panning - offsetX:', this.offsetX, 'offsetY:', this.offsetY);
        this.render();
    }

    public getChartState(): object {
        return {
            scale: this.scale,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            xMin: this.xMin,
            xMax: this.xMax,
            yMin: this.yMin,
            yMax: this.yMax
        };
    }
}
