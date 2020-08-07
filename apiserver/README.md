# 囲みマス server

## サーバ起動方法
```
deno run -A apiserver.ts
```

## サンプル対戦
サーバを起動した状態で、`client_deno`フォルダ内の`client_test1.ts`,`client_test2.ts`をそれぞれ実行

### 例
```
deno run -A ../client_deno/client_test1.ts
```

## ブラウザで見る
`http://localhost:8880/game`にアクセス。

「囲みマス」のロゴが表示されたらOK

この状態でサンプルコードを動かすと、各ゲームの状態が分かります。

それぞれのゲームIDをクリックすると、ゲーム詳細（フィールドの様子）も見られます。

ゲーム詳細に直接アクセスするには`http://localhost:8880/game/:(ルームID)`

また、ユーザ詳細に直接アクセスするには`http://localhost:8880/user/:(ユーザID or ユーザネーム)`

## API仕様
下記サイトを参考

かこみますネットワークプロトコルを決めようの会  
https://hackmd.io/IDgCfeQ8SqWQuK9PzkG8xQ  

## 変更点（APIを使用するにあたって影響する部分のみ）
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
