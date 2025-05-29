import { initHeaderClock } from './uiHeaderUtils.js';
import { initThemeSwitcher } from './uiThemeUtils.js';
import { restoreScrollPositions, initAutoScroll } from './uiScrollUtils.js';
import { initFontSizeAdjuster } from './uiFontSizeUtils.js';

import { setupCSVLoading } from './csvHandler.js';
import { initCharts } from './chartHandler.js';
import { populateTables } from './tableData.js';

import { adaptToViewport, attachViewportListener } from './viewportManager.js';
import { initTabNavigation } from './navigationHandler.js';
import { initDragResize } from './resizeHandler.js';
import { initSectionFilters } from './filterHandler.js';

import { initMobilePagination } from './mobilePagination.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize header clock, theme, font sizing, and scroll restoration.
    initHeaderClock();
    initThemeSwitcher();
    restoreScrollPositions();
    initFontSizeAdjuster();

    // Load CSV data, populate tables, and initialize charts.
    populateTables();
    setupCSVLoading();
    initCharts();

    // Initialize desktop-specific functionalities.
    initAutoScroll();
    initDragResize();
    initSectionFilters();

    // Adapt layout and initialize mobile tab navigation.
    adaptToViewport();
    initTabNavigation();

    // Initialize mobile pagination after a slight delay.
    if (window.innerWidth < 768 && typeof initMobilePagination === "function") {
        setTimeout(initMobilePagination, 1000);
    }
});

// Attach viewport resize listener.
attachViewportListener();
