import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import { afterNextRender } from "@polymer/polymer/lib/utils/render-status.js";
import {
  setPassiveTouchGestures,
  setRootPath
} from "@polymer/polymer/lib/utils/settings.js";
import { GestureEventListeners } from "@polymer/polymer/lib/mixins/gesture-event-listeners.js";
import "@polymer/app-layout/app-drawer/app-drawer.js";
import "@polymer/app-layout/app-drawer-layout/app-drawer-layout.js";
import "@polymer/app-layout/app-header/app-header.js";
import "@polymer/app-layout/app-header-layout/app-header-layout.js";
import "@polymer/app-layout/app-scroll-effects/app-scroll-effects.js";
import "@polymer/app-layout/app-toolbar/app-toolbar.js";
import "@polymer/app-route/app-location.js";
import "@polymer/app-route/app-route.js";
import "@polymer/iron-pages/iron-pages.js";
import "@polymer/iron-selector/iron-selector.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-toast/paper-toast.js";
import "./page-metadata.js";
import "./my-icons.js";
import "./online-status.js";
import "./drawer-top";
import "./settings/gwn-settings.js";
import "./collections/collection-modal.js";

import { connect } from "pwa-helpers/connect-mixin.js";

// Load redux store
import { store } from "../store.js";

// Lazy load reducers
import settings from "../reducers/settings.js";
store.addReducers({
  settings
});

import { SharedStyles } from "./shared-styles.js";

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath(MyAppGlobals.rootPath);

class GW2Ninja extends connect(store)(GestureEventListeners(PolymerElement)) {
  static get template() {
    return html`
    ${SharedStyles}
    <style>
      :host {
        display: block;
        min-height: 100vh;

        --app-text-color: #333333;
        --app-text-color-inverted: #ffffff;
      }

      app-toolbar {
        font-weight: 800;
      }

      app-drawer {
        z-index: 99999;
        box-shadow: 1px 0 4px rgba(0,0,0,.12);
      }

      app-header {
        color: var(--app-text-color-light);
        background-color: var(--app-primary-color);
      }

      app-header paper-icon-button {
        --paper-icon-button-ink-color: white;
      }

      app-toolbar [main-title] {
        text-transform: capitalize;
        display: flex;
        align-items: center;
        padding: 0 var(--spacer-medium);
      }

      app-toolbar [main-title] iron-icon {
        margin-right: var(--spacer-small);
      }

      .drawer-list {
        display: flex;
        flex-direction: column;
        margin: 0;
        box-sizing: border-box;
        min-height: 100%;
        padding: 0 var(--spacer-small);
      }

      .drawer-list > a {
        display: block;
        text-decoration: none;
        line-height: 40px;
        margin-bottom: .5rem;
      }

      .drawer-list > a + hr {
        margin-top: .5rem;
      }

      .drawer-list > a.last-before-auto {
        margin-bottom: 1rem;
      }

      .bottom-links {
        margin-bottom: 1rem;
        padding: 0 var(--spacer-small);
      }

      .bottom-links a {
        font-weight: 500;
        margin-right: .5rem;
        text-decoration: none;
        white-space: nowrap;
        color: var(--app-primary-color);
      }

      .drawer-list paper-item {
        min-height: 2.5rem;
        border-radius: var(--app-border-radius);
        color: var(--app-text-color);
        font: var(--app-font-stack);
        font-weight: 500;
      }

      .drawer-list paper-item:focus,
      .drawer-list a.iron-selected paper-item:focus {
        color: var(--app-text-color-light);
        background-color: var(--app-primary-color);
      }

      .drawer-list a.iron-selected paper-item {
        font-weight: 800;
        background-color: rgba(0,0,0,.08);
        --paper-item-focused-before: {
          background: rgba(0,0,0,.08);
        };
      }

      .drawer-scroll {
        height: calc(100% - 256px * 0.5625);
        overflow-y: auto;
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding-top: 1rem;
      }

      #onlineStatusToast {
        bottom: 0;
        top: auto !important;
      }

      @media screen and (min-width: 641px) {
        #onlineStatusToast {
          left: 256px !important;
          width: calc(100% - 256px);
        }
      }
    </style>

    <app-location route="{{route}}"></app-location>
    <app-route route="{{route}}" pattern="/:page" data="{{routeData}}" tail="{{subroute}}"></app-route>

    <!-- Main content -->

    <online-status online-status="{{ onlineStatus }}"></online-status>
    <paper-toast id="onlineStatusToast" class="fit-bottom" opened="[[ !onlineStatus ]]" duration="0" text="You appear to be offline. Some tools might not work correctly."></paper-toast>

    <app-header-layout>
      <app-header slot="header" fixed>
        <app-toolbar>
          <paper-icon-button icon="my-icons:menu" on-tap="_openDrawer" aria-label="Open Menu"></paper-icon-button>
          <div main-title>[[ _pageTitle(page) ]]</div>
          <paper-icon-button icon="my-icons:settings" aria-label="Open Settings" on-tap="_toggleSettings"></paper-icon-button>
        </app-toolbar>
      </app-header>

      <iron-pages selected="[[page]]" attr-for-selected="name" fallback-selection="view404" role="main">
        <page-index name="index"></page-index>
        <page-directory theme$="[[theme]]" name="directory"></page-directory>
        <page-collections theme$="[[theme]]" name="collections"></page-collections>
        <page-tickets theme$="[[theme]]" name="tickets"></page-tickets>
        <page-chatcodes name="chatcodes"></page-chatcodes>
        <page-timer theme$="[[theme]]" name="timer"></page-timer>
        <page-calc name="calc"></page-calc>
        <page-wvw theme$="[[theme]]" name="wvw"></page-wvw>
        <page-about name="about"></page-about>
        <page-precursors name="precursors" page="[[page]]"></page-precursors>
        <page-stream-tools name="stream"></page-stream-tools>
        <page-view404 name="view404"></page-view404>
      </iron-pages>
    </app-header-layout>

    <!-- Drawer content -->
    <app-drawer id="drawer" swipe-open opened="{{drawer}}">
      <drawer-top theme$="[[theme]]" on-close-drawer="_closeDrawer"></drawer-top>
      <div class="drawer-scroll">
        <iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
          <a name="index" href="/" tabindex="-1">
            <paper-item>Home</paper-item>
          </a>
          <a name="directory" href="/directory/websites" tabindex="-1">
            <paper-item>Directory</paper-item>
          </a>
          <a name="timer" href="/timer/all" tabindex="-1">
            <paper-item>Meta Timer</paper-item>
          </a>
          <a name="wvw" href="/wvw/overview" tabindex="-1" class="last-before-auto">
            <paper-item>World vs World</paper-item>
          </a>
          <hr>
          <a name="collections" href="/collections/basic" tabindex="-1">
            <paper-item>Collections</paper-item>
          </a>
          <a name="tickets" href="/tickets" tabindex="-1">
            <paper-item>Tickets</paper-item>
          </a>
          <a name="calc" href="/calc" tabindex="-1">
            <paper-item>TP Calc</paper-item>
          </a>
          <hr>
          <a name="chatcodes" href="/chatcodes" tabindex="-1">
            <paper-item>Chatcodes</paper-item>
          </a>
          <a name="stream" href="/stream" tabindex="-1" class="last-before-auto">
            <paper-item>Stream Tools</paper-item>
          </a>
          <hr style="margin-top:auto">
          <div class="bottom-links">
            <a name="about" href="/about">About</a>
            <a href="https://github.com/rediche/gw2-ninja" target="_blank" rel="noopener noreferrer">Code on Github</a>
            <a href="https://github.com/rediche/gw2-ninja/issues" target="_blank" rel="noopener noreferrer">Report an issue</a>
          </div>
        </iron-selector>
      </div>
    </app-drawer>

    <page-metadata 
      base-title="GW2 Ninja" 
      fallback-description="A collection of Guild Wars 2 Tools."
      direction="reversed" 
      page="[[ page ]]"></page-metadata>
    <gwn-settings open="{{settingsOpen}}"></gwn-settings>

    <collection-modal></collection-modal>
    `;
  }

