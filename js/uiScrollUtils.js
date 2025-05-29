export function restoreScrollPositions() {
    const containers = document.querySelectorAll('.scrollable-table');
    containers.forEach(container => {
        const id = container.id;
        const savedPos = localStorage.getItem('scrollPos_' + id);
        if (savedPos) container.scrollTop = parseInt(savedPos, 10);

        container.addEventListener('scroll', () => {
            localStorage.setItem('scrollPos_' + id, container.scrollTop);
        });
    });
}

export function initAutoScroll() {
    const containers = document.querySelectorAll('.scrollable-table');

    containers.forEach(container => {
        if (!container.dataset.duplicated) {
            container.innerHTML += container.innerHTML; // duplicate content once for seamless looping
            container.dataset.duplicated = "true";
        }

        let paused = false;
        container.addEventListener('mouseenter', () => { paused = true; });
        container.addEventListener('mouseleave', () => { paused = false; });

        const speed = 0.5;
        function scrollStep() {
            if (!paused) {
                container.scrollTop += speed;
                const resetThreshold = container.scrollHeight - container.clientHeight;
                if (container.scrollTop >= resetThreshold) {
                    container.scrollTop = 0;
                }
            }
            requestAnimationFrame(scrollStep);
        }
        requestAnimationFrame(scrollStep);
    });
}
