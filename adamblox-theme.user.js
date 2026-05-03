// ==UserScript==
// @name         Adamblox — Theme
// @namespace    https://github.com/adamMasMusic/adamblox
// @version      2.0
// @description  Dark glass-morphism theme for roblox.com
// @author       adamMasMusic
// @match        https://www.roblox.com/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/adamMasMusic/adamblox/main/adamblox-theme.user.js
// @downloadURL  https://raw.githubusercontent.com/adamMasMusic/adamblox/main/adamblox-theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(`
    html, body {
      background: linear-gradient(135deg, #6b075eff, #181218ff) fixed !important;
      background-size: cover !important;
    }
    .dark-theme .content {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .dark-theme .rbx-left-col {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 10px !important;
    }
    .dark-theme .rbx-header {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 10px !important;
    }
    .dark-theme .rbx-header .navbar-search {
      background-color: rgba(0, 0, 0, 0);
    }
    .dark-theme .container-footer {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 10px !important;
    }
    .dark-theme #catalog-react-container .sticky .catalog-header {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .dark-theme #catalog-react-container .catalog-revamp .catalog-item-container .item-card-thumb-container {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 20px !important;
    }
    .dark-theme .section-content {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .dark-theme .profile-avatar-left {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .dark-theme #catalog-react-page .search-bars {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .dark-theme #catalog-react-container .sticky .topic-container {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .dark-theme .chat-container .chat-main .chat-header {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 20px !important;
    }
    .dark-theme .slide-switcher .slide-item-container .slide-item-container-right {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .dark-theme .slide-switcher .slide-item-container .slide-item-container-left {
      background-color: rgba(0, 0, 0, 0) !important;
    }
    .dark-theme .slide-switcher.groups {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 20px !important;
    }

    /* Drawer / side-panel glass effect */
    [class*="drawerPaper"],
    [class*="DrawerPaper"] {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 20px !important;
    }

    /* Drop-down / select menus */
    [class*="selectMenu"],
    [class*="SelectMenu"],
    [class*="Menu-paper"],
    [class*="menuPaper"] {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 20px !important;
    }

    /* Compact rail / scroll containers */
    [class*="railContainer"] {
      background-color: rgba(25, 27, 29, 0.3) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow:
        0 0 6px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(6px) !important;
      border-radius: 20px !important;
    }
  `);
})();
