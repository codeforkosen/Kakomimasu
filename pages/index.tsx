// @deno-types="https://deno.land/x/servest@v1.3.0/types/react/index.d.ts"
import React from "https://dev.jspm.io/react/index.js";
import { DFC } from "https://deno.land/x/servest@v1.3.0/mod.ts";

const Index: DFC<{ title: string; text: string }> = ({ title, text }) => {
  return (
    <div>
      <img id="title" src="/img/kakomimasu-logo.png"></img>
      <section className="separation">
        <h2>Webコンテンツ</h2>
        オンラインで対戦中のゲームをリアルタイムで見ることができます。<br />
        <h3>ゲーム</h3>
        <div>
          <a href="gamelist.html">ゲーム一覧はこちらから</a>
          <br />
          <a href="gamedetails.html">最新のゲームビューアはこちらから</a>
          <br />
          <a href="/vr/latest.html">最新のゲームビューア(VR版)はこちらから</a>
          <br />
          <a href="game/create.html">カスタムゲーム作成はこちらから</a>
        </div>
        <h3>大会</h3>
        <div>
          <a href="tournament/index.html">大会一覧はこちらから</a>
          <br />
          <a href="tournament/create.html">大会作成はこちらから</a>
          <br />
        </div>
      </section>

      <section className="separation">
        <h2>囲みマスとは</h2>
        囲碁と将棋とリアルタイムストラテジーゲームが混ざったような陣取りゲームです。<br />
        フィールドは、点数がついたマス目、辿ったり囲んだりして自分の陣地を広げ、点数が高いほうが勝ち！<br />
        誰でも開発に参加できる、オープンソース (<a
          href="https://github.com/codeforkosen/Kakomimasu"
        >
          src on GitHub
        </a>)。
      </section>

      <section className="separation">
        <h2>人対AI!?</h2>
        同時に動かせるエージェントの人数は最大14コマ。1ターンは最短3秒。人の判断では間に合わない？<br />
        そんな時はプログラミングしたAIにサポートしてもらいましょう！
      </section>

      <section className="separation">
        <h2>ランクシステム</h2>
        AIを登録しておけば、勝手にリーグ戦が組まれてランキング登録されます。<br />
        囲みマス世界ランク一位には豪華賞品があるかも！？
      </section>

      <section className="separation">
        <h2>勝手プロコン実行委員会</h2>
        中止になった第31回高専プロコン競技部門を勝手にやっちゃおうと立ち上がった、Code for KOSEN の部門のひとつ。
      </section>
      <section className="separation">
        <h2>開発者用ツール</h2>
        <a href="/dev/field.html">フィールド説明用エディタ</a>
        <br />
      </section>

      <link rel="stylesheet" href="/css/index.css" />
    </div>
  );
};

// getInitialProps is an asynchronous data fetcher
// for rendering components in server side.
// This is identical methodology to Next.js
// It will be called exactly once for each request.
Index.getInitialProps = async () => {
  //const resp = await fetch("https://some-api.com");
  const text = "hello"; //await resp.text();
  return { title: "Index Page", text };
};

// default export are used for Server Side Rendering.
export default Index;
