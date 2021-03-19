# Data dictionary

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
