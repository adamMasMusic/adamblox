// ==UserScript==
// @name         Adamblox — Home & Presence
// @namespace    https://github.com/adamMasMusic/adamblox
// @version      2.0
// @description  Presence rings on friend avatars + home page glass UI for roblox.com
// @author       adamMasMusic
// @match        https://www.roblox.com/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/adamMasMusic/adamblox/main/adamblox-home.user.js
// @downloadURL  https://raw.githubusercontent.com/adamMasMusic/adamblox/main/adamblox-home.user.js
// ==/UserScript==

(function () {
  "use strict";

  /* ================================================================
     PRESENCE RINGS  (ui.js)
  ================================================================ */

  GM_addStyle(`
    .friends-carousel-tile {
      padding-top: 20px;
      padding-bottom: 10px;
    }

    .friend-tile-content .avatar-card-fullbody {
      overflow: visible !important;
    }

    .friend-tile-content .thumbnail-2d-container {
      position: relative;
      border-radius: 50%;
      display: inline-block;
      overflow: visible !important;
    }

    .friend-tile-content .thumbnail-2d-container img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 50%;
      object-fit: cover;
    }

    .btr-presence-ring {
      position: absolute;
      top: -8px; left: -8px; right: -8px; bottom: -8px;
      border-radius: 50%;
      pointer-events: none;
      transition: 0.3s ease;
      border: 6px solid currentColor;
    }

    .btr-ring-online {
      color: #7289da;
      box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset;
    }
    .btr-ring-ingame {
      color: #43b581;
      box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset;
    }
    .btr-ring-studio {
      color: #f39c12;
      box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset;
    }
    .btr-ring-offline {
      color: #6c7377;
      box-shadow: none;
    }

    .friends-carousel-tile {
      margin: 0 4px !important;
    }

    .friends-carousel-container {
      padding-left: 4px !important;
      padding-right: 4px !important;
    }

    /* Floating Create Dashboard button */
    #adamblox-create-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      background: rgba(25, 27, 29, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 24px;
      padding: 9px 18px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #e0e0e0;
      text-decoration: none;
      font-size: 13px;
      font-family: inherit;
      font-weight: 500;
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
      transition: all 0.2s ease;
      cursor: pointer;
      user-select: none;
    }
    #adamblox-create-btn:hover {
      background: rgba(45, 48, 53, 0.95);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 5px 18px rgba(0, 0, 0, 0.45);
      color: #ffffff;
      text-decoration: none;
    }
    #adamblox-create-btn svg { flex-shrink: 0; opacity: 0.8; }
    #adamblox-create-btn:hover svg { opacity: 1; }
  `);

  const presenceMap = {
    game: "btr-ring-ingame",
    studio: "btr-ring-studio",
    online: "btr-ring-online",
  };

  function getRingClass(statusEl) {
    if (!statusEl) return "btr-ring-offline";
    const cls = statusEl.className || "";
    for (const key in presenceMap) {
      if (cls.includes(key)) return presenceMap[key];
    }
    return "btr-ring-offline";
  }

  function enhanceFriend(tile) {
    const thumb = tile.querySelector(".thumbnail-2d-container");
    if (!thumb) return;

    const statusEl = tile.querySelector(
      '[data-testid="presence-icon"], .avatar-status span[class*="presence"], .avatar-status span'
    );
    const ringClass = getRingClass(statusEl);

    let ring = thumb.querySelector(".btr-presence-ring");
    if (!ring) {
      ring = document.createElement("div");
      ring.className = "btr-presence-ring " + ringClass;
      thumb.appendChild(ring);
    } else if (!ring.classList.contains(ringClass)) {
      ring.className = "btr-presence-ring " + ringClass;
    }

    const statusContainer = tile.querySelector(".avatar-status");
    if (statusContainer) statusContainer.style.display = "none";
  }

  function updateFriendTiles() {
    const selectors = [
      ".friend-tile-content",
      "[class*='friend-tile']",
      "[data-testid='friend-tile']",
    ];
    for (const sel of selectors) {
      const tiles = document.querySelectorAll(sel);
      if (tiles.length > 0) {
        tiles.forEach((tile) => {
          try { enhanceFriend(tile); } catch (err) {
            console.warn("[adamblox] friend tile enhancement failed:", err);
          }
        });
        return;
      }
    }
  }

  function addCreateFloatingBtn() {
    if (document.getElementById("adamblox-create-btn")) return;
    const btn = document.createElement("a");
    btn.id = "adamblox-create-btn";
    btn.href = "https://create.roblox.com/dashboard/creations?activeTab=Decal";
    btn.target = "_blank";
    btn.title = "Open Create Dashboard";
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>Create`;
    document.body.appendChild(btn);
  }

  const presenceObserver = new MutationObserver(() => {
    requestIdleCallback
      ? requestIdleCallback(updateFriendTiles)
      : setTimeout(updateFriendTiles, 0);
  });

  presenceObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  setInterval(updateFriendTiles, 3000);

  /* ================================================================
     HOME PAGE ENHANCEMENTS  (home.js)
  ================================================================ */

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
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      gap: 16px !important;
      justify-content: flex-start !important;
      align-items: center !important;
      overflow-x: auto !important;
    }

    .friends-carousel-tile {
      flex: 0 0 auto !important;
      width: auto !important;
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

  function waitForElement(selector, callback, timeout) {
    timeout = timeout || 10000;
    const found = document.querySelector(selector);
    if (found) return callback(found);
    let elapsed = 0;
    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) { obs.disconnect(); callback(el); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => obs.disconnect(), timeout);
  }

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

  function findGreetingElement() {
    let el = document.querySelector('[data-testid="home-greeting"], [data-testid="user-greeting"]');
    if (el) return { el, strategy: "testid" };

    el = document.querySelector(".age-bracket-label.text-header");
    if (el) return { el, strategy: "age-bracket" };

    el = document.querySelector(".age-bracket-label");
    if (el) return { el, strategy: "age-bracket-loose" };

    const thumbnails = document.querySelectorAll(".thumbnail-2d-container");
    for (const thumb of thumbnails) {
      const parent = thumb.closest("h1, h2, [class*='greeting'], [class*='welcome'], [class*='header']");
      if (parent) return { el: parent, strategy: "thumbnail-heading" };
    }

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
      console.warn("[adamblox] greeting element not found — Roblox may have updated their home page. Check F12 console: document.querySelector('.age-bracket-label')");
      return;
    }

    const { el: original } = found;
    let userLink = original.querySelector("a");
    let userName = "there";
    let avatarNode = null;

    const userNameEl = original.querySelector(
      ".age-bracket-label-username, [class*='username'], [class*='displayName']"
    );
    if (userNameEl) {
      userName = userNameEl.textContent.trim();
    } else if (userLink) {
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

  /* ---- Init ---- */
  function init() {
    updateFriendTiles();
    addCreateFloatingBtn();

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
