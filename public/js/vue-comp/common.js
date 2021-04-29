import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.js'
import { firebaseConfig } from "/js/util.js";

const header = new Vue({
    el: "#header",
    template: `
    <header>
        <div id="h-wrapper">
            <a href="/index" id="h-logo"><img src="/img/kakomimasu-logo.png" alt="囲みマスロゴ"></a>
            <div id="h-navWrapper">
                <nav id="h-tab">
                    <ul>
                        <li><a href="/">TOP</a></li>
                        <li><a href="/gamelist.html">ゲーム一覧</a></li>
                        <li><a href="/tournament/index.html">大会一覧</a></li>
                    </ul>
                </nav>
                <a href="https://github.com/codeforkosen/Kakomimasu" id="h-githubLogo"><img src="/img/GitHub-Mark-64px.png"></a>
                <a id="h-user"><img id="h-userImg" src=""></a>
                <a href="user/login" id="h-login">ログイン</a>
            </div>
        </div>
    </header>`,
    created() {
        const appScript = document.createElement("script");
        appScript.src = "https://www.gstatic.com/firebasejs/8.4.2/firebase-app.js"
        document.body.appendChild(appScript);
        const analyticsScript = document.createElement("script");
        analyticsScript.src = "https://www.gstatic.com/firebasejs/8.4.2/firebase-analytics.js"
        document.body.appendChild(analyticsScript);
        const authScript = document.createElement("script");
        authScript.src = "https://www.gstatic.com/firebasejs/8.4.2/firebase-auth.js"
        document.body.appendChild(authScript);

        authScript.onload = () => {
            firebase.initializeApp(firebaseConfig);
            firebase.analytics();
            firebase.auth().onAuthStateChanged(async user => {
                if (user) {
                    console.log('ログインしています');
                    const user = await firebase.auth().currentUser;
                    const photoUrl = user.photoURL;
                    const img = document.getElementById("h-userImg");
                    img.src = photoUrl;
                    const a = document.getElementById("h-user");
                    a.href = "/user/detail.html?id=" + user.uid;

                    const a2 = document.getElementById("h-login")
                    a2.textContent = "ログアウト";
                    a2.href = "";
                    a2.onclick = this.logout;
                }
            });
        }
    },
    methods: {
        logout() {
            firebase.auth().onAuthStateChanged(user => {
                firebase
                    .auth()
                    .signOut()
                    .then(() => {
                        console.log('ログアウトしました');
                        location.reload();
                    })
                    .catch((error) => {
                        console.log(`ログアウト時にエラーが発生しました (${error})`);
                    });
            });

        }
    }
});

const footer = new Vue({
    el: "#footer",
    template: `
    <footer>
        CC BY <a href="https://codeforkosen.github.io/">Code for KOSEN</a>(<a href="https://github.com/codeforkosen/Kakomimasu">src on GitHub</a>)
    </footer>`,
})