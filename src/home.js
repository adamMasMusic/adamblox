// ==UserScript==
// @name         Roblox Home Enhancements (SPA-safe)
// @namespace    adamblox
// @match        *://www.roblox.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  /* ---- Utility ---- */
  function waitForElement(selector, callback, timeout = 10000) {
    const found = document.querySelector(selector);
    if (found) return callback(found);
    let elapsed = 0;
    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) { obs.disconnect(); callback(el); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    // Bail out after timeout so we don't leak observers on page changes
    setTimeout(() => obs.disconnect(), timeout);
  }

  /* ---- Styles ---- */
  GM_addStyle(`
    #HomeContainer {
      max-width: 80% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .secondary-background {
      background-color: rgba(25, 27, 29, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.06);
      backdrop-filter: blur(6px);
      border-radius: 20px !important;
      padding: 10px 20px !important;
      box-sizing: border-box !important;
    }

    .friends-background {
      background-color: rgba(25,27,29,0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.06);
      backdrop-filter: blur(6px);
      border-radius: 20px !important;
      padding: 10px 20px !important;
      box-sizing: border-box !important;
    }

    .friends-carousel-container {
      max-height: 200px !important;
      display: block !important;
      overflow: visible !important;
      position: relative !important;
      padding: 20px !important;
      margin-bottom: 40px !important;
    }

    .friends-carousel-container::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 20px;
      background: rgba(25,27,29,0.3);
      z-index: -1;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.06);
      backdrop-filter: blur(6px);
    }

    .friend-tile-content .avatar-card-fullbody { margin-bottom: 15px; }
    .pinned { margin-top: 40px !important; }

    .friends-carousel-list-container,
    .friends-carousel-list-container-not-full {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)) !important;
      gap: 10px !important;
    }

    .games-padding { margin-top: 80px !important; }

    .expand-home-content,
    .game-home-page-container {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    [data-testid="game-carousel"] {
      background-color: rgba(25,27,29,0.3) !important;
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.06);
      backdrop-filter: blur(6px);
      border-radius: 20px !important;
      padding: 1rem 1.5rem !important;
      box-sizing: border-box !important;
      overflow: clip !important;
      width: 100% !important;
      margin: 0 auto 40px auto !important;
    }

    [data-testid="game-grid"] {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(clamp(150px, 14vw, 800px), 1fr)) !important;
      gap: 1.2rem !important;
      padding-left: 1rem !important;
      padding-right: 1.8rem !important;
      justify-content: center !important;
      align-items: start !important;
      width: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      margin-bottom: 40px !important;
    }

    [data-testid="wide-game-tile"],
    [data-testid="wide-game-tile"] *,
    .hover-game-tile,
    .hover-game-tile * {
      transform: none !important;
      transition: none !important;
    }

    .user-greeting-header {
      background-size: cover;
      background-position: center;
      transition: background-image 0.3s ease;
      display: flex !important;
      align-items: center !important;
      background-color: rgba(25,27,29,0.3) !important;
      border-radius: 20px !important;
      padding: 24px 32px !important;
      margin-bottom: 1.5rem !important;
      width: 100% !important;
      box-sizing: border-box !important;
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.06);
      backdrop-filter: blur(6px);
    }

    .user-greeting-link {
      display: flex !important;
      align-items: center !important;
      gap: 20px !important;
      text-decoration: none !important;
      color: #ffffff !important;
      font-size: 1.8rem !important;
      font-weight: 600 !important;
    }

    .user-greeting-link:hover { color: #9acdff !important; }

    .user-greeting-link .avatar,
    .user-greeting-link .thumbnail-2d-container,
    .user-greeting-link img {
      width: 72px !important;
      height: 72px !important;
      border-radius: 50% !important;
      object-fit: cover !important;
    }
  `);

  /* ---- Functional helpers ---- */
  function applyStyleToGameGrids() {
    document.querySelectorAll('[data-testid="game-grid"]').forEach((grid) => {
      if (!grid.classList.contains("secondary-background"))
        grid.classList.add("secondary-background");
    });
  }

  function resetGameGrids() {
    document.querySelectorAll('[data-testid="game-grid"]').forEach((grid) => {
      grid.style.removeProperty("--items-per-row");
      grid.style.removeProperty("grid-template-columns");
      grid.style.removeProperty("padding-left");
    });
  }

  function hideIncompleteRows() {
    document.querySelectorAll('[data-testid="game-grid"]').forEach((grid) => {
      const tiles = [...grid.querySelectorAll('[data-testid="wide-game-tile"]')];
      const perRow = 4;
      const remainder = tiles.length % perRow;
      tiles.forEach((tile) => (tile.style.display = ""));
      if (remainder > 0) {
        for (let i = 0; i < remainder; i++) {
          const tile = tiles[tiles.length - 1 - i];
          if (tile) tile.style.display = "none";
        }
      }
    });
  }

  /* ---- Greeting logic ---- */
  /**
   * Tries multiple selector strategies to find the home page greeting element.
   * Roblox has changed this element's class name several times.
   * Returns the element and extracted data, or null if nothing found.
   */
  function findGreetingElement() {
    // Strategy 1: modern data-testid (most stable)
    let el = document.querySelector('[data-testid="home-greeting"], [data-testid="user-greeting"]');
    if (el) return { el, strategy: "testid" };

    // Strategy 2: old class names
    el = document.querySelector(".age-bracket-label.text-header");
    if (el) return { el, strategy: "age-bracket" };

    // Strategy 3: broader old class
    el = document.querySelector(".age-bracket-label");
    if (el) return { el, strategy: "age-bracket-loose" };

    // Strategy 4: look for a heading that contains a thumbnail (greeting structure)
    const thumbnails = document.querySelectorAll(".thumbnail-2d-container");
    for (const thumb of thumbnails) {
      const parent = thumb.closest("h1, h2, [class*='greeting'], [class*='welcome'], [class*='header']");
      if (parent) return { el: parent, strategy: "thumbnail-heading" };
    }

    // Strategy 5: scan for a heading with the user's display name near the top of #HomeContainer
    const homeContainer = document.querySelector("#HomeContainer");
    if (homeContainer) {
      const firstHeading = homeContainer.querySelector("h1, h2, h3");
      if (firstHeading && firstHeading.querySelector(".thumbnail-2d-container, img[alt]")) {
        return { el: firstHeading, strategy: "first-heading" };
      }
    }

    return null;
  }

  function makeGreeting() {
    if (document.querySelector(".user-greeting-header")) return;

    const found = findGreetingElement();
    if (!found) {
      console.warn("[adamblox] greeting element not found — Roblox may have updated their home page. Open F12 and run: document.querySelector('.age-bracket-label') to check.");
      return;
    }

    const { el: original, strategy } = found;

    // Extract user info depending on which strategy found the element
    let userLink = original.querySelector("a");
    let userName = "there";
    let avatarNode = null;

    const userNameEl = original.querySelector(
      ".age-bracket-label-username, [class*='username'], [class*='displayName']"
    );
    if (userNameEl) {
      userName = userNameEl.textContent.trim();
    } else if (userLink) {
      // Try to get username from the link text (strip avatar alt text)
      const clone = userLink.cloneNode(true);
      clone.querySelectorAll("img, [aria-hidden='true']").forEach(n => n.remove());
      const text = clone.textContent.trim();
      if (text) userName = text;
    }

    const avatarContainer = original.querySelector(".thumbnail-2d-container");
    avatarNode = avatarContainer ? avatarContainer.parentElement : null;

    const hour = new Date().getHours();
    const part = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 22 ? "Evening" : "Night";

    const header = document.createElement("div");
    header.className = "user-greeting-header";

    const link = document.createElement("a");
    link.href = userLink?.href || "#";
    link.className = "user-greeting-link";

    if (avatarNode) link.appendChild(avatarNode);
    const text = document.createElement("span");
    text.className = "user-greeting-text";
    text.textContent = `${part}, ${userName}`;
    link.appendChild(text);
    header.appendChild(link);

    original.remove();
    const home = document.querySelector("#HomeContainer") || document.body;
    home.insertBefore(header, home.firstChild);

    enableGreetingBackgroundDrop();
  }

  function enableGreetingBackgroundDrop() {
    const header = document.querySelector(".user-greeting-header");
    if (!header) return;

    const saved = localStorage.getItem("userGreetingBackground");
    if (saved) {
      header.style.backgroundImage = `url(${saved})`;
      header.style.backgroundSize = "cover";
      header.style.backgroundPosition = "center";
    }

    const resetOutline = () => (header.style.outline = "none");
    header.addEventListener("dragenter", (e) => { e.preventDefault(); header.style.outline = "3px dashed #9acdff"; });
    header.addEventListener("dragover", (e) => e.preventDefault());
    header.addEventListener("dragleave", (e) => { e.preventDefault(); resetOutline(); });
    header.addEventListener("drop", (e) => {
      e.preventDefault();
      resetOutline();
      const file = e.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        header.style.backgroundImage = `url(${dataUrl})`;
        header.style.backgroundSize = "cover";
        header.style.backgroundPosition = "center";
        localStorage.setItem("userGreetingBackground", dataUrl);
      };
      reader.readAsDataURL(file);
    });
    header.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      header.style.backgroundImage = "";
      localStorage.removeItem("userGreetingBackground");
    });
  }

  /* ---- SPA route detection ---- */
  let currentPath = location.pathname;

  const handleRouteChange = () => {
    const path = location.pathname;
    if (path === currentPath) return;
    currentPath = path;

    if (path === "/home") {
      makeGreeting();
    } else {
      const greeting = document.querySelector(".user-greeting-header");
      if (greeting) greeting.remove();
    }
  };

  window.addEventListener("popstate", handleRouteChange);
  setInterval(() => {
    if (location.pathname !== currentPath) handleRouteChange();
  }, 1000);

  /* ---- Initial page-specific setup ---- */
  if (location.pathname === "/home") {
    makeGreeting();

    waitForElement(".groups-showcase", (g) => g.classList.add("games-padding"));
    waitForElement(".friends-carousel-container", (f) => f.classList.add("friends-background"));

    waitForElement("div.game-sort-carousel-wrapper:nth-child(2)", (games) => {
      const checkAndApply = () => {
        const block = document.querySelector("div.col-xs-12:nth-child(2)");
        if (!block) games.classList.add("games-padding");
        else games.classList.remove("games-padding");
      };
      checkAndApply();
      const obs = new MutationObserver(checkAndApply);
      obs.observe(document.body, { childList: true, subtree: true });
    });

    waitForElement("#HomeContainer", (home) => home.classList.add("home-width"));
    waitForElement("div.col-xs-12:nth-child(2)", (pinned) => pinned.classList.add("pinned"));

    applyStyleToGameGrids();
    new MutationObserver(applyStyleToGameGrids).observe(document.body, { childList: true, subtree: true });
    resetGameGrids();
    new MutationObserver(resetGameGrids).observe(document.body, { childList: true, subtree: true });
    hideIncompleteRows();
    new MutationObserver(hideIncompleteRows).observe(document.body, { childList: true, subtree: true });

    waitForElement(".section", (sec) => sec.remove());
  } else {
    applyStyleToGameGrids();
  }
})();
