self.addEventListener('push', function (evt) {
    if (evt.data) {
        var data = evt.data.json();
        evt.waitUntil(
            self.registration.showNotification(
                data.title,
                {
                    //icon: '(アイコンのURL(パスのみでOK))',
                    body: data.body,
                    tag: data.tag
                }
            )
        );
    }
}, false);

// サーバーから送られてくるJSONデータ形式
const data = {
    title: "タイトル",
    body: "本文",
    tag: "タグ"
}
