package kakomimasu;
import java.util.Date;
import static kakomimasu.ClientUtil.*;
public class ClientTest1
{
  public static void main(String[] args) throws Exception
  {
    String[] a = match("高専太郎", "ポンコツ");
    String playerid = a[0];
    String roomid = a[1];

    GameInfo gameInfo;
    do {
      gameInfo = getGameInfo(roomid);
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
        roomid, playerid,
        new Action[] {new Action(0, "PUT", 1, 1), new Action(1, "PUT", 3, 3)}
    );
    sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

    // ターン2
    gameInfo = getGameInfo(roomid);
    setAction(
        roomid, playerid,
        new Action[] {new Action(0, "MOVE", 1, 2), new Action(1, "MOVE", 3, 2)}
    );
    sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

    // ターン3
    gameInfo = getGameInfo(roomid);
    setAction(
        roomid, playerid,
        new Action[] {new Action(0, "MOVE", 4, 6), new Action(1, "MOVE", 6, 4)}
    );
    sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

    // ターン4
    gameInfo = getGameInfo(roomid);
    setAction(
        roomid, playerid,
        new Action[] {new Action(0, "MOVE", 2, 3), new Action(1, "MOVE", 2, 1)}
    );
    sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);
  }
}
