import {
  PolymerElement,
  html
} from "@polymer/polymer/polymer-element.js";
import "@polymer/paper-input/paper-input.js";
import { SharedStyles } from "../shared-styles.js";

class PageChatcodes extends PolymerElement {
  static get is() {
    return "page-chatcodes";
  }

  static get template() {
    return html`
    ${SharedStyles}
    <style>
      :host {
        display: block;
      }

      .flex-spacer {
        padding: var(--spacer-large);
      }

      p {
        margin-bottom: 0;
      }

      .card,
      .credits {
        margin-bottom: var(--spacer-large);
        max-width: 500px;
      }

      .credits {
        display: block;
        margin: var(--spacer-large);
      }

      @media screen and (min-width: 1100px) {
        .flex-spacer {
          display: flex;
          align-items: flex-start;
        }

        .flex-spacer > div {
          flex-basis: 500px;
        }

        .flex-spacer > div:first-child {
          margin-right: var(--spacer-large);
        }
      }
    </style>

    <div class="flex-spacer">
      <div>
        <div class="card">
          <paper-input label="Item (ID or item code)" value="{{itemId}}"></paper-input>
          <paper-input label="Quantity (1–255)" min="1" max="255" type="number" value="{{quantity}}"></paper-input>
          <paper-input label="Upgrade 1 (ID or code)" value="{{upgrade1Id}}"></paper-input>
          <paper-input label="Upgrade 2 (ID or code)" value="{{upgrade2Id}}"></paper-input>
          <paper-input label="Skin (Wardrobe ID)" value="{{skinId}}"></paper-input>
        </div>
    
        <div class="card result">
          Code: <pre>{{result}}</pre>
        </div>
      </div>

      <div>
        <div class="card">
          <h2 class="title">How to use</h2>
          <p>To get wardrobe code go to your account wardrobe in-game, find the skin you want, type /wiki in chat, shift-click the icon in the wardrobe, hit enter and copy the skin # from the wiki page that appears.</p>
        </div>

        <small class="credits text-center">The original code was made in a <a href="https://jsfiddle.net/fffam/cg3njdu6/" target="_blank">JSFiddle</a> by the <a href="https://wiki.guildwars2.com/wiki/Talk:Chat_link_format#Quick_app_for_generating_item_codes" target="_blank">GW2 Wikiuser Fam</a>.</small>
      </div>
    </div>
    `;
  }

  static get properties() {
    return {
      itemId: {
        type: String,
        value: "[&AgFzPAAA]"
      },
      quantity: {
        type: Number,
        value: 1
      },
      upgrade1Id: {
        type: String,
        value: "[&AgGWlQAA]"
      },
      upgrade2Id: {
        type: String,
        value: "[&AgEkuwAA]"
      },
      skinId: {
        type: String,
        value: "[&C94OAAA=]"
      },
      result: {
        type: String,
        value: "Change the values to begin"
      }
    };
  }

  static get observers() {
    return [
      "_calculateNewChatCode(itemId, quantity, upgrade1Id, upgrade2Id, skinId)"
    ];
  }

  _calculateNewChatCode(itemId, quantity, upgrade1Id, upgrade2Id, skinId) {
    if (!itemId || !quantity) return;

    if (itemId == "[&AgH2LQEA]") {
      this.set("result", "[&AkXHBgFAF2AAAA==]");
    } else {
      let result = this._generateChatCodeForItem(
        this._decodeChatCodeForItemOrSkin(itemId) || itemId * 1,
        Number(quantity) * 1 || 1,
        this._decodeChatCodeForItemOrSkin(upgrade1Id) || upgrade1Id * 1,
        this._decodeChatCodeForItemOrSkin(upgrade2Id) || upgrade2Id * 1,
        this._decodeChatCodeForItemOrSkin(skinId) || skinId * 1
      );

      this.set("result", result);
    }
  }

  _decodeChatCodeForItemOrSkin(fullcode) {
    if (!/^\[\&/.test(fullcode)) {
      return 0;
    }

    var code = fullcode.replace(/^\[\&+|\]+$/g, "");
    var binary = window.atob(code);
    var octets = new Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      octets[i] = binary.charCodeAt(i);
    }

    if (octets) {
      if (octets[0] == "2") {
        return (
          octets[2] * 1 + (octets[3] << 8) + (octets[4] ? octets[4] << 16 : 0)
        );
      } else if (octets[0] == "11") {
        return (
          octets[1] * 1 + (octets[2] << 8) + (octets[3] ? octets[4] << 16 : 0)
        );
      } else {
        console.log(fullcode + " must be a valid chat code");
      }
    }

    return 0;
  }

  _generateChatCodeForItem(itemId, quantity, upgrade1Id, upgrade2Id, skinId) {
    // Figure out which header we need based on what components
    //0x00 â€“ Default item
    //0x40 â€“ 1 upgrade component
    //0x60 â€“ 2 upgrade components
    //0x80 â€“ Skinned
    //0xC0 â€“ Skinned + 1 upgrade component
    //0xE0 â€“ Skinned + 2 upgrade components
    var separator =
      16 * ((skinId ? 8 : 0) + (upgrade1Id ? 4 : 0) + (upgrade2Id ? 2 : 0));

    // Arrange the IDs in order
    var ids = [
      2,
      quantity % 256,
      itemId,
      separator,
      skinId,
      upgrade1Id,
      upgrade2Id
    ];

    // Byte length for each part
    var lengths = [
      1,
      1,
      3,
      1,
      skinId ? 4 : 0,
      upgrade1Id ? 4 : 0,
      upgrade2Id ? 4 : 0
    ];

    // Build
    var bytes = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = 0; j < lengths[i]; j++) {
        bytes.push((ids[i] >> (8 * j)) & 0xff);
      }
    }

    // Get code
    var output = window.btoa(String.fromCharCode.apply(null, bytes));
    return "[&" + output + "]";
  }
}

window.customElements.define(PageChatcodes.is, PageChatcodes);
