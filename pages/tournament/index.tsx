import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import Content from "../../components/content.tsx";
import TournamentCard from "../../components/tournament_card.tsx";

// @deno-types="../../client_js/api_client.d.ts"
import ApiClient from "../../client_js/api_client.js";
const apiClient = new ApiClient("");

import { Tournament } from "../../apiserver/types.ts";

const useStyles = makeStyles({
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  list: {
    display: "flex",
    width: "100%",
    flexFlow: "row wrap",
    justifyContent: "center",
  },
});

export default function () {
  const classes = useStyles();
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
          component={Link}
          to="/tournament/create"
        >
          大会作成はこちらから
        </Button>
        <div
          style={{
            display: "flex",
            width: "100%",
            flexFlow: "row wrap",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {tournaments.map((t) => <TournamentCard tournament={t} />)}
        </div>
      </div>
    </Content>
  );
}
