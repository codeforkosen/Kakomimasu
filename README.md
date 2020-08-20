# Kakomimasu
 #procon31 競技部門 コアモジュール for [Deno](https://deno.land/)/[Node.js](https://nodejs.org/ja/)/web  

[![deno](https://taisukef.github.com/denolib/denobadge@1.2.0.svg)](https://deno.land/)  

<!--[![esmodules](https://taisukef.github.com/denolib/esmodulesbadge.svg)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules)-->  
https://github.com/codeforkosen/Kakomimasu/edit/master/README.md
囲みマス  
https://codeforkosen.github.io/Kakomimasu/  

## 競技部門ルール  

http://www.procon.gr.jp/?p=77044  

## 人vs人で遊んでみる

http://2ndpinew.site/d/test/kakomimasu/local/v0/?w=10&h=10&nAgent=6&endTurn=10&positiveRatio=80&min=-16&max=9  

## 利用方法（コアのみ使用する）

for Deno
```
import { Kakomimasu, Board, Action } from "https://taisukef.github.io/Kakomimasu/Kakomimasu.js";
const kkmm = new Kakomimasu();
```

## 利用方法（リポジトリを取得し、ローカルで使用する）

for Deno
```
$ git close https://github.com/taisukef/Kakomimasu.git
```
main.js を編集（そのままでも動きます）
```
import { Kakomimasu, Board, Action } from "./Kakomimasu.js";

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
$ deno run main.js
```

## テスト

```
$ deno test
```

## デザイン
Kakomimasu – Figma  
https://www.figma.com/file/oWmSSWHCkRUS3a4h1URvx3/Kakomimasu  

## プロトコル
かこみますネットワークプロトコルを決めようの会  
https://hackmd.io/IDgCfeQ8SqWQuK9PzkG8xQ  

## APIサーバー

[apiserver/](apiserver)  

## APIサーバー for Deno

```
$ cd apiserver
$ deno run -A apiserver.js
```

## APIクライアント for Deno (JavaScript)

[apiserver/](apiserver)を立ち上げ、[テストページ](http://localhost:8880/game)を開いた状態で下記を実行する。

```
$ cd client_deno
$ deno run -A client_test1.js
```
別のコンソールから
```
$ cd client_deno
$ deno run -A client_test2.js
```

## APIクライアント for Node

```
$ cd client_node
$ node action.mjs
```

## APIクライアント for C (Mac/Windows gcc)

```
$ cd client_c
$ gcc action_test.c
$ ./a.out
```

## 出典

高専プロコン第31回苫小牧大会  
http://www.procon.gr.jp/  

## 記事

2020-06-02 中止になった高専プロコン競技部門はオンラインで遊ぼう！ 競技システムのDeno/Node.js用コアモジュールのオープンソース公開  
https://fukuno.jig.jp/2869  

2020-06-09 高専プロコン競技部門を勝手に開催する会オンラインハックデーの進捗、プロトコル、デザイン、Denoで30行のAPIサーバーのモック  
https://fukuno.jig.jp/2876  

遊んでくれる人、協力者募集！ 
