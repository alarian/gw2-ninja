import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import { afterNextRender } from "@polymer/polymer/lib/utils/render-status.js";
import { Debouncer } from "@polymer/polymer/lib/utils/debounce.js";
import { microTask } from "@polymer/polymer/lib/utils/async.js";
import "@polymer/app-route/app-location.js";
import "@polymer/app-route/app-route.js";
import "@polymer/iron-pages/iron-pages.js";
import "@polymer/paper-tabs/paper-tabs.js";
import "@polymer/paper-spinner/paper-spinner.js";
import "@polymer/paper-toast/paper-toast.js";
import { SharedStyles } from "../shared-styles.js";
import "../collections/collection-list.js";
import "../utilities/gwn-sync-settings.js";
import "../utilities/gwn-modal.js";

class PageCollections extends PolymerElement {
  static get is() {
    return "page-collections";
  }

  static get template() {
    return html`
      ${SharedStyles}
      <style>
        :host {
          display: block;
          box-sizing: border-box;
        }

        .card {
          padding: 0;
        }

        paper-tabs {
          background-color: var(--app-primary-color);
          --paper-tabs-selection-bar-color: #ffffff;
        }

        paper-tab {
          color: white;
        }

        paper-spinner {
          margin: 1.25rem auto;
          display: none;
        }

        paper-spinner[active] {
          display: block;
        }
      </style>

      <app-location route="{{route}}"></app-location>
      <app-route route="{{route}}" pattern="/collections/:subview" data="{{subviewData}}"></app-route>

      <p class="description">With the collections tool, you can see the prices of items in various collections, which can be bought straight off the trading post.<br> It also calculates a total price of how much the collection is worth.</p>

      <paper-tabs class="sticky-tabs" selected="{{subviewData.subview}}" attr-for-selected="name">
        <paper-tab name="basic">Basic</paper-tab>
        <paper-tab name="rare">Rare</paper-tab>
        <paper-tab name="black-lion">Black Lion</paper-tab>
      </paper-tabs>

      <iron-pages selected="{{subviewData.subview}}" attr-for-selected="name" fallback-selection="basic">
        <div name="basic">
          <paper-spinner alt="Loading basic collections..." active="[[basicLoading]]"></paper-spinner>
            <collection-list collection-data="{{basic}}" category-items="[[category.items]]" hidden$="[[basicLoading]]"></collection-list>
        </div>
        <div name="rare">
          <paper-spinner alt="Loading basic collections..." active$="[[rareLoading]]"></paper-spinner>
          <collection-list collection-data="{{rare}}" hidden$=[[rareLoading]]></collection-list>
        </div>
        <div name="black-lion">
          <paper-spinner alt="Loading basic collections..." active$="[[blacklionLoading]]"></paper-spinner>
            <collection-list collection-data="{{blacklion}}" hidden$="[[blacklionLoading]]"></collection-list>
        </div>
      </iron-pages>

      <paper-toast id="toast" duration="0" text="An error occured."></paper-toast>
      <gwn-sync-settings
        value="{{language}}"
        setting="gwn-lang"><gwn-sync-settings>
    `;
  }

  static get properties() {
    return {
      subviewData: {
        type: Object
      },
      collections: {
        type: Array
      },
      basic: {
        type: Array
      },
      rare: {
        type: Array
      },
      blacklion: {
        type: Array
      },
      basicLoading: {
        type: Boolean,
        value: true
      },
      rareLoading: {
        type: Boolean,
        value: true
      },
      blacklionLoading: {
        type: Boolean,
        value: true
      },
      language: {
        type: String
      }
    };
  }

  static get observers() {
    return ["_subviewObserver(subviewData.subview, collections)"];
  }

  ready() {
    super.ready();

    afterNextRender(this, function() {
      this._loadCollectionData();
    });
  }

  _subviewObserver(subview, collections) {
    if (!subview || !collections) return;

    // Debounce since subview will update twice
    this._debounceJob = Debouncer.debounce(this._debounceJob, microTask, () => {
      this._loadCollection(subview, collections);
    });
  }

  async _loadCollection(collection, collections) {
    if (collection == "black-lion") collection = "blacklion";
    if (this.get(collection)) return; // If collection has already been loaded, don't load it again

    const category = await this._filterAndSort(collections, collection);
    this.set(collection, category);
    this.set(`${collection}Loading`, false);
  }

  async _loadCollectionData() {
    fetch("/src/data/collections.json")
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.set("collections", json);
      })
      .catch(err => {
        console.log(err);
        this.$.toast.fitInto = this;
        this.$.toast.open();
      });
  }

  async _filterAndSort(json, categoryName) {
    const category = this._filterEntries(json, categoryName);

    const categoryWithPrices = await Promise.all(
      category.map(async collection => {
        return Object.assign({}, collection, {
          items: await this._loadItemData(collection.ids)
        });
      }, this)
    );

    const categorySortedAlphabetically = categoryWithPrices
      .slice()
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
      });

    return categorySortedAlphabetically;
  }

  async _loadItemData(ids) {
    const itemsData = await fetch(
      `https://api.guildwars2.com/v2/items?ids=${ids}&lang=${this.language}`
    );
    const pricesData = await fetch(
      `https://api.guildwars2.com/v2/commerce/prices?ids=${ids}&lang=${
        this.language
      }`
    );
    const itemsJson = await itemsData.json();
    const pricesJson = await pricesData.json();

    return itemsJson.map(item => {
      return Object.assign(
        {},
        item,
        pricesJson.find(price => price.id === item.id)
      );
    });
  }

  _filterEntries(collections, category) {
    if (!collections) return;
    return collections.filter(collection => {
      return collection.category == category;
    });
  }
}

window.customElements.define(PageCollections.is, PageCollections);
