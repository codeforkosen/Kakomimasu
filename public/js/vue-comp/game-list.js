import { Game, getTurnText, getUserDetailUrl, getGameDetailUrl } from "/js/util.js";
import { getUser } from "/js/api-util.js";

export default {
  props: ["games"],
  data() {
    return {
      data: [],
      users: [],
    }
  },
  methods: {
    goGameDetail(url) {
      location.href = url;
    },
  },
  watch: {
    async games(newData, o) {
      const games = newData.slice().reverse();

      const data = [];
      for (const g of games) {
        const [, startTime] = Game.getGameStatus(g);

        let status = "waiting";
        if (g.ending) status = "ending";
        else if (g.gaming) status = "gaming";

        const players = await Promise.all(g.players.map(async (p) => {
          let user = this.users.find(u => u.id === p.id);
          if (!user) {
            user = await getUser(p.id);
            user.id = p.id;
            user.url = getUserDetailUrl(user.id);
            this.users.push(user);
          }
          return user;
        }));
        data.push({
          status,
          players,
          link: `gamedetails.html?id=${g.gameId}`,
          gameName: g.gameName,
          gameId: g.gameId,
          startTime,
          turn: getTurnText(g),
          url: getGameDetailUrl(g.gameId),
        });
      }
      this.data = data;
    }
  },
  template: `
      <table>
          <tr>
              <td class="status">
                  <div>ステータス</div>
                  <div>ターン</div>
              </td>
              <td>
                  <div class="players">
                      <div class="player">
                          <div>
                              <span>プレイヤー名</span>
                              <br>ポイント
                          </div>
                      </div>
                  </div>
              </td>
              <td class="game-name">
                  <div>ゲーム名</div>
                  <div class="id">ゲームID</div>
              </td>
              <td>開始時間</td>
          </tr>
          <tr v-for="(game,i) in data" @click="goGameDetail(game.url)">
              <td class="status">
                  <div :class="game.status">●</div>
                  <div>{{game.turn}}</div>
              </td>
              <td>
                  <div class="players">
                      <div v-for="(player,i) in game.players" class="player">
                          <div v-if="i !== 0">vs</div>
                          <div>
                              <span v-if="player?.screenName"><a
                                      :href="player.url">{{player.screenName}}</a></span>
                              <span v-else class="un">No player</span>

                              <br>point
                          </div>
                      </div>
                  </div>
              </td>
              <td class="game-name">
                  <div v-if="game.gameName">{{game.gameName}}</div>
                  <div v-else class="un">Untitle</div>

                  <div class="id">{{game.gameId}}</div>
              </td>
              <td>{{game.startTime}} 開始</td>
          </tr>
      </table>
      `,
}