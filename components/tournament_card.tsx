import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) =>
  createStyles({
    tournament: {
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
    },
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
  })
);

export default function (props: { tournament: any }) {
  const classes = useStyles();
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
