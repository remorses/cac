// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to the elements
    const demoButton = document.getElementById('demo-button');
    const resultText = document.getElementById('result-text');
    
    // Counter to track number of clicks
    let clickCount = 0;
    
    // Add click event listener to the button
    demoButton.addEventListener('click', function() {
        // Increment click counter
        clickCount++;
        
        // Update the result text
        if (clickCount === 1) {
            resultText.textContent = 'You clicked the button 1 time!';
        } else {
            resultText.textContent = `You clicked the button ${clickCount} times!`;
        }
        
        // Change button color randomly on each click for visual effect
        const randomColor = getRandomColor();
        demoButton.style.backgroundColor = randomColor;
        
        // Add animation class
        resultText.classList.add('highlight');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            resultText.classList.remove('highlight');
        }, 1000);
    });
    
    // Function to generate a random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    // Add a style for the highlight animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes highlight {
            0% { color: #4a6fa5; }
            50% { color: #ff6b6b; font-size: 1.1em; }
            100% { color: #4a6fa5; }
        }
        
        .highlight {
            animation: highlight 1s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Add a console message
    console.log('Example website script loaded successfully!');
});