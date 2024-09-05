/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./static/src/Chart.ts":
/*!*****************************!*\
  !*** ./static/src/Chart.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Chart: () => (/* binding */ Chart)
/* harmony export */ });
class Chart {
    constructor(container, data) {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
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
    setupEventListeners() {
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


/***/ }),

/***/ "./static/src/LineChart.ts":
/*!*********************************!*\
  !*** ./static/src/LineChart.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineChart: () => (/* binding */ LineChart)
/* harmony export */ });
/* harmony import */ var _Chart__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Chart */ "./static/src/Chart.ts");
/* harmony import */ var _WebGLRenderer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WebGLRenderer */ "./static/src/WebGLRenderer.ts");


class LineChart extends _Chart__WEBPACK_IMPORTED_MODULE_0__.Chart {
    constructor(container, data) {
        super(container, data);
        this.renderer = new _WebGLRenderer__WEBPACK_IMPORTED_MODULE_1__.WebGLRenderer(this.gl);
    }
    render() {
        const { width, height } = this.canvas;
        this.gl.viewport(0, 0, width, height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        const transformedData = this.transformData();
        this.renderer.drawLines(transformedData);
    }
    transformData() {
        const { width, height } = this.canvas;
        const transformedData = [];
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


/***/ }),

/***/ "./static/src/WebGLRenderer.ts":
/*!*************************************!*\
  !*** ./static/src/WebGLRenderer.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WebGLRenderer: () => (/* binding */ WebGLRenderer)
