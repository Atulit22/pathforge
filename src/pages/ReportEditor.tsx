import { useEffect, useState } from "react";
import {
  Save,
  CheckCircle2,
  FileText,
  GitBranchPlus,
  Lock,
  Printer,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";

import { useReports } from "../store/ReportContext";
import { usePatients } from "../store/PatientContext";

interface ReportEditorProps {
  reportId: string;
  onBack: () => void;
  onOpenReport: (reportId: string) => void;
}

function ReportEditor({
  reportId,
  onBack,
  onOpenReport,
}: ReportEditorProps) {
  const {
    getReport,
    updateReport,
    createAmendment,
  } = useReports();

  const { patients } = usePatients();

  const foundReport = getReport(reportId);

  const [formData, setFormData] = useState({
    specimenType: "",
    clinicalHistory: "",
    findings: "",
    diagnosis: "",
  });

  // ========================================
  // LOAD REPORT DATA
  // ========================================

  useEffect(() => {
    if (!foundReport) return;

    setFormData({
      specimenType: foundReport.specimenType ?? "",
      clinicalHistory:
        foundReport.clinicalHistory ?? "",
      findings: foundReport.findings ?? "",
      diagnosis: foundReport.diagnosis ?? "",
    });
  }, [foundReport]);

  // ========================================
  // REPORT NOT FOUND
  // ========================================

  if (!foundReport) {
    return (
      <div className="report-not-found">
        <h2>Report not found</h2>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          Back to Worklist
        </button>
      </div>
    );
  }

  const report = foundReport;

  const patient = patients.find(
    (patient) =>
      patient.id === report.patientId
  );

  const isFinalized =
    report.status === "finalized";

  // ========================================
  // HANDLE FORM CHANGE
  // ========================================

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    if (isFinalized) return;

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ========================================
  // SAVE REPORT
  // ========================================

  function saveChanges() {
    if (isFinalized) return;

    updateReport(report.id, {
      specimenType:
        formData.specimenType,

      clinicalHistory:
        formData.clinicalHistory,

      findings:
        formData.findings,

      diagnosis:
        formData.diagnosis,
    });

    Swal.fire({
      icon: "success",
      title: "Changes Saved",
      text: "Report changes have been saved successfully.",
      timer: 1800,
      showConfirmButton: false,
    });
  }

  // ========================================
  // FINALIZE REPORT
  // ========================================

  function finalizeReport() {
    if (isFinalized) return;

    updateReport(report.id, {
      specimenType:
        formData.specimenType,

      clinicalHistory:
        formData.clinicalHistory,

      findings:
        formData.findings,

      diagnosis:
        formData.diagnosis,

      status: "finalized",

      finalizedAt:
        new Date().toISOString(),
    });

    Swal.fire({
      icon: "success",
      title: "Report Finalized",
      text: `Report Version ${report.version} has been finalized.`,
    });
  }

  // ========================================
  // CREATE AMENDMENT
  // ========================================

  function handleCreateAmendment() {
    if (!isFinalized) return;

    const amendment =
      createAmendment(report.id);

    if (!amendment) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not create amendment.",
      });

      return;
    }

    Swal.fire({
      icon: "success",
      title: "Amendment Created",
      text: `Version ${amendment.version} created as a draft amendment.`,
    });

    onOpenReport(amendment.id);
  }

  // ========================================
  // PRINT REPORT
  // ========================================

  function handlePrint() {
    window.print();
  }

  // ========================================
  // GENERATE PDF
  // ========================================

  function handleGeneratePDF() {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 18;

    const contentWidth =
      pageWidth - margin * 2;

    let y = 18;

    // COLORS

    const navy = [15, 42, 61] as const;

    const blue = [37, 99, 235] as const;

    const lightBlue = [
      239,
      246,
      255,
    ] as const;

    const lightGray = [
      245,
      247,
      250,
    ] as const;

    const gray = [
      107,
      114,
      128,
    ] as const;

    const dark = [
      31,
      41,
      55,
    ] as const;

    const green = [
      22,
      163,
      74,
    ] as const;

    const orange = [
      217,
      119,
      6,
    ] as const;

    // ========================================
    // HEADER
    // ========================================

    function drawHeader() {
      pdf.setFillColor(...navy);

      pdf.rect(
        0,
        0,
        pageWidth,
        32,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(20);

      pdf.text(
        "PATHFORGE",
        margin,
        16
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.text(
        "CLINICAL PATHOLOGY WORKSPACE",
        margin,
        23
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.text(
        "PATHOLOGY REPORT",
        pageWidth - margin,
        17,
        {
          align: "right",
        }
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.text(
        `VERSION ${report.version}`,
        pageWidth - margin,
        23,
        {
          align: "right",
        }
      );
    }

    // ========================================
    // FOOTER
    // ========================================

    function drawFooter(
      pageNumber: number
    ) {
      pdf.setDrawColor(
        220,
        220,
        220
      );

      pdf.line(
        margin,
        pageHeight - 16,
        pageWidth - margin,
        pageHeight - 16
      );

      pdf.setTextColor(...gray);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7);

      pdf.text(
        "Generated by PathForge Clinical Pathology Workspace",
        margin,
        pageHeight - 10
      );

      pdf.text(
        `Page ${pageNumber}`,
        pageWidth - margin,
        pageHeight - 10,
        {
          align: "right",
        }
      );
    }

    // ========================================
    // PAGE SPACE CHECK
    // ========================================

    function ensureSpace(
      requiredHeight: number
    ) {
      if (
        y + requiredHeight >
        pageHeight - 25
      ) {
        pdf.addPage();

        drawHeader();

        y = 45;
      }
    }

    // ========================================
    // SECTION TITLE
    // ========================================

    function addSectionTitle(
      title: string
    ) {
      ensureSpace(20);

      pdf.setFillColor(
        ...lightBlue
      );

      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        9,
        2,
        2,
        "F"
      );

      pdf.setTextColor(...blue);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.text(
        title.toUpperCase(),
        margin + 4,
        y + 6
      );

      y += 15;
    }

    // ========================================
    // PARAGRAPH
    // ========================================

    function addParagraph(
      content: string
    ) {
      const text =
        content?.trim() ||
        "Not provided";

      pdf.setTextColor(...dark);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(9);

      const lines =
        pdf.splitTextToSize(
          text,
          contentWidth
        );

      lines.forEach(
        (line: string) => {
          ensureSpace(7);

          pdf.text(
            line,
            margin,
            y
          );

          y += 5.5;
        }
      );

      y += 7;
    }

    // ========================================
    // START DOCUMENT
    // ========================================

    drawHeader();

    y = 45;

    // TITLE

    pdf.setTextColor(...dark);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(16);

    pdf.text(
      "Diagnostic Pathology Report",
      margin,
      y
    );

    y += 7;

    pdf.setTextColor(...gray);

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(8);

    pdf.text(
      `Generated: ${new Date().toLocaleString()}`,
      margin,
      y
    );

    y += 12;

    // ========================================
    // PATIENT INFORMATION
    // ========================================

    pdf.setFillColor(
      ...lightGray
    );

    pdf.roundedRect(
      margin,
      y,
      contentWidth,
      38,
      3,
      3,
      "F"
    );

    pdf.setTextColor(...dark);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(10);

    pdf.text(
      "PATIENT INFORMATION",
      margin + 5,
      y + 8
    );

    pdf.setDrawColor(
      220,
      220,
      220
    );

    pdf.line(
      margin + 5,
      y + 11,
      pageWidth - margin - 5,
      y + 11
    );

    const leftX =
      margin + 5;

    const rightX =
      margin +
      contentWidth / 2 +
      5;

    const infoY =
      y + 19;

    pdf.setTextColor(...gray);

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(8);

    pdf.text(
      "PATIENT NAME",
      leftX,
      infoY
    );

    pdf.text(
      "PATIENT ID",
      rightX,
      infoY
    );

    pdf.text(
      "REPORT VERSION",
      leftX,
      infoY + 11
    );

    pdf.text(
      "STATUS",
      rightX,
      infoY + 11
    );

    pdf.setTextColor(...dark);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(10);

    pdf.text(
      patient?.name ??
        "Unknown Patient",
      leftX,
      infoY + 5
    );

    pdf.text(
      patient?.patientId ??
        "Unknown ID",
      rightX,
      infoY + 5
    );

    pdf.text(
      `Version ${report.version}`,
      leftX,
      infoY + 16
    );

    if (isFinalized) {
      pdf.setTextColor(...green);
    } else {
      pdf.setTextColor(...orange);
    }

    pdf.text(
      isFinalized
        ? "FINALIZED"
        : "DRAFT",
      rightX,
      infoY + 16
    );

    y += 48;

    // ========================================
    // SPECIMEN
    // ========================================

    addSectionTitle(
      "Specimen Details"
    );

    pdf.setFillColor(
      255,
      255,
      255
    );

    pdf.setDrawColor(
      225,
      225,
      225
    );

    pdf.roundedRect(
      margin,
      y,
      contentWidth,
      18,
      2,
      2,
      "FD"
    );

    pdf.setTextColor(...gray);

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(8);

    pdf.text(
      "SPECIMEN TYPE",
      margin + 5,
      y + 7
    );

    pdf.setTextColor(...dark);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(10);

    pdf.text(
      formData.specimenType ||
        "Not specified",
      margin + 5,
      y + 13
    );

    y += 26;

    // ========================================
    // CLINICAL HISTORY
    // ========================================

    addSectionTitle(
      "Clinical History"
    );

    addParagraph(
      formData.clinicalHistory
    );

    // ========================================
    // MICROSCOPIC FINDINGS
    // ========================================

    addSectionTitle(
      "Microscopic Findings"
    );

    addParagraph(
      formData.findings
    );

    // ========================================
    // DIAGNOSIS
    // ========================================

    addSectionTitle(
      "Diagnosis"
    );

    addParagraph(
      formData.diagnosis
    );

    // ========================================
    // FINALIZATION INFO
    // ========================================

    ensureSpace(25);

    pdf.setDrawColor(
      220,
      220,
      220
    );

    pdf.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 8;

    pdf.setTextColor(...gray);

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(8);

    const finalizationText =
      isFinalized
        ? `Finalized on ${
            report.finalizedAt
              ? new Date(
                  report.finalizedAt
                ).toLocaleString()
              : "Unknown date"
          }`
        : "This report is currently a draft.";

    pdf.text(
      finalizationText,
      margin,
      y
    );

    // ========================================
    // ADD FOOTERS
    // ========================================

    const totalPages =
      pdf.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      pdf.setPage(page);

      drawFooter(page);
    }

    // ========================================
    // FILE NAME
    // ========================================

    const patientName =
      patient?.name
        ?.replace(/\s+/g, "_")
        .replace(/[^\w-]/g, "") ??
      "Patient";

    pdf.save(
      `PathForge_${patientName}_Report_V${report.version}.pdf`
    );

    Swal.fire({
      icon: "success",
      title: "PDF Generated",
      text: "Your pathology report has been downloaded.",
      timer: 2200,
      showConfirmButton: false,
    });
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="report-editor-page">

      {/* ========================================
          EDITOR TOP BAR
      ======================================== */}

      <div className="editor-topbar print-hide">

        <div>

          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back to Worklist
          </button>

          <div className="report-title-row">

            <div>
              <h2>Report Editor</h2>

              <p>
                {patient?.name ??
                  "Unknown Patient"}{" "}
                ·{" "}
                {patient?.patientId ??
                  "Unknown ID"}
              </p>
            </div>

            <span
              className={`version-badge ${
                isFinalized
                  ? "finalized"
                  : "draft"
              }`}
            >
              Version {report.version}
            </span>

          </div>

          {isFinalized && (
            <div className="finalized-notice">

              <Lock size={16} />

              <span>
                This report is finalized and
                cannot be edited. Create an
                amendment to make changes.
              </span>

            </div>
          )}

        </div>

        <div className="editor-actions">

          <button
            className="secondary-button"
            onClick={handlePrint}
          >
            <Printer size={17} />
            Print
          </button>

          <button
            className="secondary-button"
            onClick={handleGeneratePDF}
          >
            <Download size={17} />
            Download PDF
          </button>

          {!isFinalized ? (
            <>

              <button
                className="secondary-button"
                onClick={saveChanges}
              >
                <Save size={17} />
                Save Changes
              </button>

              <button
                className="primary-button"
                onClick={finalizeReport}
              >
                <CheckCircle2 size={17} />
                Finalize Report
              </button>

            </>
          ) : (
            <button
              className="primary-button"
              onClick={
                handleCreateAmendment
              }
            >
              <GitBranchPlus size={17} />
              Create Amendment
            </button>
          )}

        </div>

      </div>

      {/* ========================================
          NORMAL EDITOR
      ======================================== */}

      <div
        className={`report-editor-card print-hide ${
          isFinalized
            ? "read-only"
            : ""
        }`}
      >

        {/* SPECIMEN */}

        <div className="editor-section">

          <div className="editor-section-title">

            <FileText size={19} />

            <div>
              <h3>
                Specimen Details
              </h3>

              <p>
                Basic information about
                the specimen
              </p>
            </div>

          </div>

          <div className="form-group">

            <label>
              Specimen Type
            </label>

            <input
              type="text"
              name="specimenType"
              value={
                formData.specimenType
              }
              onChange={handleChange}
              disabled={isFinalized}
              placeholder="Enter specimen type"
            />

          </div>

        </div>

        {/* CLINICAL HISTORY */}

        <div className="editor-section">

          <div className="editor-section-title">

            <FileText size={19} />

            <div>
              <h3>
                Clinical History
              </h3>

              <p>
                Relevant patient history
              </p>
            </div>

          </div>

          <textarea
            name="clinicalHistory"
            value={
              formData.clinicalHistory
            }
            onChange={handleChange}
            rows={4}
            disabled={isFinalized}
            placeholder="Enter clinical history"
          />

        </div>

        {/* FINDINGS */}

        <div className="editor-section">

          <div className="editor-section-title">

            <FileText size={19} />

            <div>
              <h3>
                Microscopic Findings
              </h3>

              <p>
                Detailed pathology
                observations
              </p>
            </div>

          </div>

          <textarea
            name="findings"
            value={formData.findings}
            onChange={handleChange}
            rows={7}
            disabled={isFinalized}
            placeholder="Enter microscopic findings"
          />

        </div>

        {/* DIAGNOSIS */}

        <div className="editor-section">

          <div className="editor-section-title">

            <FileText size={19} />

            <div>
              <h3>
                Diagnosis
              </h3>

              <p>
                Final pathological
                diagnosis
              </p>
            </div>

          </div>

          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            rows={5}
            disabled={isFinalized}
            placeholder="Enter final diagnosis"
          />

        </div>

      </div>

      {/* ========================================
          PRINT REPORT
          THIS IS WHAT WAS MISSING
      ======================================== */}

      <div className="print-report print-only">

        {/* HEADER */}

        <div className="print-header">

          <div>
            <h1>
              PathForge
            </h1>

            <p>
              Clinical Pathology Workspace
            </p>
          </div>

          <div className="print-report-meta">

            <strong>
              Pathology Report
            </strong>

            <span>
              Version {report.version}
            </span>

            <span>
              {isFinalized
                ? "Finalized"
                : "Draft"}
            </span>

          </div>

        </div>

        {/* PATIENT INFORMATION */}

        <div className="patient-print-info">

          <div>
            <span>
              Patient Name
            </span>

            <strong>
              {patient?.name ??
                "Unknown Patient"}
            </strong>
          </div>

          <div>
            <span>
              Patient ID
            </span>

            <strong>
              {patient?.patientId ??
                "Unknown ID"}
            </strong>
          </div>

          <div>
            <span>
              Report Version
            </span>

            <strong>
              Version {report.version}
            </strong>
          </div>

        </div>

        {/* SPECIMEN */}

        <section className="print-section">

          <h2>
            Specimen Details
          </h2>

          <div className="print-field">

            <span>
              Specimen Type
            </span>

            <p>
              {formData.specimenType ||
                "Not specified"}
            </p>

          </div>

        </section>

        {/* CLINICAL HISTORY */}

        <section className="print-section">

          <h2>
            Clinical History
          </h2>

          <p className="print-content">
            {formData.clinicalHistory ||
              "Not provided"}
          </p>

        </section>

        {/* FINDINGS */}

        <section className="print-section">

          <h2>
            Microscopic Findings
          </h2>

          <p className="print-content">
            {formData.findings ||
              "Not provided"}
          </p>

        </section>

        {/* DIAGNOSIS */}

        <section className="print-section diagnosis-print">

          <h2>
            Diagnosis
          </h2>

          <p className="print-content">
            {formData.diagnosis ||
              "Not provided"}
          </p>

        </section>

        {/* FINALIZATION */}

        <div className="print-finalization">

          <strong>
            Report Status:
          </strong>{" "}

          {isFinalized
            ? "Finalized"
            : "Draft"}

          {isFinalized &&
            report.finalizedAt && (
              <>
                <br />

                Finalized on{" "}

                {new Date(
                  report.finalizedAt
                ).toLocaleString()}
              </>
            )}

        </div>

        {/* FOOTER */}

        <div className="print-footer">

          <p>
            Generated by PathForge Clinical
            Pathology Workspace
          </p>

          <p>
            Generated on{" "}
            {new Date().toLocaleString()}
          </p>

        </div>

      </div>

    </div>
  );
}

export default ReportEditor;