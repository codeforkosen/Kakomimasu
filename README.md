# Kakomimasu

#procon31 競技部門 コアモジュール for
[Deno](https://deno.land/)/[Node.js](https://nodejs.org/ja/)/web\
<img src="https://raw.githubusercontent.com/kakomimasu/img/main/kakomimasu-img.drawio.png">

![.github/workflows/test.yml](https://github.com/codeforkosen/Kakomimasu/workflows/.github/workflows/test.yml/badge.svg)
[![deno](https://img.shields.io/static/v1?logo=deno&label=Deno&message=1.13.2)](https://deno.land/)

## 競技部門ルール

[#procon31の競技ルール](http://www.procon.gr.jp/?p=77044)を元に作成しました。下記URLからご覧ください。

https://hackmd.io/cBAzsJkoSp6c6N5Vggo7VA

## 関連ツール・リポジトリ

### kakomimasu client for Deno

[囲みマス サーバ](#kakomimasu-server)に参戦するためのDeno用クライアントです。

[kakomimasu/client-deno - Github](https://github.com/kakomimasu/client-deno)

### kakomimasu client for C++

[囲みマス サーバ](#kakomimasu-server)に参戦するためのC++用クライアントです。

[kakomimasu/client-cpp - Github](https://github.com/kakomimasu/client-cpp)

### kakomimasu server

オンラインで対戦可能なサーバのコードです。

[kakomimasu/server - Github](https://github.com/kakomimasu/server)

### kakomimasu viewer

[囲みマスビューア](https://kakomimasu.com)のコードです。

[kakomimasu/viewer - Github](https://github.com/kakomimasu/viewer)

## サポート Discord

囲みマス 公式Discord 招待リンク\
https://discord.gg/283ZvKPcUD

## 人vs人で遊んでみる

http://2ndpinew.site/d/test/kakomimasu/local/v0/?w=10&h=10&nAgent=6&endTurn=10&positiveRatio=80&min=-16&max=9

## コア利用方法（コアのみ使用する）

### for Deno

```typescript
import {
  Action,
  Board,
  Kakomimasu,
} from "https://raw.githubusercontent.com/codeforkosen/Kakomimasu/v1.0.0/Kakomimasu.js";
const kkmm = new Kakomimasu();
```

## コア利用方法（リポジトリを取得し、ローカルで使用する）

### for Deno

```console
$ git clone https://github.com/codeforkosen/Kakomimasu.git
```

`sample/main.js` を編集（そのままでも動きます）

コンソールにて

```console
$ deno run sample/main.js
```

## コアテスト

```console
$ deno test ./test
```

Github
Actionsのローカル実行ツール「[act](https://github.com/nektos/act)」を使用したテストを行うには、actとDockerをインストールした状態で以下を実行

```console
$ act
```

## その他

### スマホアプリデザイン案

Kakomimasu – Figma\
https://www.figma.com/file/oWmSSWHCkRUS3a4h1URvx3/Kakomimasu

## 出典

高専プロコン第31回苫小牧大会\
http://www.procon.gr.jp/

## 関連記事

2020-06-02 中止になった高専プロコン競技部門はオンラインで遊ぼう！ 競技システムのDeno/Node.js用コアモジュールのオープンソース公開\
https://fukuno.jig.jp/2869

2020-06-09 高専プロコン競技部門を勝手に開催する会オンラインハックデーの進捗、プロトコル、デザイン、Denoで30行のAPIサーバーのモック\
https://fukuno.jig.jp/2876

遊んでくれる人、協力者募集！
