import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";

import "@vaadin/vaadin-grid/vaadin-grid";

import { SharedStyles } from "../shared-styles";
import { SharedWvwStyles } from "../shared-wvw-styles";

import { connect } from "pwa-helpers/connect-mixin.js";

// Load redux store
import { store } from "../../store.js";

import settings from "../../reducers/settings.js";
store.addReducers({
  settings
});

/**
 * `wvw-matchup`
 *
 * @customElement
 * @polymer
 * @demo
 *
 */
class WvWMatchup extends connect(store)(PolymerElement) {
  static get properties() {
    return {
      matchup: Object,
      worlds: Array,
      skirmishesDesc: {
        type: Array,
        computed: "_reverseSkirmishes(matchup.skirmishes)"
      },
      theme: String
    };
  }

  static get template() {
    return html`
      ${SharedStyles} ${SharedWvwStyles}
      <style>
        :host {
          padding: var(--spacer-medium) var(--spacer-small) 0;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .title:not(:first-child) {
          margin-top: var(--spacer-large);
        }

        .subtitle {
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0;
        }

        .subtitle:not(:first-child) {
          margin-top: 0.5rem;
        }

        .cards {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .card {
          padding: 0;
          margin-bottom: var(--spacer-medium);
        }

        .card-header {
          padding: var(--spacer-medium) var(--spacer-medium) var(--spacer-small);
          font-weight: 600;
          box-shadow: var(--gwn-box-shadow);
          min-height: 3rem;
        }

        .card-header.world {
          color: var(--gwn-text-light);
        }

        .card-body {
          padding: var(--spacer-small) var(--spacer-medium);
        }

        gwn-progress {
          font-size: 0.75rem;
        }

        .skirmish-id {
          width: 4rem;
        }

        @media screen and (min-width: 768px) {
          :host {
            padding: var(--spacer-large);
          }

          .cards {
            flex-direction: row;
          }

          .worlds .card {
            width: calc(100% / 3 - 1rem);
            margin-bottom: 0;
          }

          .maps .card {
            width: calc(100% / 2 - 1rem);
          }
        }

        @media screen and (min-width: 1100px) {
          .maps .card {
            width: calc(100% / 4 - 1rem);
          }
        }
      </style>

      <div class="container">
        <h2 class="title">Worlds</h2>
        <div class="worlds cards">
          <div class="card">
            <div class="world card-header team-green-bg no-text-overflow">
              [[ _generateWorldLinkNames(matchup.all_worlds.green,
              matchup.worlds.green, worlds) ]]
            </div>
            <div class="card-body">
              <div>Victory Points: [[ matchup.victory_points.green ]]</div>
              <div>Score: [[ matchup.scores.green ]]</div>
              <div>Kills: [[ matchup.kills.green ]]</div>
              <div>Deaths: [[ matchup.deaths.green ]]</div>
              <div>
                <span title="Kill death ratio">KDR</span>: [[
                _calcKDR(matchup.kills.green, matchup.deaths.green) ]]
              </div>
              <div>
                <span title="Points per tick">PPT</span>: [[
                _getPPT(matchup.maps, "green") ]]
              </div>
            </div>
          </div>
          <div class="card">
            <div class="world card-header team-blue-bg no-text-overflow">
              [[ _generateWorldLinkNames(matchup.all_worlds.blue,
              matchup.worlds.blue, worlds) ]]
            </div>
            <div class="card-body">
              <div>Victory Points: [[ matchup.victory_points.blue ]]</div>
              <div>Score: [[ matchup.scores.blue ]]</div>
              <div>Kills: [[ matchup.kills.blue ]]</div>
              <div>Deaths: [[ matchup.deaths.blue ]]</div>
              <div>
                <span title="Kill death ratio">KDR</span>: [[
                _calcKDR(matchup.kills.blue, matchup.deaths.blue) ]]
              </div>
              <div>
                <span title="Points per tick">PPT</span>: [[
                _getPPT(matchup.maps, "blue") ]]
              </div>
            </div>
          </div>
          <div class="card">
            <div class="world card-header team-red-bg no-text-overflow">
              [[ _generateWorldLinkNames(matchup.all_worlds.red,
              matchup.worlds.red, worlds) ]]
            </div>
            <div class="card-body">
              <div>Victory Points: [[ matchup.victory_points.red ]]</div>
              <div>Score: [[ matchup.scores.red ]]</div>
              <div>Kills: [[ matchup.kills.red ]]</div>
              <div>Deaths: [[ matchup.deaths.red ]]</div>
              <div>
                <span title="Kill death ratio">KDR</span>: [[
                _calcKDR(matchup.kills.red, matchup.deaths.red) ]]
              </div>
              <div>
                <span title="Points per tick">PPT</span>: [[
                _getPPT(matchup.maps, "red") ]]
              </div>
            </div>
          </div>
        </div>

        <h2 class="title">Maps</h2>
        <div class="maps cards">
          <template is="dom-repeat" items="{{ matchup.maps }}" as="map">
            <div class="card">
              <div class="card-header map">[[ _resolveBLName(map.type) ]]</div>
              <div class="card-body">
                <h3 class="subtitle">Scores</h3>
                <gwn-progress
                  class="green"
                  progress="[[ map.scores.green ]]"
                  max="[[ _highestScore(map.scores) ]]"
                  >[[ map.scores.green ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ map.scores.blue ]]"
                  max="[[ _highestScore(map.scores) ]]"
                  >[[ map.scores.blue ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ map.scores.red ]]"
                  max="[[ _highestScore(map.scores) ]]"
                  >[[ map.scores.red ]]</gwn-progress
                >

                <h3 class="subtitle">Kills</h3>
                <gwn-progress
                  class="green"
                  progress="[[ map.kills.green ]]"
                  max="[[ _highestScore(map.kills) ]]"
                  >[[ map.kills.green ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ map.kills.blue ]]"
                  max="[[ _highestScore(map.kills) ]]"
                  >[[ map.kills.blue ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ map.kills.red ]]"
                  max="[[ _highestScore(map.kills) ]]"
                  >[[ map.kills.red ]]</gwn-progress
                >

                <h3 class="subtitle">Deaths</h3>
                <gwn-progress
                  class="green"
                  progress="[[ map.deaths.green ]]"
                  max="[[ _highestScore(map.deaths) ]]"
                  >[[ map.deaths.green ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ map.deaths.blue ]]"
                  max="[[ _highestScore(map.deaths) ]]"
                  >[[ map.deaths.blue ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ map.deaths.red ]]"
                  max="[[ _highestScore(map.deaths) ]]"
                  >[[ map.deaths.red ]]</gwn-progress
                >

                <h3 class="subtitle">KDR</h3>
                <gwn-progress
                  class="green"
                  progress="[[ _calcKDR(map.kills.green, map.deaths.green) ]]"
                  max="[[ _highestKDR(map.kills, map.deaths) ]]"
                  >[[ _calcKDR(map.kills.green, map.deaths.green)
                  ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ _calcKDR(map.kills.blue, map.deaths.blue) ]]"
                  max="[[ _highestKDR(map.kills, map.deaths) ]]"
                  >[[ _calcKDR(map.kills.blue, map.deaths.blue) ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ _calcKDR(map.kills.red, map.deaths.red) ]]"
                  max="[[ _highestKDR(map.kills, map.deaths) ]]"
                  >[[ _calcKDR(map.kills.red, map.deaths.red) ]]</gwn-progress
                >
              </div>
            </div>
          </template>
        </div>

        <h2 class="title">Skirmishes</h2>
        <div class="card">
          <vaadin-grid
            theme$="no-border row-stripes [[theme]]"
            aria-label="Skirmish overview"
            items="[[skirmishesDesc]]"
          >
            <vaadin-grid-column width="54px" flex-grow="0">
              <template class="header"
                >#</template
              >
              <template
                >[[ item.id ]]</template
              >
              <template class="footer"
                >#</template
              >
            </vaadin-grid-column>

            <vaadin-grid-column>
              <template class="header"
                >Matchup Score</template
              >
              <template>
                <gwn-progress
                  class="green"
                  progress="[[ _accumulatedScore(skirmishesDesc, index, 'green') ]]"
                  max="[[ _highestScore(matchup.scores) ]]"
                  >[[ _accumulatedScore(skirmishesDesc, index, 'green')
                  ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ _accumulatedScore(skirmishesDesc, index, 'blue') ]]"
                  max="[[ _highestScore(matchup.scores) ]]"
                  >[[ _accumulatedScore(skirmishesDesc, index, 'blue')
                  ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ _accumulatedScore(skirmishesDesc, index, 'red') ]]"
                  max="[[ _highestScore(matchup.scores) ]]"
                  >[[ _accumulatedScore(skirmishesDesc, index, 'red')
                  ]]</gwn-progress
                >
              </template>
              <template class="footer"
                >Matchup Score</template
              >
            </vaadin-grid-column>

            <vaadin-grid-column>
              <template class="header"
                >Skirmish Score</template
              >
              <template>
                <gwn-progress
                  class="green"
                  progress="[[ item.scores.green ]]"
                  max="[[ _highestScore(item.scores) ]]"
                  >[[ item.scores.green ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ item.scores.blue ]]"
                  max="[[ _highestScore(item.scores) ]]"
                  >[[ item.scores.blue ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ item.scores.red ]]"
                  max="[[ _highestScore(item.scores) ]]"
                  >[[ item.scores.red ]]</gwn-progress
                >
              </template>
              <template class="footer"
                >Skirmish Score</template
              >
            </vaadin-grid-column>

            <vaadin-grid-column>
              <template class="header"
                >Eternal Battlegrounds</template
              >
              <template>
                <gwn-progress
                  class="green"
                  progress="[[ item.map_scores.0.scores.green ]]"
                  max="[[ _highestScore(item.map_scores.0.scores) ]]"
                  >[[ item.map_scores.0.scores.green ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ item.map_scores.0.scores.blue ]]"
                  max="[[ _highestScore(item.map_scores.0.scores) ]]"
                  >[[ item.map_scores.0.scores.blue ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ item.map_scores.0.scores.red ]]"
                  max="[[ _highestScore(item.map_scores.0.scores) ]]"
                  >[[ item.map_scores.0.scores.red ]]</gwn-progress
                >
              </template>
              <template class="footer"
                >Eternal Battlegrounds</template
              >
            </vaadin-grid-column>

            <vaadin-grid-column>
              <template class="header"
                >Red Borderland</template
              >
              <template>
                <gwn-progress
                  class="green"
                  progress="[[ item.map_scores.1.scores.green ]]"
                  max="[[ _highestScore(item.map_scores.1.scores) ]]"
                  >[[ item.map_scores.1.scores.green ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ item.map_scores.1.scores.blue ]]"
                  max="[[ _highestScore(item.map_scores.1.scores) ]]"
                  >[[ item.map_scores.1.scores.blue ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ item.map_scores.1.scores.red ]]"
                  max="[[ _highestScore(item.map_scores.1.scores) ]]"
                  >[[ item.map_scores.1.scores.red ]]</gwn-progress
                >
              </template>
              <template class="footer"
                >Red Borderland</template
              >
            </vaadin-grid-column>

            <vaadin-grid-column>
              <template class="header"
                >Blue Borderland</template
              >
              <template>
                <gwn-progress
                  class="green"
                  progress="[[ item.map_scores.2.scores.green ]]"
                  max="[[ _highestScore(item.map_scores.2.scores) ]]"
                  >[[ item.map_scores.2.scores.green ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ item.map_scores.2.scores.blue ]]"
                  max="[[ _highestScore(item.map_scores.2.scores) ]]"
                  >[[ item.map_scores.2.scores.blue ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ item.map_scores.2.scores.red ]]"
                  max="[[ _highestScore(item.map_scores.2.scores) ]]"
                  >[[ item.map_scores.2.scores.red ]]</gwn-progress
                >
              </template>
              <template class="footer"
                >Blue Borderland</template
              >
            </vaadin-grid-column>

            <vaadin-grid-column>
              <template class="header"
                >Green Borderland</template
              >
              <template>
                <gwn-progress
                  class="green"
                  progress="[[ item.map_scores.3.scores.green ]]"
                  max="[[ _highestScore(item.map_scores.3.scores) ]]"
                  >[[ item.map_scores.3.scores.green ]]</gwn-progress
                >
                <gwn-progress
                  class="blue"
                  progress="[[ item.map_scores.3.scores.blue ]]"
                  max="[[ _highestScore(item.map_scores.3.scores) ]]"
                  >[[ item.map_scores.3.scores.blue ]]</gwn-progress
                >
                <gwn-progress
                  class="red"
                  progress="[[ item.map_scores.3.scores.red ]]"
                  max="[[ _highestScore(item.map_scores.3.scores) ]]"
                  >[[ item.map_scores.3.scores.red ]]</gwn-progress
                >
              </template>
              <template class="footer"
                >Green Borderland</template
              >
            </vaadin-grid-column>
          </vaadin-grid>
        </div>
      </div>
    `;
  }

