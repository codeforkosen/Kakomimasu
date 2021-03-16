import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { v4 } from "https://deno.land/std@0.89.0/uuid/mod.ts";

import ApiClient from "../api_client.js";
const ac = new ApiClient();

import { pathResolver } from "../apiserver_util.ts";
const resolve = pathResolver(import.meta);

import { errors } from "../error.ts";

const save = (fileName: string, data: object) => {
  Deno.writeTextFileSync(
    resolve(`./sample_/${fileName}.json`),
    JSON.stringify(data),
  );
};
const read = (fileName: string) => {
  return JSON.parse(
    Deno.readTextFileSync(resolve(`./sample_/${fileName}.json`)),
  );
};

const assertTournament = (tournament: any, sample: any) => {
  const tournament_ = Object.assign({}, tournament);
  const sample_ = Object.assign({}, sample);
  assert(v4.validate(tournament_.id));

  sample_.organizer = "";
  sample_.remarks = "";
  sample_.users = [];
  sample_.gameIds = [];

  tournament_.id = sample_.id = undefined;
  assertEquals(tournament_, sample_);
};

const uuid = v4.generate();
const data = {
  name: uuid,
  type: "round-robin",
};

Deno.test("api/tournament/create:normal", async () => {
  {
    const res = await ac.tournamentsCreate({
      ...data,
      option: { dryRun: true },
    });
    assertTournament(res, data);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: "knockout",
      option: { dryRun: true },
    });
    assertTournament(res, { ...data, type: "knockout" });
  }
});
Deno.test("api/tournament/create:invalid tournament name", async () => {
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: "",
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_NAME);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: undefined,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_NAME);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: null,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_NAME);
  }
});
Deno.test("api/tournament/create:invalid tournament type", async () => {
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: "",
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: undefined,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: null,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: "round-robins",
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TYPE);
  }
});
