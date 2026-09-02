import { jsPDF } from 'jspdf';
import { Project, ContentBlock } from '../types';

/**
 * Strips HTML tags from text for clean plain-text PDF rendering
 */
function stripHtml(html: string = ''): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Generates and downloads a clean, beautifully formatted PDF for a given case study
 */
export async function exportProjectToPdf(project: Project): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 45;
  const contentWidth = pageWidth - marginX * 2;
  const bottomMargin = 55;
  const topMargin = 50;

  let y = topMargin;

  // Helper to ensure page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = topMargin + 15;
    }
  };

  // --- 1. COVER / HEADER SECTION ---
  // Category & Status Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(155, 15, 6); // #9B0F06
  const metaCategory = `${(project.category || 'PRODUCT').toUpperCase()} · ${(project.project_type || 'Case Study').toUpperCase()}`;
  doc.text(metaCategory, marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(111, 105, 101); // #6F6965
  const statusYear = `${project.status || 'DRAFT'} · ${project.year || new Date().getFullYear()}`;
  doc.text(statusYear, pageWidth - marginX, y, { align: 'right' });

  y += 18;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(23, 21, 20); // #171514
  const titleLines = doc.splitTextToSize(project.title, contentWidth);
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 26 + 4;

  // Short Description / Overview
  if (project.short_description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(70, 65, 62);
    const descLines = doc.splitTextToSize(project.short_description, contentWidth);
    doc.text(descLines, marginX, y);
    y += descLines.length * 16 + 12;
  }

  // --- 2. METADATA SUMMARY CARD ---
  checkPageBreak(90);
  const cardY = y;
  const cardPadding = 12;
  const colWidth = contentWidth / 4;

  // Background rect for metadata
  doc.setFillColor(247, 244, 240); // #F7F4F0
  doc.setDrawColor(232, 227, 221); // #E8E3DD
  doc.roundedRect(marginX, cardY, contentWidth, 54, 4, 4, 'FD');

  const metaFields = [
    { label: 'ROLE', value: project.role || 'Lead Designer' },
    { label: 'CLIENT / ORG', value: project.organization || project.client || 'Confidential' },
    { label: 'DURATION', value: project.duration || '3 Months' },
    { label: 'YEAR', value: project.year || '2026' },
  ];

  metaFields.forEach((field, i) => {
    const colX = marginX + cardPadding + i * colWidth;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(111, 105, 101);
    doc.text(field.label, colX, cardY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(23, 21, 20);
    const valText = doc.splitTextToSize(field.value, colWidth - 14);
    doc.text(valText[0] || '', colX, cardY + 32);
  });

  y = cardY + 68;

  // Impact Metrics Bar (if available)
  if (project.impact_metrics && project.impact_metrics.length > 0) {
    checkPageBreak(65);
    const metricCount = Math.min(project.impact_metrics.length, 4);
    const metricColWidth = contentWidth / metricCount;
    const metricCardY = y;

    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(232, 227, 221);
    doc.roundedRect(marginX, metricCardY, contentWidth, 52, 4, 4, 'FD');

    project.impact_metrics.slice(0, 4).forEach((m, idx) => {
      const mx = marginX + 10 + idx * metricColWidth;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(155, 15, 6);
      doc.text(m.value, mx, metricCardY + 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(111, 105, 101);
      const labelLines = doc.splitTextToSize(m.label, metricColWidth - 16);
      doc.text(labelLines[0] || '', mx, metricCardY + 38);
    });

    y = metricCardY + 66;
  }

  // Tags & Deliverables Summary
  if ((project.tags && project.tags.length > 0) || (project.deliverables && project.deliverables.length > 0)) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(111, 105, 101);

    const deliverablesText = project.deliverables?.length ? `Deliverables: ${project.deliverables.join(', ')}` : '';
    const tagsText = project.tags?.length ? `Tags: ${project.tags.map((t) => `#${t}`).join(' ')}` : '';
    const combined = [deliverablesText, tagsText].filter(Boolean).join('  |  ');

    if (combined) {
      const lines = doc.splitTextToSize(combined, contentWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 12 + 10;
    }
  }

  // Divider before main content blocks
  doc.setDrawColor(232, 227, 221);
  doc.setLineWidth(0.75);
  doc.line(marginX, y, marginX + contentWidth, y);
  y += 18;

  // --- 3. STRUCTURED CONTENT BLOCKS ---
  const blocks = project.content_json || [];

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const text = stripHtml(block.text || 'Section');
        const level = block.level || 2;
        const fontSize = level === 1 ? 16 : level === 2 ? 13 : 11;
        const topSpacing = level === 1 ? 22 : 16;

        checkPageBreak(fontSize * 2 + topSpacing);
        y += topSpacing;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontSize);
        doc.setTextColor(23, 21, 20);

        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, marginX, y);
        y += lines.length * (fontSize + 4) + 4;

        if (level === 1) {
          doc.setDrawColor(155, 15, 6);
          doc.setLineWidth(1.5);
          doc.line(marginX, y, marginX + 36, y);
          y += 10;
        }
        break;
      }

      case 'paragraph': {
        const text = stripHtml(block.text || '');
        if (!text) break;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(44, 38, 35); // #2C2623

        const lines = doc.splitTextToSize(text, contentWidth);
        const blockHeight = lines.length * 14 + 6;

        checkPageBreak(Math.min(blockHeight, 80));
        doc.text(lines, marginX, y);
        y += blockHeight;
        break;
      }

      case 'callout': {
        const title = stripHtml(block.title || 'Note');
        const text = stripHtml(block.text || '');
        const type = (block.calloutType || 'insight').toUpperCase();

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const textLines = doc.splitTextToSize(text, contentWidth - 28);
        const boxHeight = 28 + textLines.length * 13 + 8;

        checkPageBreak(boxHeight + 8);

        // Box background
        doc.setFillColor(247, 244, 240);
        doc.setDrawColor(232, 227, 221);
        doc.roundedRect(marginX, y, contentWidth, boxHeight, 3, 3, 'FD');

        // Left accent border
        doc.setFillColor(155, 15, 6);
        doc.rect(marginX, y, 4, boxHeight, 'F');

        // Type + Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(155, 15, 6);
        doc.text(`[${type}] ${title}`, marginX + 14, y + 16);

        // Callout Text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(44, 38, 35);
        doc.text(textLines, marginX + 14, y + 30);

        y += boxHeight + 12;
        break;
      }

      case 'quote': {
        const quoteText = `"${stripHtml(block.text || '')}"`;
        const author = block.author || 'Aththar';
        const role = block.role || 'Product Designer';

        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(10);
        const quoteLines = doc.splitTextToSize(quoteText, contentWidth - 24);
        const boxHeight = quoteLines.length * 14 + 26;

        checkPageBreak(boxHeight + 8);

        // Vertical quote bar
        doc.setDrawColor(155, 15, 6);
        doc.setLineWidth(2.5);
        doc.line(marginX + 4, y + 2, marginX + 4, y + boxHeight - 6);

        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(10);
        doc.setTextColor(44, 38, 35);
        doc.text(quoteLines, marginX + 16, y + 12);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(111, 105, 101);
        doc.text(`— ${author}, ${role}`, marginX + 16, y + boxHeight - 6);

        y += boxHeight + 10;
        break;
      }

      case 'keyMetric': {
        const val = block.metricValue || '100%';
        const label = block.metricLabel || 'Metric Label';
        const ctx = block.metricContext || '';

        checkPageBreak(60);

        doc.setFillColor(250, 248, 245);
        doc.setDrawColor(232, 227, 221);
        doc.roundedRect(marginX, y, contentWidth, 50, 4, 4, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(155, 15, 6);
        doc.text(val, marginX + 14, y + 22);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(23, 21, 20);
        doc.text(label, marginX + 14, y + 36);

        if (ctx) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(111, 105, 101);
          doc.text(ctx, marginX + 14, y + 46);
        }

        y += 60;
        break;
      }

      case 'columns': {
        const leftTitle = stripHtml(block.leftTitle || 'Before');
        const leftText = stripHtml(block.leftText || '');
        const rightTitle = stripHtml(block.rightTitle || 'After');
        const rightText = stripHtml(block.rightText || '');

        const colW = (contentWidth - 16) / 2;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const lLines = doc.splitTextToSize(leftText, colW - 16);
        const rLines = doc.splitTextToSize(rightText, colW - 16);
        const maxLines = Math.max(lLines.length, rLines.length);
        const boxH = 26 + maxLines * 12 + 10;

        checkPageBreak(boxH + 8);

        // Left box
        doc.setFillColor(247, 244, 240);
        doc.setDrawColor(232, 227, 221);
        doc.roundedRect(marginX, y, colW, boxH, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(155, 15, 6);
        doc.text(leftTitle, marginX + 10, y + 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(44, 38, 35);
        doc.text(lLines, marginX + 10, y + 28);

        // Right box
        const rx = marginX + colW + 16;
        doc.setFillColor(247, 244, 240);
        doc.setDrawColor(232, 227, 221);
        doc.roundedRect(rx, y, colW, boxH, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(155, 15, 6);
        doc.text(rightTitle, rx + 10, y + 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(44, 38, 35);
        doc.text(rLines, rx + 10, y + 28);

        y += boxH + 12;
        break;
      }

      case 'userFlow': {
        const steps = block.flowSteps || [];
        if (!steps.length) break;

        checkPageBreak(40 + steps.length * 28);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(23, 21, 20);
        doc.text('USER FLOW & PROCESS STEPS', marginX, y);
        y += 14;

        steps.forEach((st) => {
          checkPageBreak(28);
          // Step circle badge
          doc.setFillColor(155, 15, 6);
          doc.circle(marginX + 8, y + 4, 7, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.text(st.step, marginX + 8, y + 6.5, { align: 'center' });

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(23, 21, 20);
          doc.text(st.title, marginX + 22, y + 6);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(111, 105, 101);
          const descLines = doc.splitTextToSize(st.description, contentWidth - 26);
          doc.text(descLines, marginX + 22, y + 16);

          y += 18 + descLines.length * 10;
        });

        y += 8;
        break;
      }

      case 'table': {
        const headers = block.headers || ['Key', 'Value'];
        const rows = block.rows || [];
        const caption = block.caption;

        if (caption) {
          checkPageBreak(20);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(111, 105, 101);
          doc.text(`TABLE: ${caption}`, marginX, y);
          y += 12;
        }

        const colWidth = contentWidth / headers.length;
        const rowHeight = 18;

        checkPageBreak(rowHeight * (rows.length + 1) + 10);

        // Header Row
        doc.setFillColor(232, 227, 221);
        doc.rect(marginX, y, contentWidth, rowHeight, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(23, 21, 20);

        headers.forEach((h, colIdx) => {
          doc.text(h, marginX + 6 + colIdx * colWidth, y + 12);
        });

        y += rowHeight;

        // Data Rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(44, 38, 35);

        rows.forEach((row, rowIdx) => {
          checkPageBreak(rowHeight);

          if (rowIdx % 2 === 1) {
            doc.setFillColor(247, 244, 240);
            doc.rect(marginX, y, contentWidth, rowHeight, 'F');
          }

          doc.setDrawColor(232, 227, 221);
          doc.line(marginX, y + rowHeight, marginX + contentWidth, y + rowHeight);

          row.forEach((cell, cellIdx) => {
            if (cellIdx < headers.length) {
              const truncated = doc.splitTextToSize(cell || '', colWidth - 10)[0] || '';
              doc.text(truncated, marginX + 6 + cellIdx * colWidth, y + 12);
            }
          });

          y += rowHeight;
        });

        y += 12;
        break;
      }

      case 'code': {
        const code = block.code || '';
        const lang = (block.language || 'code').toUpperCase();

        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        const lines = doc.splitTextToSize(code, contentWidth - 20);
        const boxH = 22 + lines.length * 10;

        checkPageBreak(boxH + 8);

        doc.setFillColor(23, 21, 20);
        doc.roundedRect(marginX, y, contentWidth, boxH, 3, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(155, 15, 6);
        doc.text(`[${lang}]`, marginX + 10, y + 12);

        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(240, 235, 230);
        doc.text(lines, marginX + 10, y + 22);

        y += boxH + 12;
        break;
      }

      case 'image': {
        const caption = block.caption || block.alt || 'Visual Artifact';
        const url = block.url || '';

        checkPageBreak(40);

        doc.setFillColor(247, 244, 240);
        doc.setDrawColor(232, 227, 221);
        doc.roundedRect(marginX, y, contentWidth, 32, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(155, 15, 6);
        doc.text('[VISUAL ASSET REFERENCE]', marginX + 10, y + 13);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(44, 38, 35);
        doc.text(caption, marginX + 10, y + 24);

        if (url && !url.startsWith('data:')) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(111, 105, 101);
          const shortUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
          doc.text(shortUrl, pageWidth - marginX - 10, y + 24, { align: 'right' });
        }

        y += 40;
        break;
      }

      case 'link': {
        const text = block.linkText || 'Resource Link';
        const url = block.linkUrl || '';
        const desc = block.linkDescription || '';

        checkPageBreak(36);

        doc.setFillColor(247, 244, 240);
        doc.setDrawColor(232, 227, 221);
        doc.roundedRect(marginX, y, contentWidth, 30, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(155, 15, 6);
        doc.text(`[LINK] ${text}`, marginX + 10, y + 13);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(111, 105, 101);
        doc.text(desc || url, marginX + 10, y + 23);

        y += 38;
        break;
      }

      case 'divider': {
        checkPageBreak(16);
        doc.setDrawColor(232, 227, 221);
        doc.setLineWidth(0.5);
        doc.line(marginX, y + 4, marginX + contentWidth, y + 4);
        y += 14;
        break;
      }
    }
  }

  // --- 4. RUNNING HEADERS & FOOTERS ACROSS ALL PAGES ---
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top Running Header (Pages 2+)
    if (i > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(111, 105, 101);
      doc.text('ATHAR — PORTFOLIO CASE STUDY', marginX, 28);
      doc.text(project.title.substring(0, 40), pageWidth - marginX, 28, { align: 'right' });

      doc.setDrawColor(232, 227, 221);
      doc.setLineWidth(0.5);
      doc.line(marginX, 33, pageWidth - marginX, 33);
    }

    // Bottom Running Footer (All Pages)
    doc.setDrawColor(232, 227, 221);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageHeight - 34, pageWidth - marginX, pageHeight - 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(111, 105, 101);
    doc.text('CONFIDENTIAL · PREPARED VIA ADMIN CONSOLE', marginX, pageHeight - 20);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 20, { align: 'right' });
  }

  // Generate clean filename
  const cleanSlug = (project.slug || project.title || 'case-study')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  doc.save(`${cleanSlug}-case-study.pdf`);
}
