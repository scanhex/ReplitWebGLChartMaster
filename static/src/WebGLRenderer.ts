export class WebGLRenderer {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private textCanvas: HTMLCanvasElement;
    private textCtx: CanvasRenderingContext2D;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = this.createProgram();
        this.textCanvas = document.createElement('canvas');
        this.textCanvas.width = 512;
        this.textCanvas.height = 512;
        this.textCtx = this.textCanvas.getContext('2d')!;
    }

    // ... (keep the existing methods)

    public drawText(text: string, x: number, y: number, color: [number, number, number, number], font: string): void {
        this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        this.textCtx.font = font;
        this.textCtx.fillStyle = 'white';
        this.textCtx.textAlign = 'center';
        this.textCtx.textBaseline = 'middle';
        this.textCtx.fillText(text, this.textCanvas.width / 2, this.textCanvas.height / 2);

        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.textCanvas);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

        const textWidth = this.textCtx.measureText(text).width;
        const textHeight = parseInt(font, 10) || 12;

        const positions = [
            x - textWidth / 2, y - textHeight / 2,
            x + textWidth / 2, y - textHeight / 2,
            x - textWidth / 2, y + textHeight / 2,
            x + textWidth / 2, y + textHeight / 2,
        ];

        const texCoords = [
            0, 0,
            1, 0,
            0, 1,
            1, 1,
        ];

        this.gl.useProgram(this.program);

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        const texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);

        const texCoordAttributeLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
        this.gl.enableVertexAttribArray(texCoordAttributeLocation);
        this.gl.vertexAttribPointer(texCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        const resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

        const colorUniformLocation = this.gl.getUniformLocation(this.program, 'u_color');
        this.gl.uniform4fv(colorUniformLocation, color);

        const useTextureUniformLocation = this.gl.getUniformLocation(this.program, 'u_useTexture');
        this.gl.uniform1i(useTextureUniformLocation, 1);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}
