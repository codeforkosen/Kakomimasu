import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.js'

export const fieldTableComp = {
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
            const h = game.board.height;
            const w = game.board.width;
            this.point = new Array(h);
            this.className = new Array(h);
            for (let i = 0; i < h; i++) {
                this.point[i] = new Array(w);
                this.className[i] = new Array(w);
                for (let j = 0; j < w; j++) {
                    const point = game.board.points[j + i * w];
                    const tile = game.tiled[j + i * w];
                    let pointText = point;
                    if (point < 0 && tile[1] !== -1 && tile[0] === 0) {
                        pointText = `<span class="striket">${point}</span>\n${Math.abs(point)}`;
                    }
                    Vue.set(this.point[i], j, pointText);
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
        }
    }
}