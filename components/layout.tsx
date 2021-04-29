// @deno-types="https://deno.land/x/servest@v1.3.0/types/react/index.d.ts"
import React from "https://dev.jspm.io/react/index.js";
import { Header } from "./header.tsx";
import { Footer } from "./footer.tsx";
import {
  FC,
  ReactElement,
} from "https://deno.land/x/servest@v1.3.0/types/react/index.d.ts";

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    backgroundColor: "gray",
  },
  main: {},
  footer: {
    backgroundColor: "gray",
  },
};

export const Layout: FC = (props) => {
  const children = props.children as ReactElement;
  const title = children.props.title + " - 囲みマス";
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" type="image/png" href="/img/kakomimasu-icon.png" />
        <link rel="apple-touch-icon" href="/img/kakomimasu-icon.png" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/modern-css-reset@1.4.0/dist/reset.min.css"
        />
        <link rel="stylesheet" href="/css/layout.css" />

        <title>{title}</title>

        <script
          src="https://www.gstatic.com/firebasejs/8.4.2/firebase-app.js"
        />
        <script
          src="https://www.gstatic.com/firebasejs/8.4.2/firebase-analytics.js"
        />
        <script
          src="https://www.gstatic.com/firebasejs/8.4.2/firebase-auth.js"
        />
        <script src="/js/layout.js" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
};
