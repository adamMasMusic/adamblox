// ==UserScript==
// @name         Adamblox
// @namespace    https://github.com/adamMasMusic/adamblox
// @version      2.4
// @description  Theme, presence rings, home UI, decal uploader — all in one
// @author       adamMasMusic
// @match        https://www.roblox.com/*
// @match        https://create.roblox.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      apis.roblox.com
// @updateURL    https://raw.githubusercontent.com/adamMasMusic/adamblox/main/main.user.js
// @downloadURL  https://raw.githubusercontent.com/adamMasMusic/adamblox/main/main.user.js
// ==/UserScript==

/* ============================================================
   THEME — roblox.com
============================================================ */
if (location.hostname === 'www.roblox.com') {
  GM_addStyle(`
    html, body {
      background: linear-gradient(135deg, #6b075e, #181218) fixed !important;
      background-size: cover !important;
    }

    /* Left sidebar */
    .left-nav {
      background-color: rgba(25, 27, 29, 0.55) !important;
      border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(12px) !important;
    }

    /* Top navbar / header */
    #header,
    .navbar-header {
      background-color: rgba(25, 27, 29, 0.5) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(10px) !important;
    }

    /* Footer */
    .container-footer {
      background-color: rgba(25, 27, 29, 0.5) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(8px) !important;
    }

    /* Catalog item cards — give them glass look without breaking thumbnails */
    .dark-theme #catalog-react-container .catalog-revamp .catalog-item-container .item-card-thumb-container {
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      border-radius: 12px !important;
    }

    /* Chat header */
    .dark-theme .chat-container .chat-main .chat-header {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 20px !important;
    }

    /* MUI drawer / paper / menu */
    [class*="drawerPaper"], [class*="DrawerPaper"],
    [class*="selectMenu"], [class*="SelectMenu"],
    [class*="Menu-paper"], [class*="menuPaper"],
    [class*="railContainer"] {
      background-color: rgba(25, 27, 29, 0.45) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      backdrop-filter: blur(8px) !important;
      border-radius: 16px !important;
    }
  `);
}

