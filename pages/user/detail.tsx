/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  Cell,
  ContentRenderer,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
} from "recharts";
import { Link, RouteComponentProps } from "react-router-dom";
import Section, { SubSection } from "../../components/section.tsx";
import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";

// @deno-types="../../apiserver/api_client.d.ts"
import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import { Game, User } from "../../apiserver/types.ts";

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
    },
    pieGraph: {
      height: 300,
    },
  })
);

export default function (props: RouteComponentProps<{ id: string }>) {
  const classes = useStyles();

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

  const getUser = async () => {
    const res = await apiClient.usersShow(props.match.params.id);
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
        players.sort((a: any, b: any) => a.point - b.point);

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
    getUser();
  }, [props.match.params.id]);

  const renderLabel: ContentRenderer<PieLabelRenderProps> = (
    { cx, cy, midAngle, innerRadius, outerRadius, percent },
  ) => {
    const [cx_, cy_, midAngle_, innerRadius_, outerRadius_] = [
      cx as number,
      cy as number,
      midAngle as number,
      innerRadius as number,
      outerRadius as number,
    ];
    if (!percent) return (<></>);
    const RADIAN = Math.PI / 180;
    const radius = innerRadius_ + (outerRadius_ - innerRadius_) * 0.5;
    const x = cx_ + radius * Math.cos(-midAngle_ * RADIAN);
    const y = cy_ + radius * Math.sin(-midAngle_ * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx_ ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Content title="ユーザ詳細">
      <div className={classes.content}>
        {user === undefined ? <CircularProgress color="secondary" /> : <>
          {user
            ? <>
              <Section title="基本情報">
                <div className={classes.content}>
                  <SubSection title="表示名">{user.screenName}</SubSection>
                  <SubSection title="ユーザネーム">{user.name}</SubSection>
                  <SubSection title="ユーザID">{user.id}</SubSection>
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
                        label={renderLabel}
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
            : <div className={classes.content}>
              <div>ユーザが存在しません</div>
              <Link to="/">囲みマス トップページへ</Link>
            </div>}
        </>}
      </div>
    </Content>
  );
}
