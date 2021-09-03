/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Link, useParams } from "react-router-dom";
import Section, { SubSection } from "../../components/section.tsx";
import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import firebase from "../../components/firebase.ts";

// @deno-types="../../client_js/api_client.d.ts"
import ApiClient from "../../client_js/api_client.js";
const apiClient = new ApiClient("");

import { Game, User } from "../../apiserver/types.ts";

const useStyles = makeStyles({
  content: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  pieGraph: {
    height: 300,
  },
});

export default function () {
  const classes = useStyles();
  const { id } = useParams<{ id?: string }>();

  const [user, setUser] = useState<
    | ({
      games: Game[];
      pieData: {
        name: string;
        value: number;
      }[];
    } & User)
    | undefined
    | null
  >(undefined);

  const getUser = async (id: string, idToken?: string) => {
    const res = await apiClient.usersShow(id, idToken);
    if (res.success === false) {
      setUser(null);
    } else {
      const user = res.data;
      const games: Game[] = [];
      for (const gameId of user.gamesId) {
        const res = await apiClient.getMatch(gameId);
        if (res.success) games.push(res.data);
      }
      const result = [0, 0, 0]; // 勝ち、負け、引き分け
      games.forEach((g) => {
        if (g.ending === false) return;
        const players = g.players.map((p) => {
          return {
            id: p.id,
            point: p.point.wallpoint + p.point.basepoint,
          };
        });
        players.sort((a, b) => a.point - b.point);

        if (players[0].id === user.id) {
          if (players[0].point === players[players.length - 1].point) {
            result[2]++;
          } else result[1]++;
        }
        if (players[players.length - 1].id === user.id) {
          result[0]++;
        }
        //console.log(result);
      });

      const pieData = [
        { name: "Win", value: result[0] },
        { name: "Lose", value: result[1] },
        { name: "Even", value: result[2] },
      ];
      setUser({ ...res.data, games, pieData });
    }
  };

  useEffect(() => {
    console.log("id", id);
    firebase.auth().onAuthStateChanged(async (user) => {
      const idToken = await user?.getIdToken(true);
      const userId = id || user?.uid;
      if (!userId) setUser(null);
      else getUser(userId, idToken);
    });
  }, [id]);

  return (
    <Content title="ユーザ詳細">
      <div className={classes.content}>
        {user === undefined ? <CircularProgress color="secondary" /> : (
          <>
            {user
              ? (
                <>
                  <Section title="基本情報">
                    <div className={classes.content}>
                      <SubSection title="表示名">{user.screenName}</SubSection>
                      <SubSection title="ユーザネーム">{user.name}</SubSection>
                      <SubSection title="ユーザID">{user.id}</SubSection>
                      {user.bearerToken &&
                        (
                          <SubSection title="BearerToken(この値は他人に教えないようにしてください)">
                            {user.bearerToken}
                          </SubSection>
                        )}
                    </div>
                  </Section>
                  <Section title="勝敗記録">
                    <div className={classes.pieGraph}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={user.pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            fill="#8884d8"
                            label={(
                              {
                                cx,
                                cy,
                                midAngle,
                                innerRadius,
                                outerRadius,
                                percent,
                              }: {
                                cx: number;
                                cy: number;
                                midAngle: number;
                                innerRadius: number;
                                outerRadius: number;
                                percent?: number;
                              },
                            ) => {
                              if (!percent) return <></>;
                              const RADIAN = Math.PI / 180;
                              const radius = innerRadius +
                                (outerRadius - innerRadius) * 0.5;
                              const x = cx +
                                radius * Math.cos(-midAngle * RADIAN);
                              const y = cy +
                                radius * Math.sin(-midAngle * RADIAN);

                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="white"
                                  textAnchor={x > cx ? "start" : "end"}
                                  dominantBaseline="central"
                                >
                                  {`${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                            labelLine={false}
                          >
                            <Cell fill="#D92546" />
                            <Cell fill="#A7D4D9" />
                            <Cell fill="#F2BB9B" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Section>
                  <Section title="参加ゲーム一覧">
                    <GameList games={user.games} />
                  </Section>
                </>
              )
              : (
                <div className={classes.content}>
                  <div>ユーザが存在しません</div>
                  <Link to="/">囲みマス トップページへ</Link>
                </div>
              )}
          </>
        )}
      </div>
    </Content>
  );
}
