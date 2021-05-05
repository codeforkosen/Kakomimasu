/// <reference no-default-lib="true"/>
/// <reference lib="dom"/>
/// <reference lib="es2015"/>
import { React } from "../components/react.ts";
import { Link } from "../components/react-router-dom.ts";

import {
  AppBar,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Toolbar,
} from "../components/material-ui.ts";

import firebase from "../components/firebase.ts";

const nav = [
  { text: "ゲーム一覧", url: "/game/index" },
  { text: "大会一覧", url: "/tournament/index" },
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
    logo: {
      flexGrow: 1,
    },
  })
);

export default function () {
  const classes = useStyles();
  //const [user, setUser] = React.useState<null | {photoUrl:string}>(null)
  //this.classes = useStyles();
  //const [auth, setAuth] = React.useState(true);
  //const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  //const open = Boolean(anchorEl);

  //public state: { user?: { photoUrl: string } };
  //public history = useHistory();

  /*constructor(props: ConstructorParameters<typeof React.Component>) {
    super(props);
    this.state = { user: undefined };
    this.userState();
  }*/

  const userState = () => {
    console.log("userState");
    firebase.auth().onAuthStateChanged(async (user) => {
      //const loginoutBtn = document.querySelector("header #loginout");
      console.log(user);
      if (user) {
        const photoUrl = user.photoURL;
        //this.setState({ user: { photoUrl } });
        console.log("ログインしました");
        /*loginoutBtn.textContent = "ログアウト";
        loginoutBtn.onclick = async () => {
          try {
            await firebase.auth().signOut();
            console.log("ログアウトしました");
            location.reload();
          } catch (error) {
            console.log(`ログアウト時にエラーが発生しました (${error})`);
          }
        };*/

        /*const userIcon = document.querySelector("header #user-icon");
        userIcon.src = user.photoURL;
        userIcon.hidden = false;
        console.log("ログインしています");*/
      } else {
        /*loginoutBtn.onclick = () => {
          location.href = "/user/login";
        };*/
      }
    });
  };

  const userLogOut = () => {
    // try {
    //   await firebase.auth().signOut();
    //   console.log("ログアウトしました");
    //   console.log(useLocation());
    //   this.history.push(useLocation().pathname); //location.reload();
    // } catch (error) {
    //   console.log(`ログアウト時にエラーが発生しました (${error})`);
    // }
  };
  return (
    <AppBar>
      <Toolbar>
        <div className={classes.logo}>
          <Link to="/index">
            <img
              height={36}
              src="/img/kakomimasu-logo.png"
              alt="囲みマスロゴ"
            />
          </Link>
        </div>
        <Button color="inherit">ログイン・新規登録</Button>
      </Toolbar>
    </AppBar>
  );
}
// {/* <Toolbar>
//           {this.state.user && (
//             <div>
//               <Avatar
//                 src={this.state.user.photoUrl}
//               />
//               {
//                 /*} <Menu
//                 id="menu-appbar"
//                 anchorEl={anchorEl}
//                 anchorOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 keepMounted
//                 transformOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 open={open}
//                 onClose={handleClose}
//               >
//                 <MenuItem onClick={handleClose}>Profile</MenuItem>
//                 <MenuItem onClick={handleClose}>My account</MenuItem>
//               </Menu>*/
//               }
//             </div>
//           )}
//         </Toolbar> */}

/*

<header>
         <nav id="h-tab">
          <ul>
            {nav.map((e) => {
              return <li key={e.url}>
                <Link to={e.url}>{e.text}</Link>
              </li>;
            })}
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>
        <div id="h_user">
        </div>
        <script type="module" src="/js/header.js" />
        <link rel="stylesheet" href="/css/header.css" />
      </header>
{this.state.user
            ? (
              <>
                <button onClick={this.userLogOut}>ログアウト</button>
                <img id="user-icon" src={this.state.user.photoUrl} />
              </>
            )
            : (
              <Link to="/user/login">
                <button id="loginout">ログイン・新規登録</button>
              </Link>
            )}
*/
