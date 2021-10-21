# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Node.jsモジュール化によるDeno向けエントリーポイントの変更（`./Kakomimasu.js`->`./mod.ts`）
- Gameクラス内の2次元配列を削除

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

## [1.0.0] - 2021-09-27

### Added

- v1.0.0 Release
