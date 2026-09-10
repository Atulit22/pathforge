import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";

import "./index.css";

import App from "./App";
import { muiTheme } from "./lib/muiTheme";

import { AuthProvider } from "./store/AuthContext";
import { PatientProvider } from "./store/PatientContext";
import { TestProvider } from "./store/TestContext";
import { ReportProvider } from "./store/ReportContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <AuthProvider>
        <PatientProvider>
          <TestProvider>
            <ReportProvider>
              <App />
            </ReportProvider>
          </TestProvider>
        </PatientProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);