/* harmony export */ });
class WebGLRenderer {
    constructor(gl) {
        this.gl = gl;
        this.program = this.createProgram();
    }
    createProgram() {
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
    createShader(type, source) {
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
    drawLines(data) {
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*****************************!*\
  !*** ./static/src/index.ts ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _LineChart__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./LineChart */ "./static/src/LineChart.ts");

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('chart-container');
    if (!container) {
        console.error('Chart container not found');
        return;
    }
    const data = [
        { x: 0, y: 10 },
        { x: 1, y: 15 },
        { x: 2, y: 7 },
        { x: 3, y: 20 },
        { x: 4, y: 12 },
        { x: 5, y: 18 },
    ];
    const chart = new _LineChart__WEBPACK_IMPORTED_MODULE_0__.LineChart(container, data);
    chart.render();
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUM3RDs7Ozs7Ozs7OztBQ053QztBQUV4QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQy9DLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUM3RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDM0MsT0FBTztJQUNYLENBQUM7SUFFRCxNQUFNLElBQUksR0FBRztRQUNULEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO1FBQ2YsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7UUFDZixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNkLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO1FBQ2YsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7UUFDZixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtLQUNsQixDQUFDO0lBRUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxpREFBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbkIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJnbGNoYXJ0bWFzdGVyLy4vc3RhdGljL3NyYy9DaGFydC50cyIsIndlYnBhY2s6Ly93ZWJnbGNoYXJ0bWFzdGVyLy4vc3RhdGljL3NyYy9MaW5lQ2hhcnQudHMiLCJ3ZWJwYWNrOi8vd2ViZ2xjaGFydG1hc3Rlci8uL3N0YXRpYy9zcmMvV2ViR0xSZW5kZXJlci50cyIsIndlYnBhY2s6Ly93ZWJnbGNoYXJ0bWFzdGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYmdsY2hhcnRtYXN0ZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYmdsY2hhcnRtYXN0ZXIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWJnbGNoYXJ0bWFzdGVyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViZ2xjaGFydG1hc3Rlci8uL3N0YXRpYy9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBQb2ludCB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENoYXJ0IHtcbiAgICBwcm90ZWN0ZWQgY29udGFpbmVyOiBIVE1MRWxlbWVudDtcbiAgICBwcm90ZWN0ZWQgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcm90ZWN0ZWQgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dDtcbiAgICBwcm90ZWN0ZWQgZGF0YTogUG9pbnRbXTtcbiAgICBwcm90ZWN0ZWQgc2NhbGU6IG51bWJlciA9IDE7XG4gICAgcHJvdGVjdGVkIG9mZnNldFg6IG51bWJlciA9IDA7XG4gICAgcHJvdGVjdGVkIG9mZnNldFk6IG51bWJlciA9IDA7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBkYXRhOiBQb2ludFtdKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IGNvbnRhaW5lci5jbGllbnRXaWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICBjb25zdCBnbCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJ3dlYmdsJyk7XG4gICAgICAgIGlmICghZ2wpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViR0wgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcblxuICAgICAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVuZGVyKCk6IHZvaWQ7XG5cbiAgICBwcml2YXRlIHNldHVwRXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIGxldCBpc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgIGxldCBsYXN0WCA9IDA7XG4gICAgICAgIGxldCBsYXN0WSA9IDA7XG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgbGFzdFggPSBlLmNsaWVudFg7XG4gICAgICAgICAgICBsYXN0WSA9IGUuY2xpZW50WTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0RyYWdnaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVsdGFYID0gZS5jbGllbnRYIC0gbGFzdFg7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVsdGFZID0gZS5jbGllbnRZIC0gbGFzdFk7XG4gICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRYICs9IGRlbHRhWCAvICh0aGlzLmNhbnZhcy53aWR0aCAqIHRoaXMuc2NhbGUpO1xuICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0WSArPSBkZWx0YVkgLyAodGhpcy5jYW52YXMuaGVpZ2h0ICogdGhpcy5zY2FsZSk7XG4gICAgICAgICAgICAgICAgbGFzdFggPSBlLmNsaWVudFg7XG4gICAgICAgICAgICAgICAgbGFzdFkgPSBlLmNsaWVudFk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcbiAgICAgICAgICAgIGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3Qgem9vbUZhY3RvciA9IGUuZGVsdGFZID4gMCA/IDAuOSA6IDEuMTtcbiAgICAgICAgICAgIHRoaXMuc2NhbGUgKj0gem9vbUZhY3RvcjtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENoYXJ0LCBQb2ludCB9IGZyb20gJy4vQ2hhcnQnO1xuaW1wb3J0IHsgV2ViR0xSZW5kZXJlciB9IGZyb20gJy4vV2ViR0xSZW5kZXJlcic7XG5cbmV4cG9ydCBjbGFzcyBMaW5lQ2hhcnQgZXh0ZW5kcyBDaGFydCB7XG4gICAgcHJpdmF0ZSByZW5kZXJlcjogV2ViR0xSZW5kZXJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGRhdGE6IFBvaW50W10pIHtcbiAgICAgICAgc3VwZXIoY29udGFpbmVyLCBkYXRhKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBXZWJHTFJlbmRlcmVyKHRoaXMuZ2wpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5jYW52YXM7XG4gICAgICAgIHRoaXMuZ2wudmlld3BvcnQoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMuZ2wuY2xlYXIodGhpcy5nbC5DT0xPUl9CVUZGRVJfQklUKTtcblxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZERhdGEgPSB0aGlzLnRyYW5zZm9ybURhdGEoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5kcmF3TGluZXModHJhbnNmb3JtZWREYXRhKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyYW5zZm9ybURhdGEoKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuY2FudmFzO1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZERhdGE6IG51bWJlcltdID0gW107XG5cbiAgICAgICAgY29uc3QgeE1pbiA9IE1hdGgubWluKC4uLnRoaXMuZGF0YS5tYXAocCA9PiBwLngpKTtcbiAgICAgICAgY29uc3QgeE1heCA9IE1hdGgubWF4KC4uLnRoaXMuZGF0YS5tYXAocCA9PiBwLngpKTtcbiAgICAgICAgY29uc3QgeU1pbiA9IE1hdGgubWluKC4uLnRoaXMuZGF0YS5tYXAocCA9PiBwLnkpKTtcbiAgICAgICAgY29uc3QgeU1heCA9IE1hdGgubWF4KC4uLnRoaXMuZGF0YS5tYXAocCA9PiBwLnkpKTtcblxuICAgICAgICBjb25zdCB4UmFuZ2UgPSB4TWF4IC0geE1pbjtcbiAgICAgICAgY29uc3QgeVJhbmdlID0geU1heCAtIHlNaW47XG5cbiAgICAgICAgZm9yIChjb25zdCBwb2ludCBvZiB0aGlzLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHggPSAoKChwb2ludC54IC0geE1pbikgLyB4UmFuZ2UpICogMiAtIDEpICogdGhpcy5zY2FsZSArIHRoaXMub2Zmc2V0WCAqIDI7XG4gICAgICAgICAgICBjb25zdCB5ID0gKCgocG9pbnQueSAtIHlNaW4pIC8geVJhbmdlKSAqIDIgLSAxKSAqIHRoaXMuc2NhbGUgLSB0aGlzLm9mZnNldFkgKiAyO1xuICAgICAgICAgICAgdHJhbnNmb3JtZWREYXRhLnB1c2goeCwgeSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWREYXRhO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBXZWJHTFJlbmRlcmVyIHtcbiAgICBwcml2YXRlIGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBwcm9ncmFtOiBXZWJHTFByb2dyYW07XG5cbiAgICBjb25zdHJ1Y3RvcihnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gdGhpcy5jcmVhdGVQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVQcm9ncmFtKCk6IFdlYkdMUHJvZ3JhbSB7XG4gICAgICAgIGNvbnN0IHZlcnRleFNoYWRlciA9IHRoaXMuY3JlYXRlU2hhZGVyKHRoaXMuZ2wuVkVSVEVYX1NIQURFUiwgYFxuICAgICAgICAgICAgYXR0cmlidXRlIHZlYzIgYV9wb3NpdGlvbjtcbiAgICAgICAgICAgIGF0dHJpYnV0ZSB2ZWMyIGFfb2Zmc2V0O1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjtcbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWMyIHBvc2l0aW9uID0gYV9wb3NpdGlvbiArIGFfb2Zmc2V0O1xuICAgICAgICAgICAgICAgIHZlYzIgemVyb1RvT25lID0gcG9zaXRpb24gLyB1X3Jlc29sdXRpb247XG4gICAgICAgICAgICAgICAgdmVjMiB6ZXJvVG9Ud28gPSB6ZXJvVG9PbmUgKiAyLjA7XG4gICAgICAgICAgICAgICAgdmVjMiBjbGlwU3BhY2UgPSB6ZXJvVG9Ud28gLSAxLjA7XG4gICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KGNsaXBTcGFjZSAqIHZlYzIoMSwgLTEpLCAwLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYCk7XG5cbiAgICAgICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSB0aGlzLmNyZWF0ZVNoYWRlcih0aGlzLmdsLkZSQUdNRU5UX1NIQURFUiwgYFxuICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG4gICAgICAgICAgICB1bmlmb3JtIHZlYzQgdV9jb2xvcjtcbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB1X2NvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICBgKTtcblxuICAgICAgICBjb25zdCBwcm9ncmFtID0gdGhpcy5nbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgICAgIGlmICghcHJvZ3JhbSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIFdlYkdMIHByb2dyYW0nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleFNoYWRlcik7XG4gICAgICAgIHRoaXMuZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcbiAgICAgICAgdGhpcy5nbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICBpZiAoIXRoaXMuZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCB0aGlzLmdsLkxJTktfU1RBVFVTKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gbGluayBXZWJHTCBwcm9ncmFtOiAnICsgdGhpcy5nbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVNoYWRlcih0eXBlOiBudW1iZXIsIHNvdXJjZTogc3RyaW5nKTogV2ViR0xTaGFkZXIge1xuICAgICAgICBjb25zdCBzaGFkZXIgPSB0aGlzLmdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcbiAgICAgICAgaWYgKCFzaGFkZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBXZWJHTCBzaGFkZXInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc291cmNlKTtcbiAgICAgICAgdGhpcy5nbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG5cbiAgICAgICAgaWYgKCF0aGlzLmdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIHRoaXMuZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBjb21waWxlIFdlYkdMIHNoYWRlcjogJyArIHRoaXMuZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdMaW5lcyhkYXRhOiBudW1iZXJbXSk6IHZvaWQge1xuICAgICAgICB0aGlzLmdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbkJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgcG9zaXRpb25CdWZmZXIpO1xuICAgICAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDEsIDBdKSwgdGhpcy5nbC5TVEFUSUNfRFJBVyk7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25BdHRyaWJ1dGVMb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCAnYV9wb3NpdGlvbicpO1xuICAgICAgICB0aGlzLmdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHBvc2l0aW9uQXR0cmlidXRlTG9jYXRpb24pO1xuICAgICAgICB0aGlzLmdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zaXRpb25BdHRyaWJ1dGVMb2NhdGlvbiwgMiwgdGhpcy5nbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuXG4gICAgICAgIGNvbnN0IG9mZnNldEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgb2Zmc2V0QnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGRhdGEpLCB0aGlzLmdsLlNUQVRJQ19EUkFXKTtcblxuICAgICAgICBjb25zdCBvZmZzZXRBdHRyaWJ1dGVMb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCAnYV9vZmZzZXQnKTtcbiAgICAgICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShvZmZzZXRBdHRyaWJ1dGVMb2NhdGlvbik7XG4gICAgICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcihvZmZzZXRBdHRyaWJ1dGVMb2NhdGlvbiwgMiwgdGhpcy5nbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuXG4gICAgICAgIGNvbnN0IHJlc29sdXRpb25Vbmlmb3JtTG9jYXRpb24gPSB0aGlzLmdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sICd1X3Jlc29sdXRpb24nKTtcbiAgICAgICAgdGhpcy5nbC51bmlmb3JtMmYocmVzb2x1dGlvblVuaWZvcm1Mb2NhdGlvbiwgdGhpcy5nbC5jYW52YXMud2lkdGgsIHRoaXMuZ2wuY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgY29uc3QgY29sb3JVbmlmb3JtTG9jYXRpb24gPSB0aGlzLmdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sICd1X2NvbG9yJyk7XG4gICAgICAgIHRoaXMuZ2wudW5pZm9ybTRmKGNvbG9yVW5pZm9ybUxvY2F0aW9uLCAwLCAwLCAxLCAxKTtcblxuICAgICAgICBjb25zdCBleHQgPSB0aGlzLmdsLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpO1xuICAgICAgICBpZiAoIWV4dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzIGV4dGVuc2lvbiBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBleHQudmVydGV4QXR0cmliRGl2aXNvckFOR0xFKG9mZnNldEF0dHJpYnV0ZUxvY2F0aW9uLCAxKTtcbiAgICAgICAgZXh0LmRyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSh0aGlzLmdsLkxJTkVTLCAwLCAyLCBkYXRhLmxlbmd0aCAvIDIgLSAxKTtcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IExpbmVDaGFydCB9IGZyb20gJy4vTGluZUNoYXJ0JztcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnQtY29udGFpbmVyJyk7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignQ2hhcnQgY29udGFpbmVyIG5vdCBmb3VuZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YSA9IFtcbiAgICAgICAgeyB4OiAwLCB5OiAxMCB9LFxuICAgICAgICB7IHg6IDEsIHk6IDE1IH0sXG4gICAgICAgIHsgeDogMiwgeTogNyB9LFxuICAgICAgICB7IHg6IDMsIHk6IDIwIH0sXG4gICAgICAgIHsgeDogNCwgeTogMTIgfSxcbiAgICAgICAgeyB4OiA1LCB5OiAxOCB9LFxuICAgIF07XG5cbiAgICBjb25zdCBjaGFydCA9IG5ldyBMaW5lQ2hhcnQoY29udGFpbmVyLCBkYXRhKTtcbiAgICBjaGFydC5yZW5kZXIoKTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9