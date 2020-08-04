package kakomimasu;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
public class ClientUtil
{
  public static String host = "http://localhost:8880";
  public static class Action
  {
    public int agentid;
    public String type;
    public int x;
    public int y;
    public Action(int agentid, String type, int x, int y)
    {
      this.agentid = agentid;
      this.type = type;
      this.x = x;
      this.y = y;
    }
  }
  public static void sleep(long msec)
  {
    try {
      Thread.sleep(msec);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
  public static String[] match(String name, String spec) throws IOException
  {
    Map<String, Object> body = new HashMap<>();
    body.put("name", name);
    body.put("spec", spec);
    Map<String, String> map = new Gson().fromJson(
      fetch("POST", host + "/match",
        new String[]{
          "Content-Type", "application/json"
        },
        new Gson().toJson(body)
      ),
      Map.class
    );
    return new String[] {map.get("playerId"), map.get("roomId")};
  }
  public static GameInfo getGameInfo(String roomid) throws IOException
  {
    String resp = fetch("GET", host + "/match/" + roomid,
      new String[]{
        "Content-Type", "application/json"
      },
      null
    );
    return new Gson().fromJson(resp, GameInfo.class);
  }
  public static void setAction(String roomid, String playerid, Action[] actions) throws IOException
  {
    printJson(actions);
    Map<String, Object> body = new HashMap<>();
    body.put("time", new Date().getTime() / 1000);
    body.put("actions", actions);
    fetch("POST", host + "/match/" + roomid + "/action",
      new String[]{
        "Content-Type", "application/json",
        "Authorization", playerid
      },
      new Gson().toJson(body)
    );
  }
  public static int diffTime(int unixTime)
  {
    return unixTime - (int) (new Date().getTime() / 1000);
  }
  public static class GameInfo
  {
    public String roomID;
    public Boolean gaming;
    public Boolean ending;
    public Integer width;
    public Integer height;
    public Integer[] points;
    public Integer startedAtUnixTime;
    public Integer nextTurnUnixTime;
    public Integer turn;
    public Integer totalTurn;
    public Integer[][] tiled;
    public static class Player
    {
      public String playerID;
      public static class Agent
      {
        public String agentID;
        public Integer x;
        public Integer y;
      }
      public Agent[] agents;
      public static class Point
      {
        public Integer basepoint;
        public Integer wallpoint;
      }
      public Point point;
      public Integer tilePoint;
      public Integer areaPoint;
    }
    public Player[] players;
  }
  public static void printJson(Object obj)
  {
    System.out.println(new GsonBuilder().setPrettyPrinting().create().toJson(obj));
  }
  private static String fetch(String method, String url, String[] headers, String body) throws IOException
  {
    HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
    conn.setRequestMethod(method);
    if (headers != null) {
      for (int i = 0; i < headers.length; i += 2) {
        conn.setRequestProperty(headers[i], headers[i + 1]);
      }
    }
    if (body != null) {
      conn.setDoOutput(true);
      OutputStreamWriter out = new OutputStreamWriter(conn.getOutputStream());
      out.write(body);
      out.flush();
    }
    conn.connect();
    if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
      BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
      StringBuilder sb = new StringBuilder();
      while (true) {
        String line = br.readLine();
        if (line == null) {
          break;
        }
        sb.append(line);
      }
      return sb.toString();
    }
    return null;
  }
}
