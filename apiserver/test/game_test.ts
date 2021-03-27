import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { v4 } from "https://deno.land/std@0.89.0/uuid/mod.ts";

import ApiClient from "../api_client.js";
const ac = new ApiClient();

import { errors } from "../error.ts";

const typelist = ["round-robin", "knockout"];
const assertType = (type: string) => {
  return typelist.some((e) => e === type);
};

const assertGame = (game: any, sample: any = {}) => {
  const game_ = Object.assign({}, game);
  const sample_ = Object.assign({}, sample);
  assert(v4.validate(game_.gameId));
  assertEquals(game_.gaming, false);
  assertEquals(game_.ending, false);
  assertEquals(game_.board, null);
  assertEquals(game_.turn, 0);
  assertEquals(game_.tiled, null);
  assert(Array.isArray(game_.players));
  assert(Array.isArray(game_.log));
  assertEquals(game_.gameName, sample_.name || "");
  assertEquals(game_.startedAtUnixTime, null);
  assertEquals(game_.nextTurnUnixTime, null);
  assert(Array.isArray(game_.reservedUsers));

  if (sample_.reservedUsers) assert(game_.reservedUsers, sample_.reservedUsers);
};

const assertBoard = (board: any) => {
  assertEquals(typeof board.name, "string");
  assertEquals(typeof board.width, "number");
  assertEquals(typeof board.height, "number");
  assertEquals(typeof board.nTurn, "number");
  assertEquals(typeof board.nAgent, "number");
  assertEquals(typeof board.nSec, "number");
  assert(Array.isArray(board.points));
};

const data: any = {
  name: "テスト",
  boardName: "A-1",
};

// /api/game/create Test
// テスト項目
// 正常、ボード名無し、ユーザ無し、既に登録済みのユーザ、playerIdentifiers無効
// 存在しないトーナメントID
Deno.test("api/game/create:normal", async () => {
  const res = await ac.gameCreate({ ...data, option: { dryRun: true } });
  assertGame(res, data);
});
Deno.test("api/game/create:normal with playerIdentifiers", async () => {
  const uuid = v4.generate();
  const userData: any = { screenName: uuid, name: uuid, password: uuid };
  const userRes = await ac.usersRegist(userData);
  userData.id = userRes.id;

  const res = await ac.gameCreate({
    ...data,
    playerIdentifiers: [userData.id],
    option: { dryRun: true },
  });

  assertGame(res, { ...data, reservedUsers: [userData.id] });
});
Deno.test("api/game/create:invalid boardName", async () => {
  {
    const res = await ac.gameCreate({
      ...data,
      boardName: "",
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_BOARD_NAME);
  }
  {
    const res = await ac.gameCreate({
      ...data,
      boardName: undefined,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_BOARD_NAME);
  }
  {
    const res = await ac.gameCreate({
      ...data,
      boardName: null,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_BOARD_NAME);
  }
});
Deno.test("api/game/create:not user", async () => {
  const res = await ac.gameCreate({
    ...data,
    playerIdentifiers: [v4.generate()],
    option: { dryRun: true },
  });
  assertEquals(res, errors.NOT_USER);
});
Deno.test("api/game/create:already registed user", async () => {
  const uuid = v4.generate();
  const userData: any = { screenName: uuid, name: uuid, password: uuid };
  const userRes = await ac.usersRegist(userData);
  userData.id = userRes.id;

  const res = await ac.gameCreate({
    ...data,
    playerIdentifiers: [userData.id, userData.id],
    option: { dryRun: true },
  });
  assertEquals(res, errors.ALREADY_REGISTERED_USER);
});
Deno.test("api/game/create:invalid tournament id", async () => {
  const res = await ac.gameCreate({
    ...data,
    tournamentId: v4.generate(),
    option: { dryRun: true },
  });
  assertEquals(res, errors.INVALID_TOURNAMENT_ID);
});

// /api/game/boards Test
// テスト項目
// 正常
Deno.test("api/game/boards:normal", async () => {
  const res = await ac.getBoards() as Array<any>;
  res.forEach((e) => assertBoard(e));
});
