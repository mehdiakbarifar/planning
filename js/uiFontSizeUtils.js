export function initFontSizeAdjuster() {
    const increaseBtn = document.getElementById('increase-font');
    const decreaseBtn = document.getElementById('decrease-font');
    let currentFontSize = parseFloat(localStorage.getItem('contentFontSize')) || 1;
    document.documentElement.style.setProperty('--content-font-size', currentFontSize + 'rem');

    increaseBtn.addEventListener('click', () => {
        currentFontSize += 0.1;
        document.documentElement.style.setProperty('--content-font-size', currentFontSize.toFixed(1) + 'rem');
        localStorage.setItem('contentFontSize', currentFontSize.toFixed(1));
    });

    decreaseBtn.addEventListener('click', () => {
        currentFontSize = Math.max(0.5, currentFontSize - 0.1);
        document.documentElement.style.setProperty('--content-font-size', currentFontSize.toFixed(1) + 'rem');
        localStorage.setItem('contentFontSize', currentFontSize.toFixed(1));
    });
}
