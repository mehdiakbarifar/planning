// viewportManager.js

export function adaptToViewport() {
    const isMobile = window.innerWidth < 768;
    const grid = document.querySelector('.dashboard-grid');
    const tabs = document.querySelector('.tab-nav');

    if (grid) {
        grid.style.display = isMobile ? 'block' : 'grid';
        grid.style.width = isMobile ? '100%' : 'auto';
    }
    if (tabs) {
        tabs.style.display = isMobile ? 'flex' : 'none';
    }
}

export function attachViewportListener() {
    window.addEventListener('resize', adaptToViewport);
}
