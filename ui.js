(function () {
  "use strict";

  GM_addStyle(`
  /* --- Prevent cropping so halos can show --- */
  .friends-carousel-container,
  .friends-carousel-list-container,
  .friends-carousel-tile {
    display: flex !important;
    gap: 12px !important;
    overflow: visible !important;
  }

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
  .btr-ring-online  {
    color: #7289da;
    box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset;
  }
  .btr-ring-ingame  {
    color: #43b581;
    box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset;
  }
  .btr-ring-studio  {
    color: #f39c12;
    box-shadow: 0 0 15px currentColor, 0 0 30px currentColor inset;
  }

  /* --- Offline/default: flat gray, no halo --- */
  .btr-ring-offline {
    color: #6c7377ff;
    box-shadow: none;
  }

  /* --- Force horizontal spacing between friend tiles --- */
  .friends-carousel-list-container,
  .friends-carousel-list-container-not-full {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow: visible !important;       /* allow the halos and margin room */
    column-gap: 4px !important;        /* works as horizontal gap between tiles */
    row-gap: 0 !important;
  }
  
  .friends-carousel-tile {
    margin: 0 4px !important;           /* fallback: 8px on each side of every tile */
  }
  
  .friends-carousel-container {
    padding-left: 4px !important;
    padding-right: 4px !important;
  }

  /* --- Custom Create/Design Icon --- */
  .icon-nav-create-btr {
    width: 20px;
    height: 20px;
    display: inline-block;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23bdbebe' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    vertical-align: middle;
  }

  /* --- Create navbar item styling --- */
  #btr-navbar-create {
    display: flex;
    align-items: center;
    height: 100%;
  }

  #btr-navbar-create .rbx-menu-item {
    color: #bdbebe;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    height: 100%;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  #btr-navbar-create .rbx-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  #btr-navbar-create .rbx-menu-item:hover .icon-nav-create-btr {
    opacity: 1;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E");
  }
`);

  // Map Roblox presence class → ring style
  const presenceMap = {
    game: "btr-ring-ingame",
    studio: "btr-ring-studio",
    online: "btr-ring-online",
  };

  /** Determine ring class based on Roblox's presence span */
  function getRingClass(statusEl) {
    if (!statusEl) return "btr-ring-offline";
    const cls = statusEl.className || "";
    for (const key in presenceMap) {
      if (cls.includes(key)) return presenceMap[key];
    }
    return "btr-ring-offline";
  }

  /** Apply or update the presence ring for one friend tile */
  function enhanceFriend(tile) {
    const thumb = tile.querySelector(".thumbnail-2d-container");
    if (!thumb) return;

    const statusEl = tile.querySelector(
      '.avatar-status span[data-testid="presence-icon"]'
    );
    const nameEl = tile.querySelector(".friends-carousel-display-name");
    const userName = nameEl ? nameEl.textContent.trim() : "UnknownUser";

    const ringClass = getRingClass(statusEl);

    // Create or update the ring
    let ring = thumb.querySelector(".btr-presence-ring");
    if (!ring) {
      ring = document.createElement("div");
      ring.className = "btr-presence-ring " + ringClass;
      thumb.appendChild(ring);
    } else if (!ring.classList.contains(ringClass)) {
      ring.className = "btr-presence-ring " + ringClass;
    }

    // Hide Roblox presence icon safely (don't delete)
    const statusContainer = tile.querySelector(".avatar-status");
    if (statusContainer) statusContainer.style.display = "none";
  }

  /** Process all friend tiles currently in the list */
  function updateFriendTiles() {
    document.querySelectorAll(".friend-tile-content").forEach((tile) => {
      try {
        enhanceFriend(tile);
      } catch (err) {
        console.warn("Friend enhancement failed:", err);
      }
    });
  }

  /** Add Create Dashboard link to navbar */
  function addCreateNavItem() {
    const navbar = document.querySelector('.nav.navbar-right.rbx-navbar-icon-group');
    if (!navbar || document.getElementById('btr-navbar-create')) {
      return; // Already exists or navbar not found
    }

    // Find the friends icon to insert before it
    const friendsItem = document.getElementById('btr-navbar-friends');
    if (!friendsItem) return;

    // Create the create dashboard nav item
    const createItem = document.createElement('li');
    createItem.id = 'btr-navbar-create';
    createItem.className = 'navbar-icon-item btr-nav-node-header_create btr-nav-header_create';

    createItem.innerHTML = `
      <a class="rbx-menu-item" href="https://create.roblox.com/dashboard/creations?activeTab=Decal" target="_blank" title="Create Dashboard">
        <span class="icon-nav-create-btr"></span>
      </a>
    `;

    // Insert before the friends item
    navbar.insertBefore(createItem, friendsItem);
  }

  // Observe both tile insertion and attribute changes on presence nodes
  const listContainer =
    document.querySelector(
      ".friends-carousel-list-container, .friends-carousel-list-container-not-full"
    ) ||
    document.querySelector(".react-friends-carousel-container") ||
    document.body;

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList" || m.type === "attributes") {
        requestIdleCallback(updateFriendTiles);
        break;
      }
    }
  });

  observer.observe(listContainer, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"], // detect presence icon class change
  });

  // Safety recheck every few seconds
  setInterval(updateFriendTiles, 3000);

  // Add create nav item when page loads
  function initCreateNavItem() {
    addCreateNavItem();
    // Retry a few times in case navbar loads later
    setTimeout(addCreateNavItem, 1000);
    setTimeout(addCreateNavItem, 3000);
  }

  // Run immediately on load
  updateFriendTiles();
  initCreateNavItem();
})();