  _getPPT(maps, color) {
    if (!maps || !color) return;
    return maps.reduce((totalPPT, map) => {
      return (
        totalPPT +
        map.objectives.reduce((mapPPT, objective) => {
          if (objective.owner.toLowerCase() == color)
            return mapPPT + objective.points_tick;
          return mapPPT;
        }, 0)
      );
    }, 0);
  }

  _generateWorldLinkNames(allWorldsInLink, hostWorld, worlds) {
    if (!allWorldsInLink || !hostWorld || !worlds) return;

    const linkedWorlds = allWorldsInLink.filter(world => {
      return world !== hostWorld;
    });

    const linkedWorldsWithNames = linkedWorlds.map(worldId => {
      return this._resolveWorldName(worldId, worlds);
    });

    const hostWorldName = this._resolveWorldName(hostWorld, worlds);

    return linkedWorlds.length > 0
      ? `${hostWorldName} (${linkedWorldsWithNames.join(", ")})`
      : hostWorldName;
  }

  _resolveWorldName(worldId, worlds) {
    if (!worldId || !worlds) return;

    const foundWorld = worlds.find(world => {
      return world.id == worldId;
    });

    return foundWorld.name;
  }

  _calcKDR(kills, deaths) {
    if (!kills || !deaths) return;
    return parseFloat(Math.round((kills / deaths) * 100) / 100).toFixed(2);
  }

  _highestKDR(kills, deaths) {
    if (!kills || !deaths) return;
    return Math.max(
      this._calcKDR(kills.green, deaths.green),
      this._calcKDR(kills.blue, deaths.blue),
      this._calcKDR(kills.red, deaths.red)
    );
  }

  _highestScore(scores) {
    if (!scores) return;
    return Math.max(scores.green, scores.blue, scores.red);
  }

  _accumulatedScore(skirmishes, index, team) {
    if (!skirmishes || index < 0 || !team) return;

    let accumulatedScores = 0;

    for (let i = index; i < skirmishes.length; i++) {
      accumulatedScores += skirmishes[i].scores[team];
    }

    return accumulatedScores;
  }

  _reverseSkirmishes(skirmishes) {
    return skirmishes.reverse();
  }

  _resolveBLName(type) {
    switch (type) {
      case "Center":
        return "Eternal Battlegrounds";
      case "RedHome":
        return "Red Borderland";
      case "BlueHome":
        return "Blue Borderland";
      case "GreenHome":
        return "Green Borderland";
    }
  }

  _stateChanged({ settings }) {
    if (!settings) return;
    this.set("theme", settings.theme);
  }
}

customElements.define("wvw-matchup", WvWMatchup);
