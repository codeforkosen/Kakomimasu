"use strict";

import ApiClient from "./api_client.js";

export class Client {

    apiClient = new ApiClient(location.origin);

    constructor(id, name, spec, password) {
        if (password) {
            this.id = id;
            this.name = name;
            this.spec = spec;
            this.password = password;
            console.log(this.id, this.password, this.name, this.spec);
        } else {
            this.gameId = id;
            this.token = name;
            this.pno = spec;
            console.log("既存のゲームに接続", this.gameId, this.token, this.pno);
        }
    }

    async waitMatching() {
        // ユーザ取得（ユーザがなかったら新規登録）
        const userRes = await this.apiClient.usersShow(
            this.id,
            `Basic ${this.id}:${this.password}`,
        );
        let user;
        console.log(userRes.success);
        if (userRes.success) user = userRes.data;
        else {
            const res = await this.userRegist({
                screenName: this.name,
                name: this.id,
                password: this.password,
            });
            if (res.success) user = res.data;
            else throw Error("User Regist Error");
        }
        this.bearerToken = user.bearerToken;

        // プレイヤー登録
        const matchParam = {
            id: user.id,
            password: this.password,
            spec: this.spec,
        };
        const MatchRes = await this.apiClient.match(
            matchParam,
            `Bearer ${this.bearerToken}`,
        );
        if (MatchRes.success) {
            const matchGame = MatchRes.data;
            this.gameId = matchGame.gameId;
            this.pno = matchGame.index;
            console.log("playerid", matchGame, this.pno);
        } else {
            console.log(MatchRes.data);
            throw Error("Match Error");
        }
        do {
            const gameRes = await this.apiClient.getMatch(this.gameId);
            if (gameRes.success) this.gameInfo = gameRes.data;
            else throw Error("Get Match Error");
            await this.sleep(100);
        } while (this.gameInfo.startedAtUnixTime === null);

        console.log(this.gameInfo);
        console.log(
            "ゲーム開始時間：",
            new Date(this.gameInfo.startedAtUnixTime * 1000).toLocaleString("ja-JP"),
        );
        return this.gameInfo;
    }

    async waitNextTurn() {
        if (this.gameInfo?.startedAtUnixTime) {
            if (!this.gameInfo.ending) {
                let diff = this.diffTime(this.gameInfo.startedAtUnixTime);
                if (diff < 0) {
                    diff = this.diffTime(this.gameInfo.nextTurnUnixTime);
                }
                await this.sleep(diff + 200);
                const res  = await this.apiClient.getMatch(this.gameId);
                if (res.success) this.gameInfo = res.data;
                else throw Error("Get Match Error");
                console.log("gameInfo更新");
                return 0;
            }
        }
        this.gameInfo = await this.apiClient.getMatch(this.gameId);
        const res  = await this.apiClient.getMatch(this.gameId);
        if (res.success) this.gameInfo = res.data;
        else throw Error("Get Match Error");
        return -1;
    }

    async action(actions) {
        const res = await this.apiClient.setAction(
            this.gameId,
            { actions },
            "Bearer " + this.bearerToken,
        );
        console.log("setActions", res);
        if (res.success === false) throw Error("Set Action Error");
    }

    sleep(msec) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), msec);
        });
    }
    diffTime(unixTime) {
        const dt = unixTime * 1000 - new Date().getTime();
        console.log("diffTime", dt);
        return dt;
    }
}

export class Action {
    constructor(agentId, type, x, y) {
        this.agentId = agentId;
        this.type = type;
        this.x = x;
        this.y = y;
    }
}
