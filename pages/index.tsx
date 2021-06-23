/// <reference lib="dom"/>
import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

import Section, { SubSection } from "../components/section.tsx";

const useStyles = makeStyles({
  div: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "& a": {
      color: "#5C4C40",
    },
  },
});
export default function () {
  const classes = useStyles();

  document.title = "囲みマス";

  return (
    <div className={classes.div}>
      <img
        style={{
          width: "60vw",
          maxWidth: 546,
          margin: "2em",
        }}
        id="title"
        src="/img/kakomimasu-logo.png"
      />
      <Section title="Webコンテンツ">
        オンラインで対戦中のゲームをリアルタイムで見ることができます。<br />
        <SubSection title="ゲーム">
          <div>
            <Link to="/game/index">ゲーム一覧はこちらから</Link>
            <br />
            <Link to="/game/detail">最新のゲームビューアはこちらから</Link>
            <br />
            <a href="/vr/latest.html">最新のゲームビューア(VR版)はこちらから</a>
            <br />
            <a href="simple-client.html">簡易ゲームクライアントはこちらから</a>
            <br />
            <Link to="/game/create">カスタムゲーム作成はこちらから</Link>
          </div>
        </SubSection>
        <SubSection title="大会">
          <div>
            <Link to="tournament/index">大会一覧はこちらから</Link>
            <br />
            <Link to="tournament/create">大会作成はこちらから</Link>
            <br />
          </div>
        </SubSection>
      </Section>

      <Section title="囲みマスとは">
        囲碁と将棋とリアルタイムストラテジーゲームが混ざったような陣取りゲームです。<br />
        フィールドは、点数がついたマス目、辿ったり囲んだりして自分の陣地を広げ、点数が高いほうが勝ち！<br />
        誰でも開発に参加できる、オープンソース (<a
          href="https://github.com/codeforkosen/Kakomimasu"
        >
          src on GitHub
        </a>)。
      </Section>

      <Section title="人対AI!?">
        同時に動かせるエージェントの人数は最大14コマ。1ターンは最短3秒。人の判断では間に合わない？<br />
        そんな時はプログラミングしたAIにサポートしてもらいましょう！
      </Section>

      <Section title="ランクシステム">
        AIを登録しておけば、勝手にリーグ戦が組まれてランキング登録されます。<br />
        囲みマス世界ランク一位には豪華賞品があるかも！？
      </Section>

      <Section title="勝手にプロコン実行委員会">
        中止になった第31回高専プロコン競技部門を勝手にやっちゃおうと立ち上がった、Code for KOSEN の部門のひとつ。
      </Section>
      <Section title="開発者用ツール">
        <Link to="/dev/field-editor">フィールド説明用エディタ</Link>
        <br />
      </Section>
    </div>
  );
}
