const fieldTableComp = {
    data: function () {
        return {
            point: [],
            className: [],
        }
    },
    template:
        `<table id="vue-field-table" v-cloak>
            <tbody>
                <tr v-for="(row,y) in point">
                    <td v-for="(item,x) in row" :class="className[y][x]" v-html="item"></td>
                </tr>
            </tbody>
        </table>`,
    methods: {
        init: function (game) {
            this.point = new Array(game.board.height);
            this.className = new Array(game.board.height);
            for (let i = 0; i < game.board.height; i++) {
                this.point[i] = new Array(game.board.width);
                this.className[i] = new Array(game.board.width);
            }
            for (let i = 0; i < game.board.height; i++) {
                for (let j = 0; j < game.board.width; j++) {
                    Vue.set(this.point[i], j, game.board.points[j + i * game.board.width]);
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
        pointUpdate: function (game) {
            for (let i = 0; i < this.point.length; i++) {
                for (let j = 0; j < this.point[i].length; j++) {
                    const point = game.board.points[j + i * game.board.width];
                    const tile = game.tiled[j + i * game.board.width];
                    let pointText = point;
                    if (point < 0 && tile[1] !== -1 && tile[0] === 0) {
                        pointText = `<span class="striket">${point}</span>\n${Math.abs(point)}`;
                    }
                    Vue.set(this.point[i], j, pointText);
                }
            }
        }
    }
}