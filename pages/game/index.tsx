/// <reference no-default-lib="true"/>
/// <reference lib="dom"/>
/// <reference lib="es2015"/>
import { React } from "../../components/react.ts";
import { Link } from "../../components/react-router-dom.ts";

import Clock from "../../components/clock.tsx";

export default class extends React.Component {
  public state = { title: "ゲーム一覧" };

  componentDidMount() {
    document.title = this.state.title + " - 囲みマス";
  }

  render() {
    return (
      <div>
        <link rel="stylesheet" href="/css/game/index.css" />
        <h1>{this.state.title}</h1>
        <Clock />
        <link rel="stylesheet" href="/css/404.css" />
      </div>
    );
  }
}

/*
const Index: DFC<{ title: string }> = ({ title }) => {
  return (
    <div>
      
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
*/
