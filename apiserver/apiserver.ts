import {
  ServerRequest,
  createRouter,
  contentTypeFilter,
  createApp,
} from "https://servestjs.org/@v1.0.0/mod.ts";

import { players, Player, PlayerPost } from "./models/player.ts";

export const newPlayerPost = async (req: ServerRequest) => {
  console.log(req);
  const bodyJson = (await req.json()) as PlayerPost;
  const player = new Player(bodyJson.playerName, bodyJson.spec);
  players.push(player);

  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify(player),
  });
};

// Setting routes
export const routes = () => {
  const router = createRouter();

  router.post("match", contentTypeFilter("application/json"), newPlayerPost);

  return router;
};

// Port Listen
const app = createApp();
app.route("/", routes());
app.listen({ port: 8880 });
