import type { jsPDF } from "jspdf";
import { isTauri } from "@tauri-apps/api/core";

import type { ReportModel } from "./reportModel";

const NAVY: [number, number, number] = [31, 58, 95];
const INK: [number, number, number] = [26, 26, 26];
const MUTED: [number, number, number] = [90, 102, 115];
const HAIRLINE: [number, number, number] = [200, 206, 214];

const MARGIN = 16; // mm
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 12;

/**
 * Render a {@link ReportModel} to a jsPDF document. Content, order and wording
 * come from the model; this function only positions and styles it — the same
 * division of labour as {@link PrintableReport} for the print DOM.
 */
export async function buildReportPdf(model: ReportModel): Promise<jsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const need = (h: number) => {
    if (y + h > FOOTER_Y - 4) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // ---- letterhead ----
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...NAVY);
  doc.text(model.brand.name, MARGIN, y + 2);
  doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...MUTED);
  doc.text(model.brand.tagline.toUpperCase(), MARGIN, y + 7);
  doc.setFontSize(7).text(model.brand.strapline, MARGIN, y + 11);

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...NAVY);
  doc.text(model.documentTitle.toUpperCase(), PAGE_W - MARGIN, y, {
    align: "right",
  });
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...INK);
  doc.text(
    [
      `Report No.  ${model.reportNo}`,
      `Version  ${model.version}`,
      `Status  ${model.statusLabel}`,
    ],
    PAGE_W - MARGIN,
    y + 5,
    { align: "right" }
  );

  y += 15;
  doc.setDrawColor(...NAVY).setLineWidth(0.7).line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;

  if (model.draftNotice) {
    const lines = doc
      .setFont("helvetica", "bold")
      .setFontSize(8)
      .splitTextToSize(model.draftNotice, CONTENT_W - 6);
    const boxH = lines.length * 4 + 4;
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(194, 65, 12).setLineWidth(0.3);
    doc.rect(MARGIN, y, CONTENT_W, boxH, "FD");
    doc.setTextColor(154, 52, 18);
    doc.text(lines, MARGIN + 3, y + 4.5);
    y += boxH + 5;
  }

  // ---- patient / specimen band ----
  const bandRowH = 9;
  const rows = model.band.length;
  const bandH = bandRowH * Math.ceil(rows / 2);
  need(bandH);
  doc.setDrawColor(...HAIRLINE).setLineWidth(0.2);
  doc.rect(MARGIN, y, CONTENT_W, bandH);
  doc.line(MARGIN + CONTENT_W / 2, y, MARGIN + CONTENT_W / 2, y + bandH);
  model.band.forEach((entry, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cx = MARGIN + 3 + col * (CONTENT_W / 2);
    const cy = y + row * bandRowH;
    if (row > 0) doc.line(MARGIN, cy, MARGIN + CONTENT_W, cy);
    doc.setFont("helvetica", "bold").setFontSize(6.5).setTextColor(...MUTED);
    doc.text(entry.label.toUpperCase(), cx, cy + 3.5);
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...INK);
    doc.text(
      doc.splitTextToSize(entry.value, CONTENT_W / 2 - 8)[0] ?? entry.value,
      cx,
      cy + 7.5
    );
  });
  y += bandH + 8;

  const sectionHeading = (title: string) => {
    need(12);
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...NAVY);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 1.5;
    doc.setDrawColor(...NAVY).setLineWidth(0.3).line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;
  };

  const paragraph = (text: string, emphasis: boolean) => {
    doc
      .setFont("helvetica", emphasis ? "bold" : "normal")
      .setFontSize(emphasis ? 10 : 9.5)
      .setTextColor(...INK);
    for (const line of doc.splitTextToSize(text, CONTENT_W)) {
      need(6);
      doc.text(line, MARGIN, y);
      y += 5;
    }
    y += 5;
  };

  // ---- results, grouped by test ----
  const cols = [MARGIN, MARGIN + 74, MARGIN + 108, MARGIN + 134];

  const drawResultsHeader = () => {
    need(8);
    doc.setFont("helvetica", "bold").setFontSize(7).setTextColor(...MUTED);
    ["PARAMETER", "RESULT", "UNIT", "REFERENCE RANGE"].forEach((label, i) =>
      doc.text(label, cols[i] ?? MARGIN, y + 3)
    );
    y += 4.5;
    doc.setDrawColor(...NAVY).setLineWidth(0.4).line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 3.5;
  };

  if (model.resultGroups.length > 0) {
    sectionHeading(model.resultsHeading);

    for (const group of model.resultGroups) {
      if (model.showGroupHeadings && group.testName) {
        need(10);
        doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...INK);
        doc.text(group.testName, MARGIN, y + 3);
        y += 6;
      }

      drawResultsHeader();

      for (const row of group.rows) {
        const nameLines = doc.splitTextToSize(row.name, 70);
        const rowH = Math.max(5.5, nameLines.length * 4);
        if (y + rowH + 2 > FOOTER_Y - 4) {
          doc.addPage();
          y = MARGIN;
          drawResultsHeader();
        }
        doc
          .setFont("helvetica", "normal")
          .setFontSize(8.5)
          .setTextColor(...INK)
          .text(nameLines, cols[0] ?? MARGIN, y + 3);
        doc.setFont("helvetica", "bold");
        doc.text(row.value, cols[1] ?? MARGIN, y + 3);
        doc.setFont("helvetica", "normal");
        doc.text(row.unit, cols[2] ?? MARGIN, y + 3);
        doc.text(row.reference, cols[3] ?? MARGIN, y + 3);
        y += rowH;
        doc
          .setDrawColor(...HAIRLINE)
          .setLineWidth(0.15)
          .line(MARGIN, y, PAGE_W - MARGIN, y);
        y += 2;
      }
      y += 4;
    }
  }

  for (const narrative of model.narratives) {
    sectionHeading(narrative.heading);
    paragraph(narrative.body, narrative.emphasis);
  }

  // ---- sign-off ----
  need(30);
  y += 6;
  const sigW = (CONTENT_W - 16) / 2;
  model.signoff.forEach((entry, i) => {
    const x = MARGIN + i * (sigW + 16);
    doc.setDrawColor(...INK).setLineWidth(0.2).line(x, y, x + sigW, y);
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...INK);
    doc.text(entry.role, x, y + 4);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...MUTED);
    doc.text(doc.splitTextToSize(entry.note, sigW), x, y + 8);
  });
  y += 16;

  doc.setFont("helvetica", "italic").setFontSize(7.5).setTextColor(...MUTED);
  doc.text(doc.splitTextToSize(model.authorisationNote, CONTENT_W), MARGIN, y);
  y += 8;
  need(6);
  doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...MUTED);
  doc.text(model.endOfReport, PAGE_W / 2, y, { align: "center" });

  // ---- footer on every page ----
  const generatedAt = model.generatedAt;
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...HAIRLINE).setLineWidth(0.15);
    doc.line(MARGIN, FOOTER_Y, PAGE_W - MARGIN, FOOTER_Y);
    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...MUTED);
    doc.text(model.footer.reference, MARGIN, FOOTER_Y + 4);
    doc.text(`Generated ${generatedAt}`, PAGE_W - MARGIN, FOOTER_Y + 4, {
      align: "right",
    });
    doc.text(`Page ${page} of ${pages}`, PAGE_W / 2, FOOTER_Y + 4, {
      align: "center",
    });
  }

  return doc;
}

