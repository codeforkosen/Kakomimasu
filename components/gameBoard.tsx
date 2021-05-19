import React, { useEffect, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";

import ApiClient from "../apiserver/api_client.js";
const apiClient = new ApiClient("");

type Props = {
  game: any;
};

const useStyles = makeStyles((theme) => createStyles({}));

export default function (props: Props) {
  const classes = useStyles();
  const history = useHistory();
  const game = props.game;

  const turnT = (game.gaming || game.ending)
    ? `${game.turn}/${game.totalTurn}`
    : "-";

  const points = (game.players as any[]).map(
    (player) => (player.point.basepoint + player.point.wallpoint),
  );

  const getStatusT = () => {
    if (game.startedAtUnixTime === null) return "プレイヤー入室待ち";
    else if (game.ending) return "ゲーム終了";
    else if (game.gaming) return "プレイ中";
    else return "ゲームスタート待ち";
  };

  return (
    <div>
      <div>
        <h4>{turnT}</h4>
        {Boolean(turnT)
          ? points.map((point, i) =>
            <>
              <h4>{point}</h4>
              {i < (points.length - 1) && <h4>:</h4>}
            </>
          )
          : <h4>{getStatusT()}</h4>}
      </div>
      <div></div>
    </div>
  );
}
