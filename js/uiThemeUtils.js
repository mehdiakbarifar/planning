export function initThemeSwitcher() {
    const allowedThemes = [
        'theme-dark', 'theme-light', 'theme-midnight',
        'theme-light-colored', 'theme-gray', 'theme-vintage',
        'theme-ocean', 'theme-forest', 'theme-solar', 'theme-crimson'
    ];

    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            if (allowedThemes.includes(theme)) {
                allowedThemes.forEach(t => document.body.classList.remove(t));
                document.body.classList.add(theme);
                localStorage.setItem('selectedTheme', theme);
            }
        });
    });

    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && allowedThemes.includes(savedTheme)) {
        allowedThemes.forEach(t => document.body.classList.remove(t));
        document.body.classList.add(savedTheme);
    } else {
        document.body.classList.add('theme-dark');
    }
}
