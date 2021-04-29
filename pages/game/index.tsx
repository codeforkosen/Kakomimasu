// @deno-types="https://deno.land/x/servest@v1.3.0/types/react/index.d.ts"
import React from "https://dev.jspm.io/react/index.js";
import { DFC } from "https://deno.land/x/servest@v1.3.0/mod.ts";

const Index: DFC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <h4
        id="now-time"
        v-cloak
        dangerouslySetInnerHTML={{ __html: `現在時刻：{{nowTime}}` }}
      />
      <div
        className="game-table"
        dangerouslySetInnerHTML={{
          __html: `
                <button v-on:click="nowType = 0" :disabled="nowType === 0">フリーマッチ</button>
                <button v-on:click="nowType = 1" :disabled="nowType === 1">カスタムマッチ</button>

                <games-list v-bind:games="games[nowType]"> </games-list>`,
        }}
      />
      <script type="module" src="/js/game/index.js" />
      <link rel="stylesheet" href="/css/game/index.css" />
    </div>
  );
};

Index.getInitialProps = async () => {
  return { title: "ゲーム一覧" };
};

// default export are used for Server Side Rendering.
export default Index;