/* ============================================================
   PRESENCE RINGS + FLOATING CREATE BTN — roblox.com
============================================================ */
if (location.hostname === 'www.roblox.com') {
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
    .btr-ring-online  { color: #7289da; box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset; }
    .btr-ring-ingame  { color: #43b581; box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset; }
    .btr-ring-studio  { color: #f39c12; box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset; }
    .btr-ring-offline { color: #6c7377; box-shadow: none; }

    .friends-carousel-container {
      padding-left: 4px !important;
      padding-right: 4px !important;
      overflow: visible !important;
    }

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
      box-shadow: 0 2px 14px rgba(0,0,0,0.35);
      transition: all 0.2s ease;
      cursor: pointer;
      user-select: none;
    }
    #adamblox-create-btn:hover {
      background: rgba(45, 48, 53, 0.95);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 5px 18px rgba(0,0,0,0.45);
      color: #ffffff;
      text-decoration: none;
    }
    #adamblox-create-btn svg { flex-shrink: 0; opacity: 0.8; }
    #adamblox-create-btn:hover svg { opacity: 1; }
  `);

  (function () {
    "use strict";

    const presenceMap = { game: "btr-ring-ingame", studio: "btr-ring-studio", online: "btr-ring-online" };

    function getRingClass(el) {
      if (!el) return "btr-ring-offline";
      const cls = el.className || "";
      for (const key in presenceMap) { if (cls.includes(key)) return presenceMap[key]; }
      return "btr-ring-offline";
    }

    function enhanceFriend(tile) {
      const thumb = tile.querySelector(".thumbnail-2d-container");
      if (!thumb) return;
      const statusEl = tile.querySelector('[data-testid="presence-icon"], .avatar-status span[class*="presence"], .avatar-status span');
      const ringClass = getRingClass(statusEl);
      let ring = thumb.querySelector(".btr-presence-ring");
      if (!ring) {
        ring = document.createElement("div");
        ring.className = "btr-presence-ring " + ringClass;
        thumb.appendChild(ring);
      } else if (!ring.classList.contains(ringClass)) {
        ring.className = "btr-presence-ring " + ringClass;
      }
      const sc = tile.querySelector(".avatar-status");
      if (sc) sc.style.display = "none";
    }

    function updateFriendTiles() {
      for (const sel of [".friend-tile-content", "[class*='friend-tile']", "[data-testid='friend-tile']"]) {
        const tiles = document.querySelectorAll(sel);
        if (tiles.length) { tiles.forEach(t => { try { enhanceFriend(t); } catch(e) {} }); return; }
      }
    }

    function addCreateBtn() {
      if (document.getElementById("adamblox-create-btn")) return;
      const btn = document.createElement("a");
      btn.id = "adamblox-create-btn";
      btn.href = "https://create.roblox.com/dashboard/creations?activeTab=Decal";
      btn.target = "_blank";
      btn.title = "Open Create Dashboard";
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>Create`;
      document.body.appendChild(btn);
    }

    new MutationObserver(() => {
      (typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : setTimeout)(updateFriendTiles);
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    setInterval(updateFriendTiles, 3000);

    const go = () => { updateFriendTiles(); addCreateBtn(); };
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
  })();
}

/* ============================================================
   HOME PAGE ENHANCEMENTS — roblox.com
============================================================ */
if (location.hostname === 'www.roblox.com') {
  GM_addStyle(`
    #HomeContainer {
      max-width: 80% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .friends-background {
      background-color: rgba(25,27,29,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.06);
      backdrop-filter: blur(6px);
      border-radius: 20px !important;
      padding: 10px 20px 20px !important;
      box-sizing: border-box !important;
      margin-bottom: 32px !important;
    }

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

    /* Glass card on every game section inside the home page container */
    .game-home-page-container > div > div {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 20px !important;
      padding: 1rem 1.5rem !important;
      box-sizing: border-box !important;
      margin-bottom: 24px !important;
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

  (function () {
    "use strict";

    function waitFor(sel, cb, timeout) {
      const el = document.querySelector(sel);
      if (el) return cb(el);
      const obs = new MutationObserver(() => {
        const found = document.querySelector(sel);
        if (found) { obs.disconnect(); cb(found); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => obs.disconnect(), timeout || 12000);
    }

    function applyGameGridStyles() {
      document.querySelectorAll('[data-testid="game-grid"]').forEach(g => {
        if (!g.classList.contains("secondary-background")) g.classList.add("secondary-background");
      });
    }

    function findGreeting() {
      let el = document.querySelector('[data-testid="home-greeting"],[data-testid="user-greeting"]');
      if (el) return el;
      el = document.querySelector(".age-bracket-label.text-header,.age-bracket-label");
      if (el) return el;
      for (const thumb of document.querySelectorAll(".thumbnail-2d-container")) {
        const p = thumb.closest("h1,h2,[class*='greeting'],[class*='welcome'],[class*='header']");
        if (p) return p;
      }
      return null;
    }

    function makeGreeting() {
      if (document.querySelector(".user-greeting-header")) return;
      const original = findGreeting();
      if (!original) {
        console.warn("[adamblox] greeting element not found — run document.querySelector('.age-bracket-label') in F12 to debug");
        return;
      }

      const userLink = original.querySelector("a");
      let userName = "there";
      const nameEl = original.querySelector(".age-bracket-label-username,[class*='username'],[class*='displayName']");
      if (nameEl) {
        userName = nameEl.textContent.trim();
      } else if (userLink) {
        const clone = userLink.cloneNode(true);
        clone.querySelectorAll("img,[aria-hidden='true']").forEach(n => n.remove());
        const t = clone.textContent.trim();
        if (t) userName = t;
      }

      const avatarContainer = original.querySelector(".thumbnail-2d-container");
      const avatarNode = avatarContainer ? avatarContainer.parentElement : null;
      const hour = new Date().getHours();
      const part = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 22 ? "Evening" : "Night";

      const header = document.createElement("div");
      header.className = "user-greeting-header";
      const link = document.createElement("a");
      link.href = userLink?.href || "#";
      link.className = "user-greeting-link";
      if (avatarNode) link.appendChild(avatarNode);
      const span = document.createElement("span");
      span.textContent = `${part}, ${userName}`;
      link.appendChild(span);
      header.appendChild(link);
      original.remove();
      const home = document.querySelector("#HomeContainer") || document.body;
      home.insertBefore(header, home.firstChild);

      // Background drop
      const saved = localStorage.getItem("userGreetingBackground");
      if (saved) { header.style.backgroundImage = `url(${saved})`; header.style.backgroundSize = "cover"; header.style.backgroundPosition = "center"; }
      header.addEventListener("dragenter", e => { e.preventDefault(); header.style.outline = "3px dashed #9acdff"; });
      header.addEventListener("dragover", e => e.preventDefault());
      header.addEventListener("dragleave", e => { e.preventDefault(); header.style.outline = "none"; });
      header.addEventListener("drop", e => {
        e.preventDefault(); header.style.outline = "none";
        const file = e.dataTransfer?.files?.[0];
        if (!file?.type.startsWith("image/")) return;
        const r = new FileReader();
        r.onload = ev => {
          header.style.backgroundImage = `url(${ev.target.result})`;
          header.style.backgroundSize = "cover";
          header.style.backgroundPosition = "center";
          localStorage.setItem("userGreetingBackground", ev.target.result);
        };
        r.readAsDataURL(file);
      });
      header.addEventListener("contextmenu", e => {
        e.preventDefault();
        header.style.backgroundImage = "";
        localStorage.removeItem("userGreetingBackground");
      });
    }

    // SPA route detection
    let currentPath = location.pathname;
    function onRouteChange() {
      const path = location.pathname;
      if (path === currentPath) return;
      currentPath = path;
      if (path === "/home") {
        makeGreeting();
      } else {
        document.querySelector(".user-greeting-header")?.remove();
      }
    }
    window.addEventListener("popstate", onRouteChange);
    setInterval(() => { if (location.pathname !== currentPath) onRouteChange(); }, 1000);

    function initHome() {
      makeGreeting();
      waitFor(".friends-carousel-container", el => el.classList.add("friends-background"));
      waitFor(".groups-showcase", el => el.classList.add("games-padding"));
      waitFor("#HomeContainer", el => el.classList.add("home-width"));
      waitFor(".section", el => el.remove());
      applyGameGridStyles();
      new MutationObserver(applyGameGridStyles).observe(document.body, { childList: true, subtree: true });
    }

    if (location.pathname === "/home") {
      document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", initHome)
        : initHome();
    } else {
      applyGameGridStyles();
    }
  })();
}

/* ============================================================
   DECAL UPLOADER — create.roblox.com
============================================================ */
if (location.hostname === 'create.roblox.com') {
  (function () {
    'use strict';

    let currentUrl = location.href;
    let initialized = false;
    let observers = [];
    let initRetryTimer = null;

    function shouldBeActive() { return location.href.includes('activeTab=Decal'); }

    function cleanup() {
      observers.forEach(o => o.disconnect());
      observers = [];
      if (initRetryTimer) { clearTimeout(initRetryTimer); initRetryTimer = null; }
      document.getElementById('custom-decal-uploader')?.remove();
      document.querySelectorAll('[data-btr-enhanced="true"]').forEach(el => delete el.dataset.btrEnhanced);
      document.querySelectorAll('.btr-copy-texture-btn').forEach(b => b.remove());
      initialized = false;
    }

    GM_addStyle(`
      #custom-decal-uploader {
        background-color: rgba(25, 27, 29, 0.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.06) !important;
        backdrop-filter: blur(6px) !important;
        border-radius: 20px !important;
        padding: 40px;
        text-align: center;
        color: #ffffff;
        transition: all 0.3s ease;
        width: 100%;
        box-sizing: border-box;
        min-height: 200px;
      }
      #custom-decal-uploader.dragover { background: #3c4043; border-color: #00a2ff; }
      .upload-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-top: 20px; }
      .image-preview {
        position: relative; padding: 10px;
        background-color: rgba(25,27,29,0.3) !important;
        border: 1px solid rgba(255,255,255,0.15) !important;
        backdrop-filter: blur(6px) !important;
        border-radius: 8px !important;
      }
      .image-preview img { width: 100%; height: 100px; object-fit: cover; border-radius: 4px; }
      .image-name { font-size: 0.8em; margin: 5px 0; word-break: break-word; color: #ffffff; }
      .status-bar { width: 100%; height: 6px; background: #656668; border-radius: 3px; overflow: hidden; margin-top: 5px; }
      .status-fill { height: 100%; transition: width 0.3s ease; border-radius: 3px; }
      .status-pending  { background: #ffa500; width: 0%; }
      .status-uploading{ background: #00a2ff; width: 50%; }
      .status-success  { background: #00ff88; width: 100%; }
      .status-error    { background: #ff4757; width: 100%; }
      .upload-text { font-size: 1.4em; margin-bottom: 15px; color: #ffffff; font-weight: 500; }
      .upload-info { font-size: 1em; color: #b9bbbe; margin-top: 15px; line-height: 1.5; }
      .api-key-setup {
        padding: 30px; margin: 20px 0; text-align: left;
        background-color: rgba(25,27,29,0.3) !important;
        border: 1px solid rgba(255,255,255,0.15) !important;
        backdrop-filter: blur(6px) !important;
        border-radius: 20px !important;
      }
      .api-key-input {
        width: 100%; padding: 12px; border: 1px solid #656668; border-radius: 6px;
        background: rgba(54,57,63,0.3); color: #ffffff;
        font-family: monospace; font-size: 12px; word-break: break-all; height: 80px; resize: vertical;
      }
      .api-key-buttons { margin-top: 20px; display: flex; gap: 15px; flex-wrap: wrap; }
      .btn { padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95em; display: inline-block; transition: all 0.2s ease; font-weight: 500; }
      .btn-primary  { background: #5865f2; color: white; }
      .btn-primary:hover  { background: #4752c4; transform: translateY(-1px); }
      .btn-secondary{ background: #4f545c; color: white; }
      .btn-secondary:hover{ background: #5d6269; transform: translateY(-1px); }
      .btn-danger   { background: #ed4245; color: white; }
      .btn-danger:hover   { background: #c9302c; transform: translateY(-1px); }
      .api-key-status { margin-top: 15px; font-size: 0.95em; padding: 10px; border-radius: 4px; border-left: 4px solid transparent; }
      .status-valid   { color: #00ff88; background: rgba(0,255,136,0.1); border-left-color: #00ff88; }
      .status-invalid { color: #ff4757; background: rgba(255,71,87,0.1);  border-left-color: #ff4757; }
      .creator-setup  { background: #404249; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .creator-options{ display: flex; gap: 30px; margin: 15px 0; align-items: center; }
      .creator-option { display: flex; align-items: center; gap: 8px; color: #ffffff; cursor: pointer; padding: 8px 12px; border-radius: 6px; transition: background 0.2s ease; }
      .creator-option:hover { background: rgba(255,255,255,0.05); }
      .creator-option input[type="radio"] { margin: 0; transform: scale(1.1); }
      .creator-id-input { width: 100%; padding: 10px; border: 1px solid #656668; border-radius: 6px; background: rgba(54,57,63,0.29); color: #ffffff; font-family: monospace; font-size: 13px; }
      .creator-id-section { margin-top: 15px; }
      .btr-copy-texture-btn {
        display: flex; width: 100%; padding: 8px 12px; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 500; text-align: center;
        border: 1px solid #4a90e2; cursor: pointer; border-radius: 6px; margin-top: 8px;
        background: linear-gradient(135deg, #4a90e2, #357abd); color: #ffffff;
        transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(74,144,226,0.2);
      }
      .btr-copy-texture-btn:hover { background: linear-gradient(135deg, #357abd, #2968a3); transform: translateY(-1px); }
      .btr-copy-texture-btn.copied { background: linear-gradient(135deg, #28a745, #1e7e34); border-color: #28a745; }
    `);

    let uploadQueue = [], completedUploads = 0;
    let apiKey    = localStorage.getItem('adamblox_opencloud_key');
    let creatorType = localStorage.getItem('adamblox_creator_type') || 'user';
    let creatorId = localStorage.getItem('adamblox_creator_id');

    async function fetchAsset(assetId) {
      try {
        const res = await fetch(`https://apis.roblox.com/toolbox-service/v2/assets/${assetId}`, { credentials: "include", headers: { "Accept": "application/json" } });
        return res.ok ? await res.json() : null;
      } catch { return null; }
    }

    function enhanceAssetCards() {
      const selectors = ['[href*="/dashboard/creations/store/"]', '[href*="/creations/store/"]', 'a[href*="/creations/"][href*="/decal"]'];
      const seen = new Set();
      selectors.flatMap(s => [...document.querySelectorAll(s)]).forEach(el => {
        if (seen.has(el) || el.dataset.btrEnhanced) return;
        seen.add(el);
        el.dataset.btrEnhanced = "true";
        const match = el.href.match(/\/(?:store|creations)\/(\d+)/);
        if (!match) return;
        const assetId = match[1];
        const btn = document.createElement("button");
        btn.textContent = "Copy Texture ID";
        btn.className = "btr-copy-texture-btn";
        btn.addEventListener("click", async e => {
          e.preventDefault(); e.stopPropagation();
          try {
            const data = await fetchAsset(assetId);
            if (data?.asset?.textureId) {
              await navigator.clipboard.writeText(data.asset.textureId.toString());
              btn.textContent = "Copied!"; btn.classList.add("copied");
              setTimeout(() => { btn.textContent = "Copy Texture ID"; btn.classList.remove("copied"); }, 2000);
            } else { btn.textContent = "No Texture ID"; setTimeout(() => { btn.textContent = "Copy Texture ID"; }, 2000); }
          } catch { btn.textContent = "Failed"; setTimeout(() => { btn.textContent = "Copy Texture ID"; }, 2000); }
        });
        el.parentElement.appendChild(btn);
      });
    }

    function replaceUploadInterface() {
      const uploadBtn = [...document.querySelectorAll('button[type="button"]')].find(b => b.textContent.includes('Upload Asset'));
      if (uploadBtn) {
        let c = uploadBtn.parentElement;
        while (c && c !== document.body) {
          if (c.textContent.includes('Drag and drop media here')) { c.replaceWith(createCustomUploader()); return true; }
          c = c.parentElement;
        }
      }
      const dragEl = [...document.querySelectorAll('span')].find(s => s.textContent.includes('Drag and drop media here'));
      if (dragEl) {
        let c = dragEl.parentElement;
        while (c && c !== document.body) {
          if (c.textContent.includes('Upload Asset') && c.textContent.includes('Max number of files')) { c.replaceWith(createCustomUploader()); return true; }
          c = c.parentElement;
        }
      }
      const fmtEl = [...document.querySelectorAll('span')].find(s => s.textContent.includes('*.jpg, *.png, *.tga, *.bmp'));
      if (fmtEl) {
        let c = fmtEl.parentElement;
        while (c && c !== document.body) {
          if (c.textContent.includes('Upload Asset')) { c.replaceWith(createCustomUploader()); return true; }
          c = c.parentElement;
        }
      }
      return false;
    }

    function createCustomUploader() {
      const el = document.createElement('div');
      el.id = 'custom-decal-uploader';
      if (!apiKey || !creatorId) { el.innerHTML = createApiKeySetupHTML(); }
      else { el.innerHTML = createUploadInterfaceHTML(); addUploadListeners(el); }
      return el;
    }

    function createApiKeySetupHTML() {
      return `
        <div class="api-key-setup">
          <div class="upload-text">OpenCloud API Key Required</div>
          <div class="upload-info">Upload multiple decals using a Roblox OpenCloud API key with Asset creation permissions.</div>
          <div style="margin:20px 0">
            <textarea class="api-key-input" placeholder="Paste your OpenCloud API key here..." id="api-key-input">${apiKey||''}</textarea>
            <div id="api-key-status" class="api-key-status" style="display:none"></div>
          </div>
          <div class="creator-setup">
            <div style="margin-bottom:15px;color:#fff;font-size:1.1em;font-weight:500">Upload as:</div>
            <div class="creator-options">
              <label class="creator-option"><input type="radio" name="creator-type" value="user" ${creatorType==='user'?'checked':''} id="creator-user"><span>User</span></label>
              <label class="creator-option"><input type="radio" name="creator-type" value="group" ${creatorType==='group'?'checked':''} id="creator-group"><span>Group</span></label>
            </div>
            <div class="creator-id-section">
              <div style="margin-bottom:8px;color:#fff;font-weight:500" id="creator-id-label">${creatorType==='user'?'Your User ID:':'Group ID:'}</div>
              <input type="text" class="creator-id-input" placeholder="${creatorType==='user'?'Enter your Roblox User ID':'Enter Group ID'}" id="creator-id-input" value="${creatorId||''}">
              <div style="font-size:0.9em;color:#b9bbbe;margin-top:8px" id="creator-id-help">
                ${creatorType==='user'?'Find your User ID at: <a href="https://www.roblox.com/users/profile" target="_blank" style="color:#4a90e2">roblox.com/users/profile</a>':'Find Group ID in the group URL: roblox.com/groups/<strong>GROUP_ID</strong>/group-name'}
              </div>
            </div>
          </div>
          <div class="api-key-buttons">
            <button class="btn btn-primary" id="save-api-key">Save Settings</button>
            <a href="https://create.roblox.com/dashboard/credentials" target="_blank" class="btn btn-secondary">Get API Key</a>
          </div>
          <div class="upload-info" style="margin-top:20px"><strong>Required permissions:</strong> Create assets<br><strong>Note:</strong> Settings are stored locally in your browser only.</div>
        </div>`;
    }

    function createUploadInterfaceHTML() {
      const who = creatorType === 'user' ? `User ID: ${creatorId}` : `Group ID: ${creatorId}`;
      return `
        <div class="upload-text">Drop multiple decal images here to upload</div>
        <div class="upload-info">Format: *.jpg, *.png, *.tga, *.bmp | Max 20 MB per file<br>Using OpenCloud API | ${who}</div>
        <div style="margin:15px 0"><button class="btn btn-danger" id="clear-api-key" style="font-size:0.9em">Clear Settings</button></div>
        <div id="upload-grid" class="upload-grid"></div>`;
    }

    function addUploadListeners(uploader) {
      uploader.addEventListener('dragover', e => { e.preventDefault(); uploader.classList.add('dragover'); });
      uploader.addEventListener('dragleave', e => { if (!uploader.contains(e.relatedTarget)) uploader.classList.remove('dragover'); });
      uploader.addEventListener('drop', handleDrop);
      uploader.addEventListener('click', e => {
        if (e.target.id === 'clear-api-key') { clearApiKey(); return; }
        const input = document.createElement('input');
        input.type = 'file'; input.multiple = true; input.accept = 'image/*';
        input.onchange = ev => handleFileSelect(ev.target.files);
        input.click();
      });
    }

    async function handleDrop(e) {
      e.preventDefault();
      document.getElementById('custom-decal-uploader').classList.remove('dragover');
      if (!apiKey || !creatorId) { alert('Please set up your OpenCloud API key first!'); return; }
      handleFileSelect(e.dataTransfer.files);
    }

    async function handleFileSelect(files) {
      if (!apiKey || !creatorId) { alert('Please set up your OpenCloud API key first!'); return; }
      const valid = [...files].filter(f => f.type.startsWith('image/') && f.size <= 20*1024*1024 && f.size > 0);
      if (!valid.length) { alert('No valid image files found! Images must be under 20MB.'); return; }
      if (valid.length !== files.length) alert(`${files.length - valid.length} files skipped (invalid or too large)`);
      uploadQueue = valid.map(f => ({ file: f, name: f.name.replace(/\.[^/.]+$/, ''), status: 'pending', element: null }));
      completedUploads = 0;
      displayPreviews();
      startUploads();
    }

    function displayPreviews() {
      const grid = document.getElementById('upload-grid');
      grid.innerHTML = '';
      uploadQueue.forEach((item, i) => {
        const preview = document.createElement('div'); preview.className = 'image-preview';
        const img = document.createElement('img'); img.src = URL.createObjectURL(item.file); img.onload = () => URL.revokeObjectURL(img.src);
        const name = document.createElement('div'); name.className = 'image-name'; name.textContent = item.name;
        const bar = document.createElement('div'); bar.className = 'status-bar';
        const fill = document.createElement('div'); fill.className = 'status-fill status-pending';
        bar.appendChild(fill); preview.appendChild(img); preview.appendChild(name); preview.appendChild(bar);
        grid.appendChild(preview);
        uploadQueue[i].element = preview; uploadQueue[i].statusFill = fill;
      });
    }

    async function startUploads() {
      for (const item of uploadQueue) {
        updateStatus(item, 'uploading');
        try { await uploadDecal(item.file, item.name); updateStatus(item, 'success'); }
        catch (e) { console.error('Upload failed:', e); updateStatus(item, 'error'); }
        completedUploads++;
        await new Promise(r => setTimeout(r, 2000));
      }
      if (completedUploads === uploadQueue.length) setTimeout(() => location.reload(), 1000);
    }

    function updateStatus(item, status) { item.status = status; item.statusFill.className = `status-fill status-${status}`; }

    async function uploadDecal(file, displayName) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const boundary = '----formdata-adamblox-' + Date.now() + Math.random().toString(36);
          const requestData = {
            assetType: "Decal", displayName, description: "Uploaded via Adamblox",
            creationContext: { creator: creatorType === 'user' ? { userId: creatorId } : { groupId: creatorId } }
          };
          const enc = new TextEncoder();
          const header = enc.encode(`--${boundary}\r\nContent-Disposition: form-data; name="request"\r\n\r\n${JSON.stringify(requestData)}\r\n--${boundary}\r\nContent-Disposition: form-data; name="fileContent"; filename="${file.name}"\r\nContent-Type: ${file.type||'application/octet-stream'}\r\n\r\n`);
          const footer = enc.encode(`\r\n--${boundary}--\r\n`);
          const body = new Uint8Array(header.length + reader.result.byteLength + footer.length);
          body.set(header, 0); body.set(new Uint8Array(reader.result), header.length); body.set(footer, header.length + reader.result.byteLength);
          let bin = ''; for (let i = 0; i < body.length; i++) bin += String.fromCharCode(body[i]);
          GM_xmlhttpRequest({
            method: 'POST', url: 'https://apis.roblox.com/assets/v1/assets',
            headers: { 'x-api-key': apiKey, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
            data: bin, binary: true, responseType: 'json',
            onload: r => {
              if (r.status >= 200 && r.status < 300) { resolve(r.response || { success: true }); }
              else {
                if (r.status === 401) { alert('API Key invalid or lacks permissions.'); clearApiKey(); }
                reject(new Error(`${r.status}: ${r.responseText}`));
              }
            },
            onerror: e => reject(new Error('Network error'))
          });
        };
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsArrayBuffer(file);
      });
    }

    function setupApiKeyHandlers() {
      const saveBtn = document.getElementById('save-api-key');
      const keyIn   = document.getElementById('api-key-input');
      const idIn    = document.getElementById('creator-id-input');
      const status  = document.getElementById('api-key-status');
      const userR   = document.getElementById('creator-user');
      const groupR  = document.getElementById('creator-group');
      const idLabel = document.getElementById('creator-id-label');
      const idHelp  = document.getElementById('creator-id-help');

      function updateType() {
        const t = document.querySelector('input[name="creator-type"]:checked').value;
        creatorType = t;
        if (t === 'user') {
          idLabel.textContent = 'Your User ID:'; idIn.placeholder = 'Enter your Roblox User ID';
          idHelp.innerHTML = 'Find your User ID at: <a href="https://www.roblox.com/users/profile" target="_blank" style="color:#4a90e2">roblox.com/users/profile</a>';
        } else {
          idLabel.textContent = 'Group ID:'; idIn.placeholder = 'Enter Group ID';
          idHelp.innerHTML = 'Find Group ID in the group URL: roblox.com/groups/<strong>GROUP_ID</strong>/group-name';
        }
      }
      userR?.addEventListener('change', updateType); groupR?.addEventListener('change', updateType);

      if (saveBtn && keyIn && idIn && status) {
        saveBtn.onclick = () => {
          const key = keyIn.value.trim(), id = idIn.value.trim();
          status.style.display = 'block';
          if (!key) { status.innerHTML = '<span class="status-invalid">Enter an API key</span>'; return; }
          if (!id || !/^\d+$/.test(id)) { status.innerHTML = '<span class="status-invalid">Enter a valid numeric ID</span>'; return; }
          if (key.length < 50) { status.innerHTML = '<span class="status-invalid">Key seems too short — copy the full key</span>'; return; }
          apiKey = key; creatorId = id;
          localStorage.setItem('adamblox_opencloud_key', key);
          localStorage.setItem('adamblox_creator_type', creatorType);
          localStorage.setItem('adamblox_creator_id', id);
          status.innerHTML = 'Settings saved!'; status.className = 'api-key-status status-valid';
          setTimeout(() => {
            const u = document.getElementById('custom-decal-uploader');
            u.innerHTML = createUploadInterfaceHTML(); addUploadListeners(u);
          }, 1500);
        };
        [keyIn, idIn].forEach(el => el.addEventListener('keypress', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); saveBtn.click(); } }));
      }
    }

    function clearApiKey() {
      if (!confirm('Clear your saved settings?')) return;
      apiKey = null; creatorId = null;
      localStorage.removeItem('adamblox_opencloud_key');
      localStorage.removeItem('adamblox_creator_type');
      localStorage.removeItem('adamblox_creator_id');
      const u = document.getElementById('custom-decal-uploader');
      u.innerHTML = createApiKeySetupHTML(); setupApiKeyHandlers();
    }

    function init() {
      if (!shouldBeActive() || initialized) return;
      initialized = true;
      if (initRetryTimer) { clearTimeout(initRetryTimer); initRetryTimer = null; }
      const tryReplace = () => {
        if (!shouldBeActive()) return;
        if (replaceUploadInterface()) { if (!apiKey || !creatorId) setupApiKeyHandlers(); return; }
        initRetryTimer = setTimeout(tryReplace, 1000);
      };
      tryReplace();
      const obs = new MutationObserver(() => {
        if (!shouldBeActive()) return;
        if (!document.getElementById('custom-decal-uploader')) {
          replaceUploadInterface();
          if (!apiKey || !creatorId) setupApiKeyHandlers();
        }
        enhanceAssetCards();
      });
      obs.observe(document.body, { childList: true, subtree: true });
      observers.push(obs);
      enhanceAssetCards();
      setInterval(() => { if (shouldBeActive()) enhanceAssetCards(); }, 3000);
    }

    function checkUrlChange() {
      if (currentUrl === location.href) return;
      currentUrl = location.href;
      if (!shouldBeActive() && initialized) { cleanup(); }
      else if (shouldBeActive() && !initialized) { init(); }
    }

    window.addEventListener('popstate', checkUrlChange);
    setInterval(checkUrlChange, 1000);
    if (shouldBeActive()) init();
  })();
}
