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
