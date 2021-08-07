# Match API

## ゲーム参加

空いてるゲームに参加、指定したゲームIDのゲームに参加、対AI戦に参加などが出来ます。

### URL

```
POST /match
```

### Authorizationヘッダ

HTTPリクエストのヘッダにBearer認証を含める必要があります。

### パラメータJSON

以下のパラメータを含んだJSONをbodyに入れて送信して下さい。

| Name                       | Type    | Discription                                                           |
| -------------------------- | ------- | --------------------------------------------------------------------- |
| `spec`<br>任意               | string  | 紹介文<br>ゲームには影響しません                                                    |
| `gameId`<br>任意             | string  | ゲームID<br>指定のゲームに参加したい場合にこのパラメータを含めてください                               |
| `useAi`<br>任意              | boolean | AIを使うかどうか                                                             |
| `aiOption`<br>任意           | object  | AIのオプション<br> `aiName`や`boardName`を含めたオブジェクトです。                        |
| `aiOption.aiName`<br>必須    | string  | AI名<br>使用できるAI名については[AI名](../../client_deno/README.md#AI名)をご覧ください     |
| `aiOption.boardName`<br>任意 | string  | ボード名<br>使用できるボード名については[ボード名](../../client_deno/README.md#ボード名)をご覧ください |

#### パラメータJSONの例

```JSON
{
  "id": "6463f6a3-dd36-453d-af8f-71bef04b207c",
  "password": "password",
  "spec": "機械学習",
  "useAi": true,
  "aiOption": {
    "aiName": "a1"
  }
}
```

### レスポンス

レスポンスのBodyに参加プレイヤーのJSON情報が返ってきます。

| Name     | Type   | Discription                                          |
| -------- | ------ | ---------------------------------------------------- |
| `userId` | string | 参加プレイヤーのユーザID                                        |
| `spec`   | string | 参加プレイヤーのspec                                         |
| `gameId` | string | ゲームID                                                |
| `index`  | string | インデックス<br>ゲーム詳細を取得した際の、players内のどのインデックスが自分かを表しています。 |

#### レスポンスJSONの例

```JSON
{
  "userId": "6463f6a3-dd36-453d-af8f-71bef04b207c",
  "spec": "",
  "gameId": "833b167a-d40b-49e5-b0e2-9d3de3e8d532",
  "index": 0
}
```

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`2` `3` `4` `100` `101` `102` `200` `204` `205`

---

## ゲーム詳細取得

ゲームの詳細を取得することが出来ます。

### URL

```
GET /api/match/(gameId)
```

#### URLの例

```
http://localhost:8880/api/match/833b167a-d40b-49e5-b0e2-9d3de3e8d532
```

### レスポンス

レスポンスのBodyに[Gameオブジェクト](./data.md#Game)が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`100`

---

## 行動送信

エージェントの行動を送信することができます。

### URL

```
POST /api/match/(gameId)/action
```

### Authorizationヘッダ

HTTPリクエストのヘッダにBearer認証を含める必要があります。

### パラメータJSON

以下のパラメータを含んだJSONをbodyに入れて送信して下さい。

| Name            | Type   | Discription                                                                                                                                    |
| --------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `actions`<br>必須 | 行動情報[] | 行動情報の配列<br>以下の行動情報を配列にして送信してください。                                                                                                              |
| `index`<br>任意   | number | ゲーム参加APIにて取得されたインデックスが入ります。<br>同じユーザ同士で対戦させる場合にBearerTokenではプレイヤーの判別ができないためこの`index`を使用します。<br>BearerTokenでプレイヤーが特定される場合には`index`パラメータは無視されます。 |

#### 行動情報

| Name            | Type   | Discription                                    |
| --------------- | ------ | ---------------------------------------------- |
| `agentId`<br>必須 | number | エージェントのIDです。                                   |
| `type`<br>必須    | string | 行動の種類<br> `PUT`,`NONE`,`MOVE`,`REMOVE`が指定できます。 |
| `x`<br>必須       | number | x座標                                            |
| `y`<br>必須       | number | y座標                                            |

#### パラメータJSONの例

```JSON
{
  "actions": [
    { "agentId": 0, "type": "PUT", "x": 0, "y": 0 },
    { "agentId": 1, "type": "MOVE", "x": 5, "y": 6 }
  ]
}
```

### レスポンス

レスポンスのBodyに以下のJSONが返ってきます。

| Name                | Type   | Discription    |
| ------------------- | ------ | -------------- |
| `receptionUnixTime` | number | 行動を受信したUNIX時間  |
| `turn`              | number | 受信したときのゲームのターン |

#### レスポンスJSONの例

```JSON
{
  "receptionUnixTime": 1616655464,
  "turn": 0
}
```

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`2` `3` `4` `104`,`207`
