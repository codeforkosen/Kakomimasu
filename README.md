# Kakomimasu
 #procon31 競技部門 コアモジュール for Deno/Node.js/web

[![esmodules](https://taisukef.github.com/denolib/esmodulesbadge.svg)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules)
[![deno](https://taisukef.github.com/denolib/denobadge@1.0.3.svg)](https://deno.land/)

## for Deno 1.0.3

Denoを使う場合、[Denoインストール](https://deno.land/)後、最新版1.0.5ではmjs動作に問題あるので、1.0.3にする
```
$ deno upgrade --version 1.0.3
```

## 利用方法

for Deno or ブラウザ
```
import { Kakomimasu, Board, Action } from "https://taisukef.github.io/Kakomimasu/Kakomimasu.mjs";
const kkmm = new Kakomimasu();
```

for Deno or Node.js
```
$ git close https://github.com/taisukef/Kakomimasu.git
```
main.mjs を編集（そのままでも動きます）
```
import { Kakomimasu, Board, Action } from "../Kakomimasu.mjs";

const kkmm = new Kakomimasu();

const w = 8;
const h = 8;
const points = [];
for (let i = 0; i < w * h; i++) {
  points[i] = i;
}
const nagent = 6;
const board = new Board(w, h, points, nagent);
kkmm.appendBoard(board);

const nturn = 10;
const game = kkmm.createGame(board, nturn);
const p1 = kkmm.createPlayer("test1");
const p2 = kkmm.createPlayer("test2");
game.attachPlayer(p1);
game.attachPlayer(p2);
game.start();
for (;;) {
  const st = game.getStatusJSON();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 1, 1],
    [0, Action.MOVE, 2, 2],
  ]));
  p2.setActions(Action.fromJSON([
    [0, Action.PUT, 1, 1],
    [1, Action.PUT, 1, 2],
  ]));
  if (!game.nextTurn()) {
    break;
  }
}
console.log(game.getStatusJSON());

```
コンソールにて
```
$ deno run main.mjs
```
or 
```
$ node main.mjs
```

## テスト

```
$ cd test
$ deno test *
```

## プロトコル
かこみますネットワークプロトコルを決めようの会  
https://hackmd.io/IDgCfeQ8SqWQuK9PzkG8xQ  


## APIサーバー for Deno

ひとまず、受け取ったaction数だけ返すモックサーバー（[解説](https://fukuno.jig.jp/2876）
```
$ deno run -A main.mjs
```

アクセステスト
```
$ curl -H 'Authorization: token1' -X POST http://localhost:8880/action -d '{"actions":[{"agentID": 2, "dx": 1, "dy": 1, "type": "move"}, {"agentID": 3, "dx": 1, "dy": 1, "type": "move"}]}'

{"yourToken":"token1","yourPath":"/action","nActions":2}
```

## 出典

高専プロコン第31回苫小牧大会  
http://www.procon.gr.jp/  

## 記事

中止になった高専プロコン競技部門はオンラインで遊ぼう！ 競技システムのDeno/Node.js用コアモジュールのオープンソース公開  
https://fukuno.jig.jp/2869  

遊んでくれる人、協力者募集！  
