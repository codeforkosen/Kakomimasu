# Kakomimasu client for deno

囲みマスのDeno版クライアントです。

## アカウント登録

カレントディレクトリに下記のような`.env`ファイルを用意して、ビューアで取得したBearerTokenを設定することで、自分のアカウントで`client_ax.js`を動かすことができます。

```:.env
bearerToken=c61cc5c6-ba12-4349-9e6a-9e05d6665541
```

## 実行例

```console
$ deno run -A client_a1.js
```

### ローカルで実行

```console
$ deno run -A client_a1.js --local
```

### 参加ゲームを指定してローカルで実行

```console
$ deno run -A client_a1.js --local --gameId f3a46842-55d8-49d3-a7d6-efb2630edf4c
```

### 対AI戦(ローカル)

```console
$ deno run -A client_a1.js --local --useAi a4
```

## オプション

| オプション     | パラメータ | 機能                                                                                                                   |
| --------- | ----- | -------------------------------------------------------------------------------------------------------------------- |
| --useAi   | AI名   | 対AI戦を行うことができます。AI名については[AI名](#AI名)を参照。--aiBoardオプションにて使用ボードの指定も可                                                     |
| --aiBoard | ボード名  | 対AI戦に使用するボードを指定することができます。ボード名については[ボード名](#ボード名)を参照。--useAIオプションがない場合には無視されます。                                        |
| --gameId  | ゲームID | 特定のゲームに参加することができます。                                                                                                  |
| --local   | -     | localhostで実行されているサーバに接続します。<br>このオプションがない場合、envファイルの`host`を参照し、それもない場合は`https://practice.kakomimasu.website`に接続されます。 |
| --host    | ホスト名  | 接続するホストを設定します。`--local`オプションが優先されます。                                                                                 |
| --nolog   | -     | ログを出力しません。（コンソールの出力に`client_util.js`のcl関数を使用しているものに限る）                                                               |

### AI名

現在以下の4つのAIが利用できます。 `a1`,`a2`,`a4`,`none` AIの動作の詳細は以下のページをご覧ください。

[サンプルAIの解説 -
サンプルAIの簡単な解説](https://hackmd.io/k36V_so3RUaEVor8gQXiSQ#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%ABAI%E3%81%AE%E7%B0%A1%E5%8D%98%E3%81%AA%E8%A7%A3%E8%AA%AC)

また上記ページには記載されていませんが、`a5`AIも利用可能です。これは`client_a5.js`に対応しています。動作が気になる方は自分で動作を考えてみてください。

### ボード名

現在公式では以下のボードが利用できます。
`A-1`,`A-2`,`F-1`,`island-1`,`island-3`,`island-4`,`island-5`,`Kakom-1`,`Kakom-2`
