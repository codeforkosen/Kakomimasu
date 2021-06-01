import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { Theme, useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles({
  tournament: (theme: Theme) => ({
    border: "solid 3px",
    borderColor: theme.palette.secondary.main,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    padding: "1em",
    margin: "1em",
    width: "20em",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  }),
  tournamentName: {
    fontWeight: "bold",
    fontSize: "1.5em",
  },
  tournamentOrganizer: {
    textAlign: "left",
  },
  tournamentType: {
    textAlign: "left",
  },
  tournamentRemarks: {
    fontSize: "0.8em",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

export default function (props: { tournament: any }) {
  const theme = useTheme();
  const classes = useStyles(theme);
  const history = useHistory();

  const tournament = props.tournament;

  const getType = (type: string) => {
    if (type === "round-robin") return "総当たり戦";
    else if (type === "knockout") return "勝ち残り戦";
    return "";
  };

  return (
    <div
      className={classes.tournament}
      onClick={() => {
        history.push("/tournament/detail/" + tournament.id);
      }}
    >
      <div className={classes.tournamentName}>{tournament.name}</div>
      <div className={classes.tournamentOrganizer}>
        主催：{tournament.organizer}
      </div>
      <div className={classes.tournamentType}>
        大会形式：{getType(tournament.type)}
      </div>
      <div className={classes.tournamentRemarks}>
        {tournament.remarks}
      </div>
    </div>
  );
}
