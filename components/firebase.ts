import firebase from "http://esm.sh/firebase@8.5.0?bundle";

const init = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyDz0FDikVy97fFfGtnNf3UME7Zi393CXMM",
    authDomain: "kakomimasu-6a8bb.firebaseapp.com",
    projectId: "kakomimasu-6a8bb",
    storageBucket: "kakomimasu-6a8bb.appspot.com",
    messagingSenderId: "399214483363",
    appId: "1:399214483363:web:966f0b596472476725ac16",
    measurementId: "G-9E8LR1LC9W",
  };

  firebase.initializeApp(firebaseConfig);
  firebase.auth();
  firebase.analytics();
  console.log("firebase Initialized");
};

export default firebase;
export { init };
