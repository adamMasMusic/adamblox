(function () {
  'use strict';

  // Inject styles for friend presence ring
  GM_addStyle(`
    .friend-avatar-ring {
      border-radius: 50%;
      padding: 3px;
      display: inline-block;
      background-clip: content-box;
    }
    .status-online { box-shadow: 0 0 0 3px #43b581; }
    .status-ingame { box-shadow: 0 0 0 3px #7289da; }
    .status-offline { box-shadow: 0 0 0 3px #99aab5; }
  `);

  // Helper to recolor avatars
  function enhanceFriends() {
    document.querySelectorAll('.friend-tile-content').forEach((tile) => {
      if (tile.dataset.btrEnhanced) return;
      tile.dataset.btrEnhanced = 'true';

      const statusEl = tile.querySelector('.avatar-status span');
      const avatarImg = tile.querySelector('.avatar-card-image img');
      if (!statusEl || !avatarImg) return;

      // Determine status color
      const title = (statusEl.getAttribute('title') || '').toLowerCase();
      let statusClass = 'status-offline';
      if (title.includes('game')) statusClass = 'status-ingame';
      else if (title.includes('online')) statusClass = 'status-online';

      // Wrap avatar
      const wrapper = document.createElement('div');
      wrapper.className = `friend-avatar-ring ${statusClass}`;
      avatarImg.parentElement.replaceWith(wrapper);
      wrapper.appendChild(avatarImg);

      // Remove original small presence icon
      statusEl.remove();
    });
  }

  // Continuously apply changes as friends reload
  setInterval(enhanceFriends, 2000);

  // Add pencil icon to navbar
  window.addEventListener('load', () => {
    const nav = document.querySelector('.navbar-right.rbx-navbar-right ul');
    if (!nav || document.querySelector('#btr-edit-icon')) return;

    const li = document.createElement('li');
    li.className = 'navbar-icon-item';
    li.innerHTML = `
      <button id="btr-edit-icon" title="Open Decal Page" class="btn-navigation-nav-edit">
        ✏️
      </button>
    `;

    li.querySelector('button').addEventListener('click', () => {
      window.location.href =
        'https://create.roblox.com/dashboard/creations?activeTab=Decal';
    });

    nav.insertBefore(li, nav.firstChild);
  });
})();