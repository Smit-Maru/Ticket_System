import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { queryClient } from "./lib/queryClient";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryPersister } from "./lib/queryPersister.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PersistQueryClientProvider 
      client={queryClient}
      persistOptions={{
        persister:queryPersister,
        maxAge: 24 * 60 * 60 * 1000,
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);
