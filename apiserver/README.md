# 囲みマス server

## サーバ起動方法

```
deno run -A apiserver.ts
```

## サンプル対戦（AI戦）

ローカルでサーバを起動した状態で、`client_deno`フォルダ内の`client_a1.js`を以下のように実行

```
deno run -A ../client_deno/client_a1.js --local --useAi a5
```

## ブラウザで見る

`http://localhost:8880/game/index`にアクセス。

「囲みマス」のロゴが表示されたらOK

この状態でサンプルコードを動かすと、各ゲームの状態が分かります。

それぞれのゲームIDをクリックすると、ゲーム詳細（フィールドの様子）も見られます。

ゲーム詳細に直接アクセスするには`http://localhost:8880/game/detail/(ゲームID)`

また、ユーザ詳細に直接アクセスするには`http://localhost:8880/user/detail/(ユーザID or ユーザネーム)`

## API仕様

APIのドキュメントをご覧ください。

[API Document](./docs/index.md)

## 変更点（APIを使用するにあたって影響する部分のみ）

#### 2020.3.3

- create Game API
  - リクエストデータ形式の変更
    - gameName => name

#### 2020.9.9

- apiにアクセスするURLの変更
  - /users/regist => /api/users/regist
  - /users/show/:userId => /api/users/show/:userId
  - /users/delete => /api/users/delete
  - /match => /api/match
  - /match/:roomId => /api/match/:roomId
  - /match/:roomId/action => /api/match/:roomId/action

#### 2020.8.13

- action API
  - リクエストデータ形式の変更
    - timeが無くなった
    - agentid => agentId
  - レスポンスデータ形式の変更
    - actionのオウム返しを無しに。
    - 代わりに`receptionUnixTime`と`turn`を返すように。
    - 詳しくはHackMDを見てね

#### 2020.8.4

- 事前にユーザ登録しないといけなくなった。
- それに伴い、match APIではユーザ名(またはユーザID)とパスワードが必要になった。
- match API
  - レスポンスJson Key変更：uuid => accessToken
  - レスポンスJson Key変更：name => userId
  - レスポンスJson Key変更：roomId => gameId
- match/:gameId API
  - レスポンスJson Key変更：roomID => gameId
  - レスポンスJson Key変更：players[i].playerID => players[i].id
- 言葉の定義の変更：ルーム => ゲーム(コードによっては直っていない部分もあります。)
