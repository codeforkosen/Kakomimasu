/// <reference no-default-lib="true"/>
/// <reference lib="dom"/>
/// <reference lib="es2015"/>
import { React } from "../components/react.ts";
import { createStyles, makeStyles } from "../components/material-ui.ts";

import Section, { SubSection } from "../components/section.tsx";

const useStyles = makeStyles((theme) =>
  createStyles({
    div: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      "& a": {
        color: "#5C4C40",
      },
    },
    logo: {
      width: "60vw",
      maxWidth: 546,
      margin: "2em",
    },
  })
);
export default function () {
  const classes = useStyles();

  document.title = "囲みマス";

  return (
    <div className={classes.div}>
      <img className={classes.logo} id="title" src="/img/kakomimasu-logo.png" />
      <Section title="Webコンテンツ">
        オンラインで対戦中のゲームをリアルタイムで見ることができます。<br />
        <SubSection title="ゲーム">
          <div>
            <a href="game/index">ゲーム一覧はこちらから</a>
            <br />
            <a href="gamedetails.html">最新のゲームビューアはこちらから</a>
            <br />
            <a href="/vr/latest.html">最新のゲームビューア(VR版)はこちらから</a>
            <br />
            <a href="game/create.html">カスタムゲーム作成はこちらから</a>
          </div>
        </SubSection>
        <SubSection title="大会">
          <div>
            <a href="tournament/index.html">大会一覧はこちらから</a>
            <br />
            <a href="tournament/create.html">大会作成はこちらから</a>
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
        <a href="/dev/field.html">フィールド説明用エディタ</a>
        <br />
      </Section>
    </div>
  );
}
