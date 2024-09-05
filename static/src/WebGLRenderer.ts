export class WebGLRenderer {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = this.createProgram();
    }

    private createProgram(): WebGLProgram {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, `
            attribute vec2 a_position;
            attribute vec2 a_offset;
            uniform vec2 u_resolution;
            void main() {
                vec2 position = a_position + a_offset;
                vec2 zeroToOne = position / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            }
        `);

        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `);

        const program = this.gl.createProgram();
        if (!program) {
            throw new Error('Failed to create WebGL program');
        }

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('Failed to link WebGL program: ' + this.gl.getProgramInfoLog(program));
        }

        return program;
    }

    private createShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type);
        if (!shader) {
            throw new Error('Failed to create WebGL shader');
        }

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('Failed to compile WebGL shader: ' + this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    public drawLines(data: number[]): void {
        this.gl.useProgram(this.program);

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0]), this.gl.STATIC_DRAW);

        const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        const offsetBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, offsetBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);

        const offsetAttributeLocation = this.gl.getAttribLocation(this.program, 'a_offset');
        this.gl.enableVertexAttribArray(offsetAttributeLocation);
        this.gl.vertexAttribPointer(offsetAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        const resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

        const colorUniformLocation = this.gl.getUniformLocation(this.program, 'u_color');
        this.gl.uniform4f(colorUniformLocation, 0, 0, 1, 1);

        const ext = this.gl.getExtension('ANGLE_instanced_arrays');
        if (!ext) {
            throw new Error('ANGLE_instanced_arrays extension not supported');
        }

        ext.vertexAttribDivisorANGLE(offsetAttributeLocation, 1);
        ext.drawArraysInstancedANGLE(this.gl.LINES, 0, 2, data.length / 2 - 1);
    }
}
