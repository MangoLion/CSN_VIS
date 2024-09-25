import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { UniversalDataProvider } from "./context/UniversalDataContext";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <UniversalDataProvider>
    <App />
  </UniversalDataProvider>
);
