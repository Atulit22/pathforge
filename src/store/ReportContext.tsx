import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

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
  ) {
    const selectedReport = reports.find(
      (report) => report.id === reportId
    );

    if (!selectedReport) {
      return [];
    }

    const rootReportId =
      selectedReport.supersedesReportId ??
      selectedReport.id;

    return reports
      .filter(
        (report) =>
          report.id === rootReportId ||
          report.supersedesReportId === rootReportId
      )
      .sort(
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