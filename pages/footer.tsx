import React from "react";
import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 0",
      backgroundColor: theme.palette.primary.main,
      width: "100%",
      "& a": {
        textDecoration: "none",
        color: "black",
        display: "inline-block",
      },
      "& a:active": {
        color: "black",
      },
    },
    div: {
      margin: "5px 0",
    },
    img: {
      height: "1.5em",
    },
  })
);

export default function () {
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      <div id="f_link" className={classes.div}>
        <a href="https://github.com/codeforkosen/Kakomimasu">
          <img src="/img/GitHub-Mark-64px.png" className={classes.img} />
        </a>
      </div>
      <div className={classes.div}>
        <a href="https://deno.land/">
          <img
            src="https://img.shields.io/badge/-deno-161E2E.svg?logo=deno&style=flat"
          />
        </a>
      </div>
      <div className={classes.div}>
        <a href="https://codeforkosen.github.io/">CC BY Code for KOSEN</a>
      </div>
    </footer>
  );
}