// appInit.js

import {
    initHeaderClock,
    initThemeSwitcher,
    initFontSizeAdjuster,
    restoreScrollPositions,
    initAutoScroll
} from './uiUtils.js';
import { setupCSVLoading } from './csvHandler.js';
import { initCharts } from './chartHandler.js';
import { populateTables } from './tableData.js';

import { adaptToViewport, attachViewportListener } from './viewportManager.js';
import { initTabNavigation } from './navigationHandler.js';
import { initDragResize } from './resizeHandler.js';
import { initSectionFilters } from './filterHandler.js';

// Optional: Mobile pagination (stub)
import { initMobilePagination } from './mobilePagination.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize header, theme, font, and scroll restoration
    initHeaderClock();
    initThemeSwitcher();
    restoreScrollPositions();
    initFontSizeAdjuster();

    // Load CSV data, populate tables, and initialize charts
    populateTables();
    setupCSVLoading();
    initCharts();

    // Desktop-only functionalities
    initAutoScroll();
    initDragResize();
    initSectionFilters();

    // Adapt layout and initialize mobile tab navigation
    adaptToViewport();
    initTabNavigation();

    // If on mobile, initialize pagination (using a timeout as a fallback)
    if (window.innerWidth < 768 && typeof initMobilePagination === "function") {
        setTimeout(initMobilePagination, 1000);
    }
});

// Attach viewport resize listener
attachViewportListener();
