import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.js'

const header = new Vue({
    el: "#header",
    template: `
    <header>
        <div id="h-wrapper">
            <a href="/" id="h-logo"><img src="/img/kakomimasu-logo.png" alt="囲みマスロゴ"></a>
            <div id="h-navWrapper">
            <nav id="h-tab">
                <ul>
                    <li><a href="/">TOP</a></li>
                    <li><a href="/gamelist.html">ゲーム一覧</a></li>
                </ul>
            </nav>
            <a href="https://github.com/codeforkosen/Kakomimasu" id="h-githubLogo"><img src="/img/GitHub-Mark-64px.png"></a>
            </div>
        </div>
    </header>`,
});

const footer = new Vue({
    el: "#footer",
    template: `
    <footer>
        CC BY <a href="https://codeforkosen.github.io/">Code for KOSEN</a>(<a href="https://github.com/codeforkosen/Kakomimasu">src on GitHub</a>)
    </footer>`,
})