import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import Content from "../../components/content.tsx";
import TournamentCard from "../../components/tournament_card.tsx";

// @deno-types="../../apiserver/api_client.d.ts"
import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import { Tournament } from "../../apiserver/types.ts";

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    list: {
      display: "flex",
      padding: 50,
      width: "100%",
      flexFlow: "row wrap",
      justifyContent: "center",
    },
  })
);

export default function () {
  const classes = useStyles();
  const history = useHistory();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const getTournament = async () => {
    const res = await apiClient.tournamentsGet();
    if (res.success) setTournaments(res.data);
  };

  useEffect(() => {
    getTournament();
  }, []);

  return (
    <Content title="大会一覧">
      <div className={classes.content}>
        <Button
          onClick={() => {
            history.push("/tournament/create");
          }}
        >
          大会作成はこちらから
        </Button>
        <div className={classes.list}>
          {tournaments.map((t) => <TournamentCard tournament={t} />)}
        </div>
      </div>
    </Content>
  );
}
