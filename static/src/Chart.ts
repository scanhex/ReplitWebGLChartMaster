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

        this.setupEventListeners();
    }

    protected abstract render(): void;

    private setupEventListeners() {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                this.offsetX += deltaX / (this.canvas.width * this.scale);
                this.offsetY += deltaY / (this.canvas.height * this.scale);
                lastX = e.clientX;
                lastY = e.clientY;
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
}
