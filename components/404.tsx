/// <reference lib="dom"/>
import React from "react";
import { Link } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core";

import Content from "./content.tsx";

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  })
);

export default function () {
  const classes = useStyles();
  document.title = "404 NotFound - 囲みマス";

  return (
    <Content title="404">
      <div className={classes.content}>
        <div>このページは存在しません</div>
        <Link to="/">囲みマス トップページへ</Link>
      </div>
    </Content>
  );
}
