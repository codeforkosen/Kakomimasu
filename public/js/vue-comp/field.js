import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.js';

import { userShow } from "/js/util.js";

class PlayerInfo {
  constructor() {
    this.screenName = "";
    this.link = "";
    this.spec = "";
    this.placedAgentNum = 0;
    this.notPlacedAgentNum = 0;
  }
}

export const VFieldInfo = new Vue({
  el: "#field",
  data: {
    players: [],
    turn: "-",
    pPoint: [],
    status: "",

    className: [],
    game: {},
    playerName: [],
  },
  template:
    `<div id="field-info">
          <div v-for="(p,i) in players" :style="{'order':i}" class="player-info">
              <table>
                  <tr>
                      <th><span :class="'p' + (i+1)">プレイヤー名</span></th>
                      <td><a :href="p.link">{{ p.screenName }}</a></td>
                  </tr>
                  <tr>
                      <th><span :class="'p' + (i+1)">配置済みAgent数</span></th>
                      <td>{{ p.placedAgentNum }}</td>
                  </tr>
                  <tr>
                      <th><span :class="'p' + (i+1)">未配置Agent数</span></th>
                      <td>{{ p.notPlacedAgentNum }}</td>
                  </tr>
              </table>
          </div>
          <div style="margin: auto;display: inline-block;"
              :style="{'grid-row':'span '+ Math.ceil(players.length / 2)}">
              <div id="field-info" style="position:relative;height: 30px;min-width: 16em;" v-cloak>
                  <h4 v-if="turn !== '-'" id="field-turn">{{ turn }}</h4>
                  <h4 v-if="turn !== '-'" id="field-point">
                      <span v-for="(item, index) in pPoint">
                          <span :class="[\`p\${index + 1}\`]">{{ item }}</span>
                          <span v-if="index < pPoint.length - 1">:</span>
                      </span>
                  </h4>
                  <h4 v-if="turn === '-'" id="field-point">{{ status }}</h4>
                  <h4 v-if="turn !== '-'" id="field-nextTurnTime">{{ status }}</h4>
              </div>
              <div id="field-table">
                  <table id="vue-field-table" v-cloak>
                      <tbody>
                          <tr v-if="height.length !== 0">
                              <th></th>
                              <th v-for="x in width">{{x}}</th>   
                              <th></th> 
                          </tr>
                          <tr v-for="y in height">
                              <th>{{y}}</th>
                              <td v-for="x in width" :class="tileClass(x,y)">
                                  <span class="striket" v-if="isSurrounded(x,y)">{{point(x,y)}}</span>
                                  <br>
                                  <span v-if="isSurrounded(x.y)">{{Math.abs(point(x,y))}}</span>
                                  <span v-else>{{point(x,y)}}</span>
                                  <div class="detail" v-if="isAgent(x,y)">
                                      <span>{{playerName[isAgent(x,y).player]}}:{{isAgent(x,y).n+1}}</span><br>
                                      <span>行動履歴</span>
                                      <div class="history">
                                          <div v-for="(item,i) in agentHistory(isAgent(x,y))" :style="{'text-decoration':(item.res > 0) ? 'line-through':'none'}">
                                              <span>T{{item.turn}}：</span>
                                              <span v-if="item?.x"> x:{{item?.x}} , y:{{item?.y}}に</span>
                                              <span>{{item?.type}}</span>
                                          </div>
                                          </div>
                                  </div>
                              </td><th>{{y}}</th>
                          </tr>
                          <tr v-if="height.length !== 0">
                              <th></th>
                              <th v-for="x in width">{{x}}</th>   
                              <th></th> 
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>`,
  methods: {
    init: async function (game) {
      for (let i = 0; i < game.board.nPlayer; i++) {
        Vue.set(this.players, i, new PlayerInfo());
        if (game.players[i] !== undefined) {
          const user = await userShow(game.players[i].id);
          this.players[i].screenName = user.screenName;
          this.players[i].link = `/user/${user.name}`;

          pointChart.data.datasets[i].label = user.screenName;
        }
      }

    },
    tableInit: function (game) {
      this.game = game;
      const h = game.board.height;
      const w = game.board.width;
      this.className = new Array(h);
      for (let i = 0; i < h; i++) {
        this.className[i] = new Array(w);
        for (let j = 0; j < w; j++) {
          Vue.set(this.className[i], j, "");
        }
      }

      Vue.nextTick(() => {
        const tds = this.$el.getElementsByTagName("td");
        for (let i = 0; i < tds.length; i++) {
          const e = tds[i];
          const p = parseInt(e.innerText);
          let colorStr = "#";
          if (p < 0) {
            let bn = 0xFF;
            bn *= Math.abs(p + 16) / 16 * 0.5 + 0.5;
            bn &= 0xFF;
            for (let i = 0; i < 3; i++) colorStr += toHex(bn);
          } else if (p > 0) {
            let bn = 0xFF;
            bn *= Math.abs(p - 16) / 16 * 0.5 + 0.5;
            bn &= 0xFF;
            colorStr += `FFFF${toHex(bn)}`;
          }
          e.style.setProperty("--bg-color", colorStr);
        }
      });

      function toHex(v) {
        return ('00' + v.toString(16).toUpperCase()).substr(-2);
      }
    },
    update: async function (game) {
      //console.log(game);
      for (let i = 0; i < game.players.length; i++) {
        if (game.players[i] !== undefined) {
          if (this.players[i] === undefined) {
            Vue.set(this.players, i, new PlayerInfo());
          }
          if (this.players[i].screenName === "") {
            const user = await userShow(game.players[i].id);
            this.players[i].screenName = user.screenName;
            this.players[i].link = `user.html?id=${user.name}`;
            this.playerName.splice(i, 1, user.screenName);
          }
          let placedAgentNum = 0;
          let notPlacedAgentNum = 0;
          if (game.players[i].agents !== null) {
            game.players[i].agents.forEach(e => {
              if (e.x === -1 && e.y === -1) notPlacedAgentNum++;
              else placedAgentNum++;
            });
          }
          this.players[i].placedAgentNum = placedAgentNum;
          this.players[i].notPlacedAgentNum = notPlacedAgentNum;
        }
      }
      console.log(this.playerName);
    },
    index: function (x, y) {
      return x + y * this.game.board.width;
    },
    point: function (x, y) {
      return this.game.board.points[this.index(x, y)];
    },
    isSurrounded: function (x, y) {
      return this.point(x, y) < 0 && this.tiled(x, y)[1] !== -1 && this.tiled(x, y)[0] === 0
    },
    isAgent: function (x, y) {
      if (this.game.players) {
        const agent = this.game.players.map((e, i) => e.agents.map((e_, j) => { return { agent: e_, player: i, n: j }; })).flat().find(e => e.agent.x === x && e.agent.y === y);
        return agent;
      } else return undefined;
    },
    tiled: function (x, y) {
      if (this.game.tiled) return this.game.tiled[this.index(x, y)];
      else return [0, -1];
    },
    isConflict: function (x, y) {
      if (this.game.log) {
        const lastActLog = this.game.log[this.game.log.length - 1]?.map(e => e.actions).flat();
        const isConflict = lastActLog?.some(a => ((a.res > 0 && a.res < 3) && a.x === x && a.y === y));
        return isConflict;
      }
      else return false;
    },
    tileClass: function (x, y) {
      const classObj = {};
      const [type, pid] = this.tiled(x, y);
      if (pid !== -1) {
        if (type === 1) {
          classObj[`p${pid + 1}Wall`] = true;
          const agent = this.isAgent(x, y);
          if (agent) {
            classObj["agent"] = true;
            classObj[`agent${agent.player + 1}`] = true;
          }
        }
        else if (type === 0) classObj[`p${pid + 1}Area`] = true;
      }
      if (this.isConflict(x, y)) {
        classObj["conflict"] = true;
      }
      return classObj;
    },
    agentHistory: function (agent) {
      const log = this.game.log;
      if (!log) return [];
      const pid = agent.player, aid = agent.n;

      const history = [];
      for (let i = 0; i < log.length; i++) {
        const act = {};
        Object.assign(act, log[i][pid].actions.find(e => e.agentId === aid));
        if (act) {
          //console.log(act.type);
          if (act.type === 1) act.type = "配置";
          else if (act.type === 3) act.type = "移動";
          else if (act.type === 4) act.type = "除去";
          else {
            act.type = "停留";
            act.x = act.y = undefined;
          }
        }
        else {
          act.type = "停留"
        }
        act.turn = i;
        history.push(act);
      }
      return history.reverse();
    }
  },
  computed: {
    width: function () {
      const ary = [];
      for (let i = 0; i < this.game?.board?.width; i++) ary[i] = i;
      return ary;
    },
    height: function () {
      const ary = [];
      for (let i = 0; i < this.game?.board?.height; i++) ary[i] = i;
      return ary;
    }
  }
});