  static get properties() {
    return {
      page: {
        type: String,
        reflectToAttribute: true,
        observer: "_pageChanged"
      },
      drawer: {
        type: Boolean,
        value: false
      },
      onlineStatus: {
        type: Boolean
      },
      settingsOpen: {
        type: Boolean,
        value: false
      },
      theme: {
        type: String,
        reflectToAttribute: true
      }
    };
  }

  static get observers() {
    return ["_routePageChanged(routeData.page)"];
  }

  ready() {
    super.ready();

    afterNextRender(this, function() {
      this.$.onlineStatusToast.fitInto = this.$.appHeaderLayout;
    });
  }

  _routePageChanged(page) {
    // Show the corresponding page according to the route.
    //
    // If no page was found in the route data, page will be an empty string.
    // Show 'index' in that case. And if the page doesn't exist, show 'view404'.
    if (!page) {
      this.page = "index";
    } else if (
      [
        "index",
        "about",
        "calc",
        "chatcodes",
        "collections",
        "directory",
        "tickets",
        "timer",
        "wvw",
        "precursors",
        "stream"
      ].indexOf(page) !== -1
    ) {
      this.page = page;
    } else {
      this.page = "view404";
    }

    // Close a non-persistent drawer when the page & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  _pageChanged(page) {
    // Import the page component on demand.
    //
    // Note: `polymer build` doesn't like string concatenation in the import
    // statement, so break it up.
    switch (page) {
      case "index":
        import("./pages/page-index.js");
        break;
      case "about":
        import("./pages/page-about.js");
        break;
      case "calc":
        import("./pages/page-calc.js");
        break;
      case "chatcodes":
        import("./pages/page-chatcodes.js");
        break;
      case "collections":
        import("./pages/page-collections.js");
        break;
      case "directory":
        import("./pages/page-directory.js");
        break;
      case "tickets":
        import("./pages/page-tickets.js");
        break;
      case "timer":
        import("./pages/page-timer.js");
        break;
      case "wvw":
        import("./pages/page-wvw.js");
        break;
      case "precursors":
        import("./pages/page-precursors.js");
        break;
      case "stream":
        import("./pages/page-stream-tools.js");
        break;
      case "view404":
        import("./pages/page-view404.js");
        break;
    }
  }

  _showPage404() {
    this.page = "view404";
  }

  _pageTitle(activePage) {
    if (!activePage) return;

    if (activePage == "index") return "Home";
    if (activePage == "directory") return "Directory";
    if (activePage == "collections") return "Collections";
    if (activePage == "tickets") return "Tickets";
    if (activePage == "chatcodes") return "Chatcode Generator";
    if (activePage == "timer") return "Meta Timer";
    if (activePage == "calc") return "Trading Post Calculator";
    if (activePage == "wvw") return "World vs World";
    if (activePage == "about") return "About GW2 Ninja";
    if (activePage == "precursors") return "Precursor Rain. HALLELUJAH!";
    if (activePage == "stream") return "Stream Tools";
    if (activePage == "view404") return "Page not found";

    return activePage;
  }

  _toggleSettings() {
    this.set("settingsOpen", !this.settingsOpen);
  }

  _openDrawer() {
    this.set("drawer", true);
  }

  _closeDrawer() {
    this.set("drawer", false);
  }

  _stateChanged(state) {
    if (!state || !state.settings) return;
    this.set("theme", state.settings.theme);
  }
}

window.customElements.define("gw2-ninja", GW2Ninja);
