# Kakomimasu

#procon31 競技部門 コアモジュール for
[Deno](https://deno.land/)/[Node.js](https://nodejs.org/ja/)/web\
<img src="https://codeforkosen.github.io/Kakomimasu/img/kakomimasu-img.drawio.png">

![.github/workflows/test.yml](https://github.com/codeforkosen/Kakomimasu/workflows/.github/workflows/test.yml/badge.svg)
[![deno](https://img.shields.io/static/v1?logo=deno&label=Deno&message=1.12.0)](https://deno.land/)

<!--[![esmodules](https://taisukef.github.com/denolib/esmodulesbadge.svg)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules)-->

https://github.com/codeforkosen/Kakomimasu/edit/master/README.md 囲みマス\
https://codeforkosen.github.io/Kakomimasu/

## 競技部門ルール

http://www.procon.gr.jp/?p=77044

## APIサーバー

[apiserver/](apiserver)

### 起動方法

```
$ cd apiserver
$ deno run -A apiserver.ts
```

そのあと、[localhost:8880](http://localhost:8880/index)をクリックする。

## APIプロトコル

- [match API](./apiserver/docs/match_api.md)
- [users API](./apiserver/docs/users_api.md)
- [tournaments API](./apiserver/docs/tournaments_api.md)
- [game API](./apiserver/docs/game_api.md)

- [data dictionary](./apiserver/docs/data.md)
- [error](./apiserver/docs/error.md)

## APIクライアント for Deno (JavaScript)

[apiserver/](apiserver)を立ち上げ、[テストページ](http://localhost:8880/)を開いた状態で下記を実行する。

```
$ cd client_deno
$ deno run -A client_a1.js --local
```

別のコンソールから

```
$ cd client_deno
$ deno run -A client_a2.js --local
```

詳細→[Kakomimasu client for deno - README.md](https://github.com/codeforkosen/Kakomimasu/blob/master/client_deno/README.md)

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

## サポート Discord

囲みマス 公式Discord 招待リンク\
https://discord.gg/283ZvKPcUD

## 人vs人で遊んでみる

http://2ndpinew.site/d/test/kakomimasu/local/v0/?w=10&h=10&nAgent=6&endTurn=10&positiveRatio=80&min=-16&max=9

## 利用方法（コアのみ使用する）

for Deno

```typescript
import {
  Action,
  Board,
  Kakomimasu,
} from "https://codeforkosen.github.io/Kakomimasu/Kakomimasu.js";
const kkmm = new Kakomimasu();
```

## 利用方法（リポジトリを取得し、ローカルで使用する）

for Deno

```
$ git clone https://github.com/codeforkosen/Kakomimasu.git
```

main.js を編集（そのままでも動きます）

```javascript
import { Action, Board, Kakomimasu } from "./Kakomimasu.js";

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

囲みマスコア（Kakomimasu.js）のテストを行うには以下を実行

```console
$ deno test ./test
```

囲みマスAPIサーバのテストを行うには、localでサーバを起動した状態で以下を実行

```console
$ deno test ./apiserver
```

Github
Actionsのローカル実行ツール「[act](https://github.com/nektos/act)」を使用したテストを行うには、actとDockerをインストールした状態で以下を実行

```console
$ act
```

## デザイン

Kakomimasu – Figma\
https://www.figma.com/file/oWmSSWHCkRUS3a4h1URvx3/Kakomimasu

## フィールド

参考、2019年 競技部門 公開フィールド\
http://www.procon.gr.jp/?p=76585

## 出典

高専プロコン第31回苫小牧大会\
http://www.procon.gr.jp/

## 記事

2020-06-02 中止になった高専プロコン競技部門はオンラインで遊ぼう！ 競技システムのDeno/Node.js用コアモジュールのオープンソース公開\
https://fukuno.jig.jp/2869

2020-06-09 高専プロコン競技部門を勝手に開催する会オンラインハックデーの進捗、プロトコル、デザイン、Denoで30行のAPIサーバーのモック\
https://fukuno.jig.jp/2876

遊んでくれる人、協力者募集！
