import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export const PrintService = {
  // Direct Browser Print
  printCurrent(): void {
    window.print();
  },

  // Export any HTML element to high-res PNG
  async downloadElementAsPng(element: HTMLElement, filename: string): Promise<void> {
    const canvas = await html2canvas(element, {
      scale: 3, // 300 DPI high clarity
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const link = document.createElement('a');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  },

  // Export Single ID-1 Card to exact 85.6mm x 53.98mm PDF
  async downloadSingleCardPdf(element: HTMLElement, filename: string): Promise<void> {
    const canvas = await html2canvas(element, {
      scale: 3.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    // ID-1 standard landscape: 85.6mm x 53.98mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98, undefined, 'FAST');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  },

  // Export Sheet with multiple pages to PDF (Supports A4: 210x297mm and F4/Folio: 215x330mm)
  async downloadSheetPdf(
    containerElement: HTMLElement,
    filename: string,
    paperSize: 'A4' | 'F4' = 'A4',
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const pageElements = Array.from(
      containerElement.querySelectorAll<HTMLElement>('.a4-sheet-page, .sheet-page')
    );
    const targets = pageElements.length > 0 ? pageElements : [containerElement];

    const isF4 = paperSize === 'F4';
    const pageWidthMm = isF4 ? 215 : 210;
    const pageHeightMm = isF4 ? 330 : 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isF4 ? [215, 330] : 'a4',
      compress: true,
    });

    for (let i = 0; i < targets.length; i++) {
      if (onProgress) {
        onProgress(i + 1, targets.length);
      }
      const pageEl = targets[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      if (i > 0) {
        pdf.addPage(isF4 ? [215, 330] : 'a4', 'portrait');
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
    }

    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeName);
  },

  // Backward compatibility alias for A4 sheet export
  async downloadA4SheetPdf(
    containerElement: HTMLElement,
    filename: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    return this.downloadSheetPdf(containerElement, filename, 'A4', onProgress);
  },
};
