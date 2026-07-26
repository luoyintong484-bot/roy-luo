/* ============================================================
   R7 Fortune — Shared PDF Export Utility
   Captures a DOM element as a multi-page A4 PDF.
   - Expands all collapsed <details> before capture
   - Restores original state after
   - Lazy-loads html2canvas + jspdf (zero impact on first paint)
   ============================================================ */

export async function exportReportPDF(
  element: HTMLElement,
  filename: string,
  backgroundColor = "#fffaf0",
): Promise<void> {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  // ---- Expand all collapsed <details> so PDF captures everything ----
  const details = Array.from(element.querySelectorAll("details"));
  const wasOpen: boolean[] = [];
  details.forEach((d) => {
    wasOpen.push(d.open);
    d.setAttribute("open", "");
    (d as unknown as { open: boolean }).open = true;
  });

  // Wait for layout to settle (multiple frames + a short delay) so the
  // expanded content is actually laid out before html2canvas captures it.
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  await new Promise<void>((r) => setTimeout(r, 120));

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = 210;
    const pdfH = 297;
    const imgW = pdfW;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pdfH;

    while (heightLeft > 0) {
      position -= pdfH;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pdfH;
    }

    pdf.save(filename);
  } finally {
    // ---- Restore original collapsed state ----
    details.forEach((d, i) => {
      d.open = wasOpen[i];
    });
  }
}
