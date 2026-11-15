import type { jsPDF } from "jspdf";
import type { ProjectReport, ReportTable } from "./report";

const MARGIN = 48;
const LINE = 16;
// Column x positions on an A4 page in points: label, then two right-aligned numbers
const COLUMNS = [MARGIN, 400, 547];
const PRIMARY: [number, number, number] = [31, 79, 216];

type Cursor = { doc: jsPDF; y: number };

function ensureRoom(cursor: Cursor, needed: number) {
  if (cursor.y + needed <= cursor.doc.internal.pageSize.getHeight() - MARGIN) return;
  cursor.doc.addPage();
  cursor.y = MARGIN;
}

function row(cursor: Cursor, cells: string[], bold = false) {
  ensureRoom(cursor, LINE);
  cursor.doc.setFont("helvetica", bold ? "bold" : "normal");
  cursor.doc.text(cells[0], COLUMNS[0], cursor.y, { maxWidth: COLUMNS[1] - COLUMNS[0] - 90 });
  cells.slice(1).forEach((cell, index) => cursor.doc.text(cell, COLUMNS[index + 1], cursor.y, { align: "right" }));
  cursor.y += LINE;
}

function heading(cursor: Cursor, text: string) {
  ensureRoom(cursor, LINE * 3);
  cursor.y += LINE / 2;
  cursor.doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(...PRIMARY);
  cursor.doc.text(text, MARGIN, cursor.y);
  cursor.doc.setFontSize(10).setTextColor(27, 28, 26);
  cursor.y += LINE * 1.25;
}

function table(cursor: Cursor, data: ReportTable) {
  heading(cursor, data.title);
  if (data.rows.length === 0) return row(cursor, ["Nothing to buy this week: labor only."]);
  row(cursor, data.columns, true);
  data.rows.forEach((cells) => row(cursor, cells));
  if (data.total) row(cursor, ["Total", "", data.total], true);
}

// jsPDF is loaded only when the user asks for the file, so the workspace does not pay for it on every visit
export async function downloadReportPdf(report: ProjectReport): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const cursor: Cursor = { doc, y: MARGIN };
  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...PRIMARY).text(report.title, MARGIN, cursor.y + 8);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(67, 70, 85).text(`ObraKadabra project summary · ${report.subtitle}`, MARGIN, cursor.y + 28);
  cursor.y += 52;
  heading(cursor, "Summary");
  report.facts.forEach(([label, value]) => row(cursor, [label, "", value]));
  report.tables.forEach((data) => table(cursor, data));
  doc.save(report.fileName);
}
