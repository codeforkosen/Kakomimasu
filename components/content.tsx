import React from "react";
//import { createStyles, makeStyles } from "../components/material-ui.ts";

type Props = {
  children?: React.ReactNode;
  title: string;
};

//const useStyles = makeStyles((theme) => createStyles({}));

const Content: React.FC<Props> = (props) => {
  document.title = props.title + " - 囲みマス";
  //const classes = useStyles();
  return (
    <>
      <h1>{props.title}</h1>
      {props.children}
    </>
  );
};

export default Content;
