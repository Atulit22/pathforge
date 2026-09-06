import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { PatientProvider } from "./store/PatientContext";
import { ReportProvider } from "./store/ReportContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PatientProvider>
      <ReportProvider>
        <App />
      </ReportProvider>
    </PatientProvider>
  </StrictMode>
);