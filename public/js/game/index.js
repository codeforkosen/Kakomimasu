import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.js'
import gameListComp from "/js/vue-comp/game-list.js";

const gameTableVue = new Vue({
  el: ".game-table",
  data: {
    games: [[], []],
    nowType: 0,
  },
  components: {
    'games-list': gameListComp,
  },
  methods: {
    update: async function (games) {
      console.log(games);
      this.games = [games.filter(game => game.type === "normal"), games.filter(game => game.type === "self")];
    },

  },
  created: function () {
    this.nowType = 0;
  }
});

var socket = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/api/allGame");
socket.onopen = (event) => {
  //console.log("hello");
}
socket.onmessage = (event) => {
  const games = JSON.parse(event.data);
  gameTableVue.update(games);
}
socket.onerror = (event) => {
  //console.log('ws wrror', event);
}
socket.onclose = (event) => {
  //console.log('ws wrror');
}

const nowTimeVue = new Vue({
  el: "#now-time",
  data: {
    nowTime: "",
  },
  created() {
    this.getNowTime();
    setInterval(this.getNowTime, 1000);
  },
  methods: {
    getNowTime: function () {
      this.nowTime = new Date().toLocaleString("ja-JP");
    },
  },
});