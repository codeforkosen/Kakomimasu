
firebase.auth().onAuthStateChanged(async user => {
  const loginoutBtn = document.querySelector("header #loginout");
  if (user) {
    loginoutBtn.textContent = "ログアウト";
    loginoutBtn.onclick = async () => {
      try {
        await firebase.auth().signOut()
        console.log('ログアウトしました');
        location.reload();
      } catch (error) {
        console.log(`ログアウト時にエラーが発生しました (${error})`);
      };
    };

    const userIcon = document.querySelector("header #user-icon");
    userIcon.src = user.photoURL;
    userIcon.hidden = false;
    console.log('ログインしています');
  }
  else {
    loginoutBtn.onclick = () => {
      location.href = "/user/login";
    }
  }
});