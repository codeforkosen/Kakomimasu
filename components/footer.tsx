// @deno-types="https://deno.land/x/servest@v1.3.0/types/react/index.d.ts"
import React from "https://dev.jspm.io/react/index.js";
import { FC } from "https://deno.land/x/servest@v1.3.0/types/react/index.d.ts";

export const Footer: FC = () => {
  return (
    <footer>
      <div id="f_link">
        <a href="https://github.com/codeforkosen/Kakomimasu">
          <img src="/img/GitHub-Mark-64px.png" />
        </a>
      </div>
      <div>
        <a href="https://deno.land/">
          <img
            src="https://img.shields.io/badge/-deno-161E2E.svg?logo=deno&style=flat"
          />
        </a>
      </div>
      <div>
        <a href="https://codeforkosen.github.io/">CC BY Code for KOSEN</a>
      </div>

      <link rel="stylesheet" href="/css/footer.css" />
    </footer>
  );
};
