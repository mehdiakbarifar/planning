export function initHeaderClock() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');

    function updateClock() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString();
        const persianDate = now.toLocaleDateString('fa-IR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dateEl.textContent = persianDate;
    }

    updateClock();
    setInterval(updateClock, 1000);
}
