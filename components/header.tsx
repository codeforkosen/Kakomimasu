// @deno-types="https://deno.land/x/servest@v1.3.0/types/react/index.d.ts"
import React from "https://dev.jspm.io/react/index.js";
import { FC } from "https://deno.land/x/servest@v1.3.0/types/react/index.d.ts";

const nav: { text: string; url: string }[] = [
  { text: "ゲーム一覧", url: "/gamelist" },
  { text: "大会一覧", url: "/tournament/index" },
];

export const Header: FC = () => {
  return (
    <header>
      <a id="h_logo" href="/index">
        <img src="/img/kakomimasu-logo.png" alt="囲みマスロゴ" />
      </a>
      <nav id="h-tab">
        <ul>
          {nav.map((e) => {
            return <li key={e.url}>
              <a href={e.url}>{e.text}</a>
            </li>;
          })}
        </ul>
      </nav>
      <div id="h_user">
        <button id="loginout">ログイン・新規登録</button>
        <img id="user-icon" hidden />
      </div>
      <script type="module" src="/js/header.js" />
      <link rel="stylesheet" href="/css/header.css" />
    </header>
  );
};
