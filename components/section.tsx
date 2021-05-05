import { React } from "./react.ts";
import { createStyles, makeStyles } from "../components/material-ui.ts";

type Props = {
  children?: React.ReactNode;
  title?: string;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    section: {
      border: "solid 3px",
      borderColor: theme.palette.primary.main,
      margin: 10,
      marginTop: 50,
      position: "relative",
      padding: "30px 30px 20px 30px",
      width: "100%",
    },
    title: {
      position: "absolute",
      top: 0,
      left: 20,
      padding: "0 10px",
      margin: 0,
      transform: "translateY(-50%)",
      backgroundColor: theme.palette.background.default,
      color: "#5C4C40",
    },
    subSection: {
      fontSize: "0.8em",
      borderBottom: "solid 2px",
      borderBottomColor: theme.palette.secondary.main,
      margin: "0 auto",
      padding: "0 5px",
      display: "inline-block",
      color: "#5C4C40",
    },
  })
);

const Section: React.FC<Props> = (props) => {
  const classes = useStyles();
  return (
    <section className={classes.section}>
      {props.title && <h2 className={classes.title}>{props.title}</h2>}
      {props.children}
    </section>
  );
};

const SubSection: React.FC<Props> = (props) => {
  const classes = useStyles();
  return (
    <>
      <h3 className={classes.subSection}>{props.title}</h3>
      {props.children}
    </>
  );
};

export default Section;
export { SubSection };
