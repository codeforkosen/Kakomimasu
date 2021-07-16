# Users API

## ユーザ登録

ユーザを新規登録することが出来ます。

### URL

```
POST /api/users/regist
```

### パラメータJSON

以下のパラメータを含んだJSONをbodyに入れて送信して下さい。

| Name               | Type   | Discription                                    |
| ------------------ | ------ | ---------------------------------------------- |
| `screenName`<br>必須 | string | 表示名<br>※他のユーザと表示名が被っても構いません。                   |
| `name`<br>必須       | string | 名前<br>※既に同じ名前を持つユーザが登録されている場合にはエラーレスポンスが返されます。 |
| `password`<br>必須   | string | パスワード                                          |

#### パラメータJSONの例

```JSON
{
  "screenName": "A-1",
  "name": "a1",
  "password": "a1_pw"
}
```

### レスポンス

レスポンスのBodyに[Userオブジェクト](./data.md#User)が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`2` `3` `200` `201` `202` `203`

---

## ユーザ情報取得

ユーザの情報を取得することができます。

### URL

```
GET /api/users/show/(ユーザのname又はID)
```

### レスポンス

レスポンスのBodyに[Userオブジェクト](./data.md#User)が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`204`

---

## ユーザ削除

ユーザを削除することができます。

### URL

```
POST /api/users/delete
```

### パラメータJSON

以下のパラメータを含んだJSONをbodyに入れて送信して下さい。

| Name                        | Type   | Discription |
| --------------------------- | ------ | ----------- |
| `name`<br>(name又はidのいずれか必須) | string | 名前          |
| `id`<br>(name又はidのいずれか必須)   | string | ID          |
| `password`<br>必須            | string | パスワード       |

#### パラメータJSONの例

```JSON
{
  "name": "a1",
  "password": "a1_pw"
}
```

### レスポンス

削除が成功した場合、ステータス200のレスポンスが返されます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`2` `3` `200` `204`

---

## ユーザ検索

検索文字列に前方一致したユーザを取得することができます。検索対象はnameとidになります。

### URL

```
GET /api/users/search
```

### クエリパラメータ

| Name      | Type   | Discription |
| --------- | ------ | ----------- |
| `q`<br>必須 | string | 検索文字列       |

#### URLの例

```
/api/users/search?q=a1
```

### レスポンス

レスポンスのBodyに[Userオブジェクト](./data.md#User)の配列が返ってきます。

#### エラーレスポンス

以下のエラーレスポンスが返ってるくる可能性があります。エラーレスポンスについては[Error Response](./error.md)を見てください。

`1`
