# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Node.jsで使用できるようにcjs,mjsのファイル、`package.json`を追加

### Changed

- Node.jsモジュール化によるDeno向けエントリーポイントの変更（`./Kakomimasu.js`->`./mod.ts`）
- Boardクラスのコンストラクタ引数をオブジェクトのみ受け取るように変更
- Gameクラス内の2次元配列を削除（型定義を以下のように変更）

```diff
Field.fieldの型を以下のように変更
- type FieldType = 0 | 1;
+ type FieldType = typeof Field.BASE | typeof Field.WALL;

- type FieldCell = [FieldType, number];
+ type FieldCell = { type: FieldType; player: null | number };
```

```diff
Game.logの型を以下のように変更
- public log: {
-   point: { basepoint: number; wallpoint: number };
-   actions: ReturnType<typeof Action.prototype.getJSON>[];
- }[][];

+ public log: {
+   players: {
+     point: { basepoint: number; wallpoint: number };
+     actions: ReturnType<typeof Action.prototype.getJSON>[];
+   }[];
+ }[];
```

```diff
Game.agentsをPlayers.agentsに移行
- game.agents[i]
+ game.players[i].agents
```

### Deprecated

- Kakomimasuクラスの`createGame`,`createPlayer`を非推奨関数に変更（クラス継承時の型定義が上手くいかないため）

```diff
- const game = kkmm.createGame(board);
+ const game = new Game(board);
+ kkmm.addGame(board);
```

```diff
- const player = kkmm.createPlayer(...param);
+ const player = new Player(...param);

// createPlayerはKakomimasuクラスとは独立していたため`addPlayer`は無しでよい。
```

## [1.0.0] - 2021-09-27

### Added

- v1.0.0 Release
