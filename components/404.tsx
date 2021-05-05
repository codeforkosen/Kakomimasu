/// <reference no-default-lib="true"/>
/// <reference lib="dom"/>
/// <reference lib="es2015"/>
import { React } from "./react.ts";
import { Link } from "./react-router-dom.ts";

export default class extends React.Component {
  componentDidMount() {
    document.title = "404 NotFound - 囲みマス";
  }

  render() {
    return (
      <div>
        <h1>404</h1>
        <div>このページは存在しません</div>
        <Link to="/">囲みマス トップページへ</Link>
        <link rel="stylesheet" href="/css/404.css" />
      </div>
    );
  }
}
