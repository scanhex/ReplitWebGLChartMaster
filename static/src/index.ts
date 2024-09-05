import { LineChart } from './LineChart';
import html2canvas from 'html2canvas';

async function captureAndSendScreenshot(name: string) {
    const canvas = await html2canvas(document.body);
    const imageData = canvas.toDataURL('image/png');
    
    try {
        const response = await fetch('/save_screenshot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, imageData }),
        });
        
        if (response.ok) {
            console.log(`Screenshot ${name} saved successfully`);
        } else {
            console.error(`Failed to save screenshot ${name}`);
        }
    } catch (error) {
        console.error(`Error saving screenshot ${name}:`, error);
    }
}

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

    // Add a visual indicator
    const indicator = document.createElement('div');
    indicator.style.position = 'absolute';
    indicator.style.top = '10px';
    indicator.style.left = '10px';
    indicator.style.padding = '5px';
    indicator.style.background = 'rgba(0, 0, 0, 0.5)';
    indicator.style.color = 'white';
    indicator.textContent = 'Original Position';
    container.appendChild(indicator);

    setTimeout(async () => {
        await captureAndSendScreenshot('before_panning');
        
        chart.simulatePanning(0.1, 0.1);
        
        // Wait for a moment to ensure the chart has updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await captureAndSendScreenshot('after_panning');
        
        indicator.textContent = 'Panned Position';
        
        console.log('Panning test complete. Screenshots sent to server.');
    }, 2000);
});
