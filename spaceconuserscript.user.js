// ==UserScript==
// @name         SpaceCon Auto Scroll & Refresh (Bottom Detection)
// @namespace    http://tampermonkey.net
// @version      1.3
// @description  Autoscroll and refresh wrapper optimized for Userscripts iOS/iPadOS app
// @match        *://conventions.leapevent.tech/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const REFRESH_INTERVAL = 900000; // Max time: 900 seconds
    const SCROLL_SPEED = 1;          // Pixels per step
    const STEP_INTERVAL = 20;        // Smoothness (milliseconds)

    // --- RETAIN VALUES BETWEEN REFRESHES ---
    // Centralized state container to preserve data across page refreshes
    let scriptState = {
        refreshCount: 0,
        lastRefreshTime: Date.now(),
        customStatus: "active"
    };

    // Load existing values from Safari's local storage environment
    const savedState = localStorage.getItem('spacecon_script_state');
    if (savedState) {
        try {
            scriptState = JSON.parse(savedState);
            console.log("📄 Userscripts App: Loaded saved state", scriptState);
        } catch (e) {
            console.error("❌ Userscripts App: Failed to parse script state", e);
        }
    }

    // Increment tracker loop
    scriptState.refreshCount++;

    // Force Safari/Userscripts to start at the top of the page on load
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Function to handle resetting scroll, saving data, and refreshing
    function resetAndRefresh() {
        clearInterval(scrollTimer);
        clearTimeout(refreshTimeout);

        // Overwrite the single storage key to keep cache footprint at near-zero bytes
        localStorage.setItem('spacecon_script_state', JSON.stringify(scriptState));

        window.scrollTo(0, 0);
        location.reload();
    }

    // 1. Start the slow autoscroll loop
    const scrollTimer = setInterval(() => {
        window.scrollBy(0, SCROLL_SPEED);

        const totalHeight = document.documentElement.scrollHeight;
        const scrolledDistance = window.innerHeight + window.scrollY;

        // Trigger refresh if user is within 2 pixels of the page bottom
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
