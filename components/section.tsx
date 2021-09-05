import React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

type Props = {
  children?: React.ReactNode;
  title?: string;
};

const useStyles = makeStyles({
  section: (theme: Theme) => ({
    border: "solid 3px",
    borderColor: theme.palette.primary.main,
    marginTop: "50px",
    position: "relative",
    padding: "30px 30px 20px 30px",
    width: "100%",
  }),
  title: (theme: Theme) => ({
    position: "absolute",
    top: 0,
    left: 20,
    padding: "0 10px",
    margin: 0,
    transform: "translateY(-50%)",
    backgroundColor: theme.palette.background.default,
    color: "#5C4C40",
  }),
  subSection: (theme: Theme) => ({
    fontSize: "0.8em",
    borderBottom: "solid 2px",
    borderBottomColor: theme.palette.secondary.main,
    margin: "0 auto",
    padding: "0 5px",
    display: "inline-block",
    color: "#5C4C40",
  }),
});

export default function (props: Props) {
  const theme = useTheme();
  const classes = useStyles(theme);
  return (
    <section className={classes.section}>
      {props.title && <h2 className={classes.title}>{props.title}</h2>}
      {props.children}
    </section>
  );
}

export function SubSection(props: Props) {
  const theme = useTheme();
  const classes = useStyles(theme);
  return (
    <>
      <h3 className={classes.subSection}>{props.title}</h3>
      {props.children}
    </>
  );
}
