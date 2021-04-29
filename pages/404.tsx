// @deno-types="https://deno.land/x/servest@v1.3.0/types/react/index.d.ts"
import React from "https://dev.jspm.io/react/index.js";
import { DFC } from "https://deno.land/x/servest@v1.3.0/mod.ts";

const Index: DFC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <h1>404</h1>
      このページは存在しません
      <link rel="stylesheet" href="/css/404.css" />
    </div>
  );
};

Index.getInitialProps = async () => {
  return { title: "404 NotFound" };
};

// default export are used for Server Side Rendering.
export default Index;
