(function () {
  "use strict";

  GM_addStyle(`
    /* --- Prevent cropping so halos can show --- */
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

    /* --- Universal ring wrapper --- */
    .btr-presence-ring {
      position: absolute;
      top: -8px; left: -8px; right: -8px; bottom: -8px;
      border-radius: 50%;
      pointer-events: none;
      transition: 0.3s ease;
      border: 6px solid currentColor;
    }

    /* --- Status color + halo --- */
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

    /* --- Offline/default: flat gray, no halo --- */
    .btr-ring-offline {
      color: #6c7377;
      box-shadow: none;
    }

    /* --- Force horizontal spacing between friend tiles --- */
    .friends-carousel-list-container,
    .friends-carousel-list-container-not-full {
      display: flex !important;
      flex-wrap: nowrap !important;
      overflow: visible !important;
      column-gap: 4px !important;
      row-gap: 0 !important;
    }

    .friends-carousel-tile {
      margin: 0 4px !important;
    }

    .friends-carousel-container {
      padding-left: 4px !important;
      padding-right: 4px !important;
    }

    /* --- Floating Create Dashboard button --- */
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
    #adamblox-create-btn svg {
      flex-shrink: 0;
      opacity: 0.8;
    }
    #adamblox-create-btn:hover svg {
      opacity: 1;
    }
  `);

  /* ---- Presence map ---- */
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
    // Try multiple selector patterns for friend tiles
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

  /* ---- Floating Create Dashboard button ---- */
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

  /* ---- Observer (watch document.body directly — resilient to container changes) ---- */
  const observer = new MutationObserver(() => {
    requestIdleCallback
      ? requestIdleCallback(updateFriendTiles)
      : setTimeout(updateFriendTiles, 0);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  setInterval(updateFriendTiles, 3000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      updateFriendTiles();
      addCreateFloatingBtn();
    });
  } else {
    updateFriendTiles();
    addCreateFloatingBtn();
  }
})();
