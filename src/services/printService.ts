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

  // Export A4 Sheet with multiple pages (8 or 10 cards per A4 page) to multi-page A4 PDF
  async downloadA4SheetPdf(
    containerElement: HTMLElement,
    filename: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    // Find all individual A4 page elements inside container
    const pageElements = Array.from(
      containerElement.querySelectorAll<HTMLElement>('.a4-sheet-page')
    );
    const targets = pageElements.length > 0 ? pageElements : [containerElement];

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
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
        pdf.addPage('a4', 'portrait');
      }
      // A4 width: 210mm, height: 297mm
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  },
};
