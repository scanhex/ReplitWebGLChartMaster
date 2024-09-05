import { LineChart } from './LineChart';

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

    const chart = new LineChart(container, data);
    chart.render();
});
