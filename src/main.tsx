/*!

=========================================================
* ByteBattle Platform - TypeScript Migration
=========================================================

* Based on Vision UI Free React
* Migrated to TypeScript with Redux Toolkit

=========================================================

*/

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.js";
import { store } from "./store/index.js";

// Vision UI Dashboard React Context Provider
import { VisionUIControllerProvider } from "context/index.jsx";

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <VisionUIControllerProvider>
          <App />
        </VisionUIControllerProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
