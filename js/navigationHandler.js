// navigationHandler.js

export function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('.section');

    // Set default active section to 'section-a'
    const defaultTab = 'section-a';
    sections.forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(defaultTab);
    if (activeSection) activeSection.classList.add('active');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`.tab-button[data-target="${defaultTab}"]`);
    if (activeButton) activeButton.classList.add('active');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('data-target');
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                console.error("Section not found for target:", target);
            }
        });
    });
}
