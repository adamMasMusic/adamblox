(function () {
  "use strict";

  GM_addStyle(`
    /* --- Friend Presence Ring --- */
    .friend-tile-content .thumbnail-2d-container {
      position: relative;
      display: inline-block;
      border-radius: 50%;
      overflow: visible;
    }
    .friend-tile-content .btr-presence-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 110%;
      height: 110%;
      border-radius: 50%;
      box-sizing: border-box;
      pointer-events: none;
    }
    .btr-ring-online  { box-shadow: 0 0 0 3px #43b581; }
    .btr-ring-ingame  { box-shadow: 0 0 0 3px #7289da; }
    .btr-ring-offline { box-shadow: 0 0 0 3px #99aab5; }
  `);

  function updateFriendTiles() {
    document.querySelectorAll(".friend-tile-content").forEach((tile) => {
      if (tile.dataset.btrEnhanced) return;
      tile.dataset.btrEnhanced = "true";

      const thumb = tile.querySelector(".thumbnail-2d-container");
      const statusEl = tile.querySelector(".avatar-status span");
      if (!thumb || !statusEl) return;

      // Determine presence
      const title = (statusEl.getAttribute("title") || "").toLowerCase();
      let cls = "btr-ring-offline";
      if (title.includes("game")) cls = "btr-ring-ingame";
      else if (title.includes("online")) cls = "btr-ring-online";

      // Create overlay ring if not present
      if (!thumb.querySelector(".btr-presence-ring")) {
        const ring = document.createElement("div");
        ring.className = `btr-presence-ring ${cls}`;
        thumb.appendChild(ring);
      }

      // Remove only the icon, not layout container
      statusEl.parentElement.remove();
    });
  }

  // Observe DOM changes so we patch only fully rendered elements
  const observer = new MutationObserver(updateFriendTiles);
  observer.observe(document.body, { childList: true, subtree: true });

  // Run once initially
  updateFriendTiles();

  window.addEventListener("load", () => {
    const nav = document.querySelector(".rbx-navbar-icon-group");
    if (!nav || document.querySelector("#btr-edit-icon")) return;

    const li = document.createElement("li");
    li.className = "navbar-icon-item";
    li.innerHTML = `
    <button id="btr-edit-icon" title="Decal Creator" class="btn-navigation-nav-edit">
      ✏️
    </button>
  `;
    li.querySelector("button").addEventListener("click", () => {
      window.location.href =
        "https://create.roblox.com/dashboard/creations?activeTab=Decal";
    });

    nav.appendChild(li);
  });
})();
