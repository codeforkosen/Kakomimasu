# Game API

## ゲーム作成

任意のボードでゲームを作成することが出来ます。

### URL

```
POST /api/game/create
```

### パラメータJSON

以下のパラメータを含んだJSONをbodyに入れて送信して下さい。

| Name                       | Type     | Discription                                       |
| -------------------------- | -------- | ------------------------------------------------- |
| `name`<br>任意               | string   | ゲーム名                                              |
| `boardName`<br>必須          | string   | ボード名<br>使用できるボード名は[ボード情報取得API](#ボード情報取得)にて取得できます。 |
| `nPlayer`<br>任意            | number   | 参加人数(既定は2人です)                                     |
| `playerIndentifiers`<br>任意 | string[] | ゲームに参加できるユーザの指定<br>ユーザネームorユーザIDの配列にしてください。       |
| `tournamentId`<br>任意       | string   | 所属する大会ID                                          |

#### パラメータJSONの例

```JSON
{
  "name": "〇〇vs△△",
  "boardName": "A-1"
}
```

### レスポンス

レスポンスのBodyに[Gameオブジェクト](./data.md#Game)が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`2` `3` `204` `302` `400` `401`

---

## ボード情報取得

サーバで使用可能な全てのボード情報を取得できます。

### URL

```
GET /api/game/boards
```

### レスポンス

レスポンスのBodyに[Boardオブジェクト](./data.md#Board)の配列が返ってきます。

---