/**
 * Save the report PDF to disk, prompting for a location.
 * - Tauri: native save dialog + filesystem write.
 * - Browser with File System Access API: native "Save As" picker.
 * - Otherwise: falls back to a normal download into the Downloads folder.
 */
export async function downloadReportPdf(model: ReportModel): Promise<void> {
  const doc = await buildReportPdf(model);
  const fileName = `${model.fileBaseName}.pdf`;
  const bytes = doc.output("arraybuffer");

  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    const path = await save({
      defaultPath: fileName,
      filters: [{ name: "PDF document", extensions: ["pdf"] }],
    });
    if (!path) return; // user cancelled

    // Let a write failure (e.g. a path outside the fs capability scope) reach
    // the caller. Falling back to doc.save() here would be a silent no-op:
    // browser downloads cannot start inside the Tauri webview.
    await writeFile(path, new Uint8Array(bytes));
    return;
  }

  const picker = (
    window as unknown as {
      showSaveFilePicker?: (options: unknown) => Promise<{
        createWritable: () => Promise<{
          write: (data: BufferSource) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    }
  ).showSaveFilePicker;

  if (typeof picker === "function") {
    try {
      const handle = await picker({
        suggestedName: fileName,
        types: [
          {
            description: "PDF document",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(bytes);
      await writable.close();
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // fall through to plain download
    }
  }

  doc.save(fileName);
}
