import React from "react";
import { Link } from "react-router-dom";

import Content from "./content.tsx";

export default function () {
  return (
    <Content title="404 NotFound">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>このページは存在しません</div>
        <Link to="/">囲みマス トップページへ</Link>
      </div>
    </Content>
  );
}
