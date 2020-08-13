package kakomimasu;
import java.util.Date;
import static kakomimasu.ClientUtil.*;
public class ClientTest2
{
  public static void main(String[] args) throws Exception
  {
    String name = "nit-taro2";
    String password = name + "-pw";
    User user = userShow(name);
    if (user.error != null) {
      user = userRegist("高専太郎2", name, password);
    }
    // プレイヤー登録
    Match resMatch = match("高専太郎", user.id, password, "ポンコツ");
    String token = resMatch.accessToken;
    String gameId = resMatch.gameId;

    GameInfo gameInfo;
    do {
      gameInfo = getGameInfo(gameId);
      sleep(100);
    } while (gameInfo.startedAtUnixTime == null);

    printJson(gameInfo);

    System.out.println(
      "ゲーム開始時間： "
        + new Date(gameInfo.startedAtUnixTime * 1000L).toLocaleString()
    );

    sleep((diffTime(gameInfo.startedAtUnixTime) + 1) * 1000);

    // ターン1
    setAction(
      gameId, token,
      new Action[] {new Action(0, "PUT", 4, 4), new Action(1, "PUT", 6, 6)}
    );
    sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

    // ターン2
    gameInfo = getGameInfo(gameId);
    setAction(
      gameId, token,
      new Action[] {new Action(0, "MOVE", 4, 5), new Action(1, "MOVE", 6, 5)}
    );
    sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

    // ターン3
    gameInfo = getGameInfo(gameId);
    setAction(
      gameId, token,
      new Action[] {new Action(0, "MOVE", 4, 6), new Action(1, "MOVE", 6, 4)}
    );
    sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

    // ターン4
    gameInfo = getGameInfo(gameId);
    setAction(
      gameId, token,
      new Action[] {new Action(0, "MOVE", 5, 6), new Action(1, "MOVE", 5, 4)}
    );
    sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);
  }
}
