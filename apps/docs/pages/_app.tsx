import "../styles/global.css";

import React from "react";
import withTwindApp from "@twind/next/app";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default withTwindApp(MyApp);
