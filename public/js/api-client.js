"use strict";

export class Client {
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
        let user = await this.userShow();
        console.log(user.error);
        if (user.error) {
            user = await this.userRegist();
        }

        // プレイヤー登録
        const match = await this.match(
            { id: user.id, password: this.password, spec: this.spec },
        );
        this.token = match.accessToken;
        this.gameId = match.gameId;
        this.pno = match.index;
        console.log("playerid", match, this.pno);

        do {
            this.gameInfo = await this.getGameInfo(this.gameId);
            await this.sleep(100);
        } while (this.gameInfo.startedAtUnixTime === undefined || this.gameInfo.startedAtUnixTime === null);

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
                this.gameInfo = await this.getGameInfo(this.gameId);
                console.log("gameInfo更新");
                return 0;
            }
        }
        this.gameInfo = await this.getGameInfo(this.gameId);
        return -1;
    }

    action(actions) {
        this.setAction(actions);
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

    async userRegist() {
        const sendJson = {
            screenName: this.name,//screenName,
            name: this.id,
            password: this.password,
        };
        const reqJson = await (await fetch(
            "/api/users/regist",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sendJson),
            },
        )).json();
        //console.log(reqJson, "userRegist");
        return reqJson;
    }

    async userShow() {
        const reqJson = await (await fetch(
            `/api/users/show/${this.id}`,
        )).json();
        //console.log(reqJson, "userShow");
        return reqJson;
    }

    async match({ name = "", id = "", password = "", spec = "" }) {
        const sendJson = { name: name, id: id, password: password, spec: spec };
        const resJson = await (await fetch(
            `/api/match`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sendJson),
            },
        )).json();
        //console.log(resJson, "match");
        return resJson; //[reqJson.accessToken, reqJson.roomId];
    }

    async getGameInfo() {
        const res = await (await fetch(`/api/match/${this.gameId}`)).json();
        if (res.error) {
            console.log("error! ", res);
        }
        return res;
    }

    async setAction(actions) {
        console.log("setAction", JSON.stringify(actions));

        const sendJson = {
            time: Math.floor(new Date().getTime() / 1000),
            actions: actions,
        };
        const resJson = await (await fetch(
            `/api/match/${this.gameId}/action`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": this.token,
                },
                body: JSON.stringify(sendJson),
            },
        )).json();
        console.log(resJson, "setAction");
        return resJson;
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
