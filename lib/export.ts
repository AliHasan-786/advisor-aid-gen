import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AuditSnapshot, BriefRecord, FiltersState } from "@/lib/types";

export function createAuditSnapshot(
  briefs: BriefRecord[],
  filters: FiltersState,
  microLessonStats: { assigned: number; completed: number }
): AuditSnapshot {
  const sortedByTopicCount = Object.entries(
    briefs.reduce<Record<string, number>>((acc, brief) => {
      brief.topics.forEach((topic) => {
        acc[topic] = (acc[topic] ?? 0) + 1;
      });
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);

  const sortedWeak = Object.entries(
    briefs.reduce<Record<string, number>>((acc, brief) => {
      brief.weakTopics.forEach((topic) => {
        acc[topic] = (acc[topic] ?? 0) + (100 - brief.complianceIQ);
      });
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);

  const lowPerformers = briefs
    .slice()
    .sort((a, b) => a.complianceIQ - b.complianceIQ)
    .slice(0, Math.max(3, Math.floor(briefs.length * 0.1)))
    .map((brief) => ({ advisor: brief.advisor.name, office: brief.office, iq: brief.complianceIQ }));

  const sampleRedlines = briefs
    .filter((brief) => brief.flags.length)
    .slice(0, 5)
    .map((brief) => ({
      advisor: brief.advisor.name,
      before: brief.flags[0]?.text ?? "",
      after: brief.flags[0]?.fix ?? ""
    }));

  return {
    generatedAt: new Date().toISOString(),
    filters,
    topTopics: sortedByTopicCount.slice(0, 5),
    topWeakTopics: sortedWeak.slice(0, 5),
    lowPerformers,
    microLessonCounts: microLessonStats,
    sampleRedlines
  };
}

export async function createAuditPdf(snapshot: AuditSnapshot): Promise<Blob> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const margin = 40;
  let y = 750;

  const drawLine = (text: string, size = 12) => {
    page.drawText(text, {
      x: margin,
      y,
      size,
      font,
      color: rgb(0.1, 0.14, 0.2)
    });
    y -= size + 6;
  };

  drawLine("Mindshare Map — Audit Summary", 18, true);
  drawLine(`Generated: ${new Date(snapshot.generatedAt).toLocaleString()}`);
  drawLine("");

  drawLine("Filters active:", 14, true);
  drawLine(`Offices: ${snapshot.filters.offices.join(", ") || "All"}`);
  drawLine(`Products: ${snapshot.filters.products.join(", ") || "All"}`);
  drawLine(`Risk Bands: ${snapshot.filters.risks.join(", ") || "All"}`);
  drawLine(`Advisor Tenure: ${snapshot.filters.tenure.join(", ") || "All"}`);
  drawLine(`Compliance IQ Range: ${snapshot.filters.complianceRange.join("–")}`);
  drawLine(`Search: ${snapshot.filters.searchTerm || "(none)"}`);
  drawLine("");

  drawLine("Top Topics by Volume", 14, true);
  snapshot.topTopics.forEach((topic, idx) => drawLine(`${idx + 1}. ${topic}`));
  drawLine("");

  drawLine("Top Weak Topics by IQ Gap", 14, true);
  snapshot.topWeakTopics.forEach((topic, idx) => drawLine(`${idx + 1}. ${topic}`));
  drawLine("");

  drawLine("Lowest Compliance IQ Advisors", 14, true);
  snapshot.lowPerformers.forEach((item) => drawLine(`${item.advisor} (${item.office}) — IQ ${item.iq}`));
  drawLine("");

  drawLine("Micro-Lesson Activity", 14, true);
  drawLine(`Assigned: ${snapshot.microLessonCounts.assigned}`);
  drawLine(`Completed: ${snapshot.microLessonCounts.completed}`);
  drawLine("");

  drawLine("Sample Redlines", 14, true);
  snapshot.sampleRedlines.forEach((item) => {
    drawLine(`${item.advisor}: ${item.before} → ${item.after}`);
  });

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
