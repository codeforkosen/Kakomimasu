# Tournaments API

## 大会登録

大会を新規登録することが出来ます。

### URL

```
POST /api/tournament/create
```

### パラメータJSON

以下のパラメータを含んだJSONをbodyに入れて送信して下さい。

| Name                 | Type     | Discription                                     |
| -------------------- | -------- | ----------------------------------------------- |
| `name`<br>必須         | string   | 大会名                                             |
| `type`<br>必須         | string   | 対戦種別<br> `round-robin`か`knockout`のどちらかを指定してください |
| `organizer`<br>任意    | string   | 大会主催者                                           |
| `remarks`<br>任意      | string   | 備考                                              |
| `participants`<br>任意 | string[] | 参加者の配列<br>大会に参加する人の`id`or`name`を配列で入れてください      |

#### パラメータJSONの例

```JSON
{
  "name": "囲みマス公式大会",
  "type": "rount-robin",
  "organizer": "Code for KOSEN",
  "remarks": "2021年1月1日 13:00開始",
  "participants": ["3c78387b-eb63-4b9a-b364-a7699c78e195"]
}
```

### レスポンス

レスポンスのBodyに[Tournamentオブジェクト](./data.md#Tournament)が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`204` `300` `301` `304`

---

## 大会情報取得

大会の情報を取得することができます。idクエリを使うと特定の大会の情報が得られます。クエリがない場合には全ての大会情報を取得できます。

### URL

```
GET /api/tournament/get
or
GET /api/tournament/get?id=(大会ID)
```

### レスポンス

レスポンスのBodyに[Tournamentオブジェクト](./data.md#Tournament)が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`303`

---

## 大会削除

大会を削除することができます。<br>現時点では誰でも大会を削除することが出来るため濫用しないようにお願いします。

### URL

```
POST /api/tournament/delete
```

### パラメータJSON

以下のパラメータを含んだJSONをbodyに入れて送信して下さい。

| Name       | Type   | Discription |
| ---------- | ------ | ----------- |
| `id`<br>必須 | string | 大会ID        |

#### パラメータJSONの例

```JSON
{
  "id": "dc700f54-90a4-4a17-9346-c544213864e6"
}
```

### レスポンス

削除が成功した場合、Bodyに削除した[Tournamentオブジェクト](./data.md#Tournament)が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`302` `303`

---

## 大会参加ユーザ追加

大会に参加するユーザを追加することが出来ます。

### URL

```
GET /api/tournament/add?id=(大会ID)
```

### パラメータJSON

以下のパラメータを含んだJSONをbodyに入れて送信して下さい。

| Name         | Type   | Discription          |
| ------------ | ------ | -------------------- |
| `user`<br>必須 | string | 追加するユーザの`id`or`name` |

#### パラメータJSONの例

```JSON
{
  "user": "3c78387b-eb63-4b9a-b364-a7699c78e195"
}
```

### レスポンス

レスポンスのBodyに[Tournamentオブジェクト](./data.md#Tournament)が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`204` `205` `302` `304`
