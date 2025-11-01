(function () {
  'use strict';

  /* --- Friend Presence Ring Styling --- */
  GM_addStyle(`
    .friend-tile-content .thumbnail-2d-container {
      position: relative;
      border-radius: 50%;
      display: inline-block;
      overflow: hidden;
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
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 50%;
      pointer-events: none;
      transition: box-shadow 0.25s;
    }
    .btr-ring-online  { box-shadow: 0 0 0 3px #43b581; }
    .btr-ring-ingame  { box-shadow: 0 0 0 3px #7289da; }
    .btr-ring-studio  { box-shadow: 0 0 0 3px #f39c12; }
    .btr-ring-offline { box-shadow: 0 0 0 3px #99aab5; }
  `);

  function detectPresence(titleText) {
    if (!titleText) return 'btr-ring-offline';
    const title = titleText.toLowerCase();
    if (title.includes('in studio')) return 'btr-ring-studio';
    if (title.includes('game')) return 'btr-ring-ingame';
    if (title.includes('online')) return 'btr-ring-online';
    return 'btr-ring-offline';
  }

  function enhanceFriend(tile) {
    if (tile.dataset.btrEnhanced) return;
    const avatarImg = tile.querySelector('.thumbnail-2d-container img');
    const statusEl = tile.querySelector('.avatar-status span');
    const nameEl = tile.querySelector('.friends-carousel-display-name');
    if (!avatarImg || !statusEl) return;

    const presenceTitle = statusEl.getAttribute('title') || '';
    const ringClass = detectPresence(presenceTitle);

    // Debug info
    const userName = nameEl ? nameEl.textContent.trim() : 'UnknownUser';
    console.log(`[Presence Debug] ${userName}: "${presenceTitle}" → ${ringClass}`);

    // Insert ring overlay only once
    const thumb = avatarImg.closest('.thumbnail-2d-container');
    if (thumb && !thumb.querySelector('.btr-presence-ring')) {
      const ring = document.createElement('div');
      ring.className = `btr-presence-ring ${ringClass}`;
      thumb.appendChild(ring);
    }

    // Safe remove of small icon
    statusEl.remove();

    tile.dataset.btrEnhanced = 'true';
  }

  function updateFriendTiles() {
    document.querySelectorAll('.friend-tile-content').forEach((tile) => {
      try {
        enhanceFriend(tile);
      } catch (err) {
        console.warn('Friend enhancement failed:', err);
      }
    });
  }

  // Observation for dynamic reloads
  const observer = new MutationObserver(() => {
    requestIdleCallback(updateFriendTiles);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial run after a short delay to ensure presence data has loaded
  setTimeout(updateFriendTiles, 1000);
})();