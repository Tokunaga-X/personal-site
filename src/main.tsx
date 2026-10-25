import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./app/globals.css";

config.autoAddCss = false;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
