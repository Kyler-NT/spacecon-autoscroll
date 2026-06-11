// ==UserScript==
// @name         SpaceCon Auto Scroll & Refresh (Bottom Detection)Small Cache
// @namespace    http://tampermonkey.net
// @version      1.2
// @match        https://conventions.leapevent.tech/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const REFRESH_INTERVAL = 900000; // Max time: 900 seconds
    const SCROLL_SPEED = 1;          // Pixels per step
    const STEP_INTERVAL = 20;        // Smoothness (milliseconds)

    // --- RETAIN VALUES BETWEEN REFRESHES ---
    // Example state object. Add any values you want to track here.
    let scriptState = {
        refreshCount: 0,
        lastRefreshTime: Date.now(),
        customStatus: "active"
    };

    // Load existing values if they exist in localStorage
    const savedState = localStorage.getItem('spacecon_script_state');
    if (savedState) {
        try {
            scriptState = JSON.parse(savedState);
            console.log("🔄 Loaded saved state:", scriptState);
        } catch (e) {
            console.error("❌ Failed to parse script state", e);
        }
    }

    // Example of updating a value during this run
    scriptState.refreshCount++;

    // Force the browser to start at the top of the page on load
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Function to handle resetting scroll, saving data, and refreshing
    function resetAndRefresh() {
        clearInterval(scrollTimer);
        clearTimeout(refreshTimeout);

        // Save the values right before the refresh happens
        localStorage.setItem('spacecon_script_state', JSON.stringify(scriptState));

        window.scrollTo(0, 0); // Ensure next load starts at top
        location.reload();
    }

    // 1. Start the slow autoscroll loop
    const scrollTimer = setInterval(() => {
        window.scrollBy(0, SCROLL_SPEED);

        // Check if we reached the bottom of the page
        const totalHeight = document.documentElement.scrollHeight;
        const scrolledDistance = window.innerHeight + window.scrollY;

        // If we are within 2 pixels of the bottom, trigger refresh early
        if (scrolledDistance >= totalHeight - 2) {
            console.log("⬇️ Reached bottom of page. Refreshing...");
            resetAndRefresh();
        }
    }, STEP_INTERVAL);

    // 2. Safety fallback: Force refresh after 900 seconds regardless of position
    const refreshTimeout = setTimeout(() => {
        console.log("⏱️ 900 seconds elapsed. Refreshing...");
        resetAndRefresh();
    }, REFRESH_INTERVAL);
})();
