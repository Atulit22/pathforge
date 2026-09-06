import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// IMPORTANT: ReportContext.tsx is inside src/store
// so ../ goes back to src, then enters domain
import { validateReport } from "../domain/validation";

import type {
  ReportContent,
  ValidationResult,
} from "../domain/types";

export interface Report {
  id: string;
  patientId: string;

  specimenType: string;
  clinicalHistory: string;
  findings: string;
  diagnosis: string;

  status: "draft" | "finalized";

  version: number;

  createdAt: string;
  updatedAt?: string;
  finalizedAt?: string;

  supersedesReportId?: string;
}

interface ReportContextType {
  reports: Report[];

  addReport: (report: Report) => void;

  updateReport: (
    id: string,
    updates: Partial<Report>
  ) => void;

  getReport: (
    id: string
  ) => Report | undefined;

  createAmendment: (
    reportId: string
  ) => Report | undefined;

  getReportVersions: (
    reportId: string
  ) => Report[];

  validateReportBeforeFinalizing: (
    reportId: string
  ) => ValidationResult;
}

const ReportContext = createContext<
  ReportContextType | undefined
>(undefined);

export function ReportProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [reports, setReports] = useState<Report[]>([]);

  function addReport(report: Report) {
    setReports((previous) => [
      ...previous,
      report,
    ]);
  }

  function updateReport(
    id: string,
    updates: Partial<Report>
  ) {
    setReports((previous) =>
      previous.map((report) =>
        report.id === id
          ? {
              ...report,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : report
      )
    );
  }

  function getReport(id: string) {
    return reports.find(
      (report) => report.id === id
    );
  }

  function validateReportBeforeFinalizing(
    reportId: string
  ): ValidationResult {
    const report = reports.find(
      (item) => item.id === reportId
    );

    if (!report) {
      return {
        valid: false,
        errors: [
          {
            field: "report",
            code: "REPORT_NOT_FOUND",
            message: "Report not found.",
          },
        ],
      };
    }

    const content: ReportContent = {
      specimens: [
        {
          id: crypto.randomUUID(),
          type: report.specimenType,
        },
      ],

      clinicalHistory: {
        text: report.clinicalHistory,
      },

      findings: report.findings,

      diagnosis: report.diagnosis,
    };

    return validateReport(content);
  }

  function createAmendment(
    reportId: string
  ): Report | undefined {
    const originalReport = reports.find(
      (report) => report.id === reportId
    );

    if (!originalReport) {
      return undefined;
    }

    const amendment: Report = {
      id: crypto.randomUUID(),

      patientId: originalReport.patientId,

      specimenType: originalReport.specimenType,

      clinicalHistory:
        originalReport.clinicalHistory,

      findings: originalReport.findings,

      diagnosis: originalReport.diagnosis,

      status: "draft",

      version: originalReport.version + 1,

      createdAt: new Date().toISOString(),

      supersedesReportId: originalReport.id,
    };

    setReports((previous) => [
      ...previous,
      amendment,
    ]);

    return amendment;
  }

  function getReportVersions(
    reportId: string
  ): Report[] {
    const selectedReport = reports.find(
      (report) => report.id === reportId
    );

    if (!selectedReport) {
      return [];
    }

    let rootReport = selectedReport;

    while (rootReport.supersedesReportId) {
      const parent = reports.find(
        (report) =>
          report.id === rootReport.supersedesReportId
      );

      if (!parent) break;

      rootReport = parent;
    }

    const versions: Report[] = [];

    function collectVersion(
      parentId: string
    ) {
      const current = reports.find(
        (report) => report.id === parentId
      );

      if (current) {
        versions.push(current);
      }

      const children = reports.filter(
        (report) =>
          report.supersedesReportId === parentId
      );

      children.forEach((child) => {
        collectVersion(child.id);
      });
    }

    collectVersion(rootReport.id);

    return versions.sort(
      (a, b) => a.version - b.version
    );
  }

  return (
    <ReportContext.Provider
      value={{
        reports,
        addReport,
        updateReport,
        getReport,
        createAmendment,
        getReportVersions,
        validateReportBeforeFinalizing,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);

  if (!context) {
    throw new Error(
      "useReports must be used inside ReportProvider"
    );
  }

  return context;
}