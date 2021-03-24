# Data dictionary

## Game
#### 例
```JSON
{
  gameId: "a681b871-edf6-4c1d-aeaf-f5a1039122fb",
  gaming: false,
  ending: false,
  board: {
    name:"A-1",
    width:10,
    height:10,
    nAgent:8,
    nPlayer:2,
    nTurn: 30,
    nSec: 1,
    points:[
      12,3,5,3,1,1,3,5,3,12,
      3,5,7,5,3,3,5,7,5,3,
      5,7,10,7,5,5,7,10,7,5,
      3,5,7,5,3,3,5,7,5,3,
      1,3,5,3,12,12,3,5,3,1,
      1,3,5,3,12,12,3,5,3,1,
      3,5,7,5,3,3,5,7,5,3,
      5,7,10,7,5,5,7,10,7,5,
      3,5,7,5,3,3,5,7,5,3,
      12,3,5,3,1,1,3,5,3,12
    ]
  },
  turn: 0,
  totalTurn: 30,
  tiled: [
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],
    [0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1]
  ],
  players: [
    {
      "id":"3678abbc-1249-4b4a-90e8-b75a5688fe47",
      "agents":[
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1}
      ],
      "point":{
          "basepoint":0,
          "wallpoint":0
      }
    },
    {
      "id":"3678abbc-1249-4b4a-90e8-b75a5688fe47",
      "agents":[
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1},
          {"x":-1,"y":-1}
      ],
      "point":{
          "basepoint":0,
          "wallpoint":0
      }
    }
  ],
  log: [
    [
      {
        "point": {
          "basepoint": 0,
          "wallpoint": 5
        },
        "actions": [
          {
            "agentId": 0,
            "type": 1,
            "x": 1,
            "y": 1,
            "res": 0
          }
        ]
      },
      {
        "point": {
          "basepoint": 0,
          "wallpoint": 0
        },
        "actions": []
      }
    ]
  ],
  gameName: "テスト",
  startedAtUnixTime: null,
  nextTurnUnixTime: null,
  reservedUsers: []
}
```

|Name|Type|Discription|
|-|-|-|
|`gameId` |string |ゲームID|
|`gaming` |boolean |ゲーム中かどうか|
|`ending` |boolean |ゲームが終了したかどうか|
|`board` |[Board](#Board) |ゲームで使用されるボード情報<br>ゲームが開始するまでは非公開(null)です。|
|`turn` |number |現在のターン|
|`totalTurn` |number |非推奨(Board情報内の`nTurn`を使用してください)<br>このゲームの総ターン|
|`tiled` |number[[,]] |フィールドの状態(壁・陣地・どのプレイヤーのマスかなど)<br>ゲームが開始するまでは非公開(null)です。<br>各要素はboard.pointsと対応しており、各要素の配列0番目はタイルの状態（0:陣地、1:壁）、1番目はそのタイルを所持するプレイヤーIndex（-1のときは空白マスとなります。）となっています。|
|`players` |[Player](#Player)[] |プレイヤー情報の配列|
|`log` |[] |ゲームのログ|
|`gameName` |string |ゲーム名|
|`startedAtUnixTime` |number |ゲーム開始時刻|
|`nextTurnUnixTime` |number|次のターンが始まる時刻|
|`reservedUsers` |string[] |ゲームに入室可能なユーザIDのリスト|


## Board
#### 例
```JSON
{
  name: "A-1",
  width: 10,
  height: 10,
  nAgent: 8,
  nPlayer: 2,
  nTurn: 30,
  nSec: 1,
  points: [
    12, 3,  5, 3, 1, 1, 3,  5, 3, 12,  3, 5,  7, 5,  3,
     3, 5,  7, 5, 3, 5, 7, 10, 7,  5,  5, 7, 10, 7,  5,
     3, 5,  7, 5, 3, 3, 5,  7, 5,  3,  1, 3,  5, 3, 12,
    12, 3,  5, 3, 1, 1, 3,  5, 3, 12, 12, 3,  5, 3,  1,
     3, 5,  7, 5, 3, 3, 5,  7, 5,  3,  5, 7, 10, 7,  5,
     5, 7, 10, 7, 5, 3, 5,  7, 5,  3,  3, 5,  7, 5,  3,
    12, 3,  5, 3, 1, 1, 3,  5, 3, 12
  ]
}
```
|Name|Type|Discription|
|-|-|-|
|`name` |string |ボード名|
|`width` |number |フィールドの幅|
|`height` |number |フィールドの高さ|
|`nAgent` |number |エージェントの数|
|`nPlayer` |number |プレイヤーの数|
|`nTurn` |number|ターン数|
|`nSec` |number |1ターンの秒数|
|`points` |number[] |ポイント(配列)|

## Player
#### 例
```JSON
{
  "id":"3678abbc-1249-4b4a-90e8-b75a5688fe47",
  "agents":[
      {"x":-1,"y":-1},
      {"x":-1,"y":-1},
      {"x":-1,"y":-1},
      {"x":-1,"y":-1},
      {"x":-1,"y":-1},
      {"x":-1,"y":-1},
      {"x":-1,"y":-1},
      {"x":-1,"y":-1}
  ],
  "point":{
      "basepoint":0,
      "wallpoint":0
  }
}
```

|Name|Type|Discription|
|-|-|-|
|`id` |string |ユーザID|
|`agents` |object[] |エージェントがいるマス情報<br>x,y座標を取得できる。|
|`point` |string |ポイント情報<br>`basepoint`は陣地のポイント、`wallpoint`は壁のポイントで、この2つを合計したものがそのプレイヤーの総得点となる|


## User
#### 例
```JSON
{
  "screenName":"A-1",
  "name":"a1",
  "id":"a92070bf-7f78-4c64-953b-189ddb44c159",
  "gamesId":[],
}
```

|Name|Type|Discription|
|-|-|-|
|`screenName`<br>必須 |string |表示名|
|`name`<br>必須       |string |名前<br>※他のユーザと被ることのない固有の名前ですが、ユーザにより変更される場合があります。|
|`id`         |string |ID<br>※ユーザ固有のIDです。他のユーザと被ることはなく、変更されることもありません。|
|`gamesId`    |string[] |ユーザが参加したゲームIDのリスト|

---

## Tournament
#### 例
```JSON
{
  name: "囲みマス公式大会",
  organizer: "Code for KOSEN",
  type: "round-robin",
  remarks: "2021年1月1日 13:00開始",
  id: "dc700f54-90a4-4a17-9346-c544213864e6",
  users: [ "3c78387b-eb63-4b9a-b364-a7699c78e195" ],
  gameIds: []
}
```

|Name|Type|Discription|
|-|-|-|
|`name`<br>必須       |string |大会名|
|`organizer`<br>必須       |string |大会主催者|
|`type`<br>必須       |string |対戦種別<br>`round-robin`(総当たり戦)又は`knockout`(勝ち残り戦)が入ります。|
|`remarks`<br>必須       |string |備考|
|`id`         |string |大会ID<br>※固有のIDです。他の大会と被ることはなく、変更されることもありません。|
|`users`         |string[] |大会参加ユーザのIDが配列になっています。|
|`gameIds`    |string[] |この大会主催の元開かれたゲームのIDが配列になっています。|
