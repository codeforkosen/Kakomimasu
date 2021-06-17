# API ドキュメント

## Data Dictionary

データ形式については以下のリンクをご覧ください。

[data dictionary](./data.md)

## Error Response

エラーレスポンスについては以下のリンクをご覧ください。

[Error Response](./error.md)

## Authorizationヘッダ

囲みマスAPIは、ゲームへの参加時、行動情報送信時、重要なユーザ情報を取得する際、ユーザを削除する際などに、ユーザ認証を必要とします。
ユーザ認証には、HTTPリクエストのAuthorizationヘッダを使用します。ユーザの種類、APIの種類によって必要な認証方法が異なります。

### Bearer認証

各ユーザには、BearerTokenと呼ばれる固有のトークンが割り当てられます。

認証が必要な大半のAPIはこのBearerTokenを使用します。

BearerTokenの取得方法は、ユーザの種類によって異なります。

- 通常ユーザの場合

  ビューアからユーザ登録された方は通常ユーザとなります。 通常ユーザはビューアから自身のユーザ詳細を見ることでBearerTokenを得ることが出来ます。

- 旧式ユーザの場合

  [`users/show`](./users_api.md#ユーザ情報取得) APIを使用したパスワード登録式のユーザ登録を行った方は旧式ユーザとなります。
  旧式ユーザはBasic認証を使用して[`users/show`](./users_api.md#ユーザ情報取得)
  APIを使用することで、BearerTokenを得ることができます。

Bearer認証を行うには以下のようなAuthorizationヘッダを含めます。

```
Authorization: Bearer ${BEARER_TOKEN}
```

`${BEARER_TOKEN}`には自身のBearerTokenを置き換えてください。

Bearer認証が必要なAPIは以下の通りです。

- [`users/delete`](./users_api.md#ユーザ削除) API

  ユーザ削除時の本人確認のため必須となります。
- [`match`](./match_api.md#ゲーム参加) API

  ゲーム参加時の本人確認のため必須となります。

- [`match/(gameId)/action`](./match_api.md#行動送信) API

  行動情報送信時の本人確認のため必須となります。

### Basic認証

Basic認証は旧式ユーザにてBearerTokenを確認する際に使用されます。

ビューアからユーザ登録された方はBasic認証は必要ありません。（パスワードがないため行うことが出来ません。）

Basic認証を行うには以下のようなAuthorizationヘッダを含めます。

```
Authorization: Basic ${ID}:${PASSWORD}
// or
Authorization: Basic ${NAME}:${PASSWORD}
```

`${ID}`、`${NAME}`、`${PASSWORD}`には自身のものに置換えてください。

ユーザIDとユーザネームのどちらでも認証を行うことが出来ます。

Basic認証が必要なAPIは以下の通りです。

- [`users/show`](./users_api.md#ユーザ情報取得) API

  ユーザ情報取得する際にBasic認証を付加するとBearerTokenやPasswordなどの個人情報を得ることが出来ます。Basic認証がない場合はBearerToken、Passwordは得られません。

## API詳細

APIは以下のようにいくつかに分かれています。それぞれの詳細は各ページをご覧ください。

- [match API](./docs/match_api.md)

  試合関連のAPI（参加、情報取得、行動送信）

- [users API](./docs/users_api.md)

  ユーザ関連のAPI（ユーザ登録、情報取得、削除など）

- [tournaments API](./docs/tournaments_api.md)

  大会関連のAPI（大会登録、大会削除など）

- [game API](./docs/game_api.md)

  ゲーム関連のAPI（ゲーム作成、ボード情報取得など）
