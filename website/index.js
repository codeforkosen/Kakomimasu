ScrollReveal().reveal('.box',
{
    duration: 1600,
    scale: 0.1,
    reset: true
});
ScrollReveal().reveal('#headimg',
{
    duration: 1600,
    scale: 0.1,
    reset: true
});


$('a[href^="#"]').click(function(){
    var speed = 500;　//スクロールスピード
    var href= $(this).attr("href");
    var target = $(href == "#" || href == "" ? 'html' : href);
    var position = target.get(0).offsetTop;
    console.log(target,position);
    $("html, body").animate({scrollTop:position}, speed, "swing");
    return false;
});
$('#topback').click(function () {
    $('body, html').animate({ scrollTop: 0 }, 500); //0.5秒かけてトップへ戻る
    return false;
});

window.onload = function(){
    var a = document.querySelectorAll(".mButton");
    var ruleImg = document.getElementById("ruleimg");
    for(const el of a) {
        el.onclick = function() {
            // window.history.replaceState(null, '', location.pathname + location.search);
            var check = document.getElementById("drawer-check");
            check.checked = false;
        }
    }
    ruleImg.onclick = function() {
        console.log("img click");
        window.open("https://camo.githubusercontent.com/3d4a223fdf9fcf6d1d2f212df738a0bb28eddb6b7aee1c2031954906d1a9d0d1/68747470733a2f2f636f6465666f726b6f73656e2e6769746875622e696f2f4b616b6f6d696d6173752f696d672f6b616b6f6d696d6173752d696d672e706e67");
    }

    // window.addEventListener( 'resize', agentLoad(), false);
}



function topBack() {
    obj = document.getElementById("top");
   y = obj.offsetTop;
   scrollTo(0,y);
}
