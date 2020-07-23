# Kakomimasu server

## サーバ起動方法
```
deno run -A apiserver.ts
```

## サンプルコード
サーバを起動した状態で、次のコードを実行する
```
deno run -A ./sample/apiserver_sample.ts
```

## ブラウザで見る
`http://localhost:8880/match/index.html`にアクセス。

「囲みマス」のロゴが表示されたらOK

この状態でサンプルコードを動かすと、ルームの状態が分かります。

そのルームIDをクリックすると、フィールドの様子も見られます。

ルームに直接アクセスするには`http://localhost:8880/match.info/(ルームID)/index.html`
