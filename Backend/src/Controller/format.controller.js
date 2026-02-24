/**
 * ============================================================
 *  FORMAT CONVERTER CONTROLLER
 *  All conversion logic is here.
 *  Supports:
 *    PDF  ↔ Word (.docx)
 *    PDF  ↔ Excel (.xlsx)
 *    PDF  ↔ PowerPoint (.pptx)
 *    Office Files ↔ HTML
 *    Office Files ↔ XML
 *    Office Files ↔ OpenDocument (ODT / ODS / ODP)
 * ============================================================
 */

const path = require('path');
const fs   = require('fs');
const { v4: uuidv4 } = require('uuid');

// ─── Third-party libraries ─────────────────────────────────────────────────────
const mammoth   = require('mammoth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const XLSX      = require('xlsx');
const PptxGenJS = require('pptxgenjs');
const xml2js    = require('xml2js');
const js2xml    = require('js2xmlparser');
const cheerio   = require('cheerio');

// ─── docx library (proper Word files) ─────────────────────────────────────────
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType,
} = require('docx');

const CONVERTED_DIR = path.join(__dirname, '..', 'converted');
if (!fs.existsSync(CONVERTED_DIR)) fs.mkdirSync(CONVERTED_DIR, { recursive: true });

// ══════════════════════════════════════════════════════════════════════════════
//  FORMAT ALIAS MAP
// ══════════════════════════════════════════════════════════════════════════════

const FORMAT_ALIASES = {
  'word'                      : 'docx',
  'excel'                     : 'xlsx',
  'powerpoint'                : 'pptx',
  'opendocument'              : 'odt',
  'open document'             : 'odt',
  'opendocument text'         : 'odt',
  'opendocument spreadsheet'  : 'ods',
  'opendocument presentation' : 'odp',
  'doc'  : 'docx',
  'xls'  : 'xlsx',
  'ppt'  : 'pptx',
  'htm'  : 'html',
  'pdf'  : 'pdf',
  'docx' : 'docx',
  'xlsx' : 'xlsx',
  'pptx' : 'pptx',
  'html' : 'html',
  'xml'  : 'xml',
  'odt'  : 'odt',
  'ods'  : 'ods',
  'odp'  : 'odp',
};

function resolveFormat(raw) {
  const cleaned = (raw || '').toLowerCase().trim().replace(/^\./, '');
  return FORMAT_ALIASES[cleaned] || cleaned;
}

// ══════════════════════════════════════════════════════════════════════════════
//  HELPER UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

function saveConverted(buffer, extension) {
  const filename = `${uuidv4()}.${extension}`;
  const filepath = path.join(CONVERTED_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return { filename, filepath };
}

function readFile(filePath) {
  return fs.readFileSync(filePath);
}

function getExtension(filePath) {
  return path.extname(filePath).toLowerCase().replace('.', '');
}

function wrapHtml(body, title = 'Converted Document') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f4f4f4; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

/**
 * Build a proper valid DOCX from plain text lines using the `docx` library.
 * This produces files that Microsoft Word opens WITHOUT any warnings.
 */
async function buildDocxFromLines(lines, title = 'Converted Document') {
  const children = [];

  // Title paragraph
  children.push(
    new Paragraph({
      text    : title,
      heading : HeadingLevel.HEADING_1,
      spacing : { after: 200 },
    })
  );

  for (const line of lines) {
    const trimmed = (line || '').trim();
    children.push(
      new Paragraph({
        children: [new TextRun({ text: trimmed, size: 22 })], // 11pt = 22 half-points
        spacing : { after: 80 },
      })
    );
  }

  const doc    = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Build a proper valid DOCX from HTML-extracted content (headings + paragraphs).
 */
async function buildDocxFromHtml(htmlStr, docTitle = 'Converted Document') {
  const $        = cheerio.load(htmlStr);
  const children = [];

  // Document title
  children.push(
    new Paragraph({
      text    : docTitle,
      heading : HeadingLevel.HEADING_1,
      spacing : { after: 240 },
    })
  );

  // Walk through all block elements in order
  $('h1, h2, h3, h4, h5, h6, p, li, pre').each((_, el) => {
    const tag  = el.name;
    const text = $(el).text().trim();
    if (!text) return;

    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1]);
      const headingMap = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };
      children.push(
        new Paragraph({
          text    : text,
          heading : headingMap[level] || HeadingLevel.HEADING_2,
          spacing : { before: 200, after: 100 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun({ text, size: 22 })],
          spacing : { after: 80 },
        })
      );
    }
  });

  if (children.length <= 1) {
    // Fallback: just dump all text
    const text = $.text();
    text.split('\n').filter((l) => l.trim()).forEach((line) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line.trim(), size: 22 })],
          spacing : { after: 80 },
        })
      );
    });
  }

  const doc    = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Build a DOCX with table rows from a 2D array.
 */
async function buildDocxFromTable(sheetName, rows2D) {
  const children = [];

  children.push(
    new Paragraph({
      text    : sheetName,
      heading : HeadingLevel.HEADING_2,
      spacing : { after: 200 },
    })
  );

  if (rows2D.length > 0) {
    const tableRows = rows2D.map((row, rowIdx) =>
      new TableRow({
        children: (row || []).map((cell) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: String(cell ?? ''),
                    bold: rowIdx === 0,
                    size: 20,
                  }),
                ],
              }),
            ],
            width: { size: 2000, type: WidthType.DXA },
          })
        ),
      })
    );

    children.push(
      new Table({
        rows  : tableRows,
        width : { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  const doc    = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERTERS: PDF → OTHER
// ══════════════════════════════════════════════════════════════════════════════

async function pdfToDocx(inputPath) {
  const pdfParse = require('pdf-parse');
  const data     = await pdfParse(readFile(inputPath));
  const lines    = data.text.split('\n');
  const buffer   = await buildDocxFromLines(lines, 'Converted from PDF');
  return saveConverted(buffer, 'docx');
}

async function pdfToXlsx(inputPath) {
  const pdfParse = require('pdf-parse');
  const data     = await pdfParse(readFile(inputPath));

  const lines = data.text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => [l]);

  const ws = XLSX.utils.aoa_to_sheet([['Extracted Text'], ...lines]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PDF Data');

  return saveConverted(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }), 'xlsx');
}

async function pdfToPptx(inputPath) {
  const pdfParse = require('pdf-parse');
  const data     = await pdfParse(readFile(inputPath));
  const pptx     = new PptxGenJS();
  const chunks   = data.text.match(/.{1,800}/gs) || [data.text];

  chunks.forEach((chunk, i) => {
    const slide = pptx.addSlide();
    slide.addText(`Page ${i + 1}`, { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 22, bold: true, color: '363636' });
    slide.addText(chunk.trim(), { x: 0.5, y: 1.2, w: 9, h: 5, fontSize: 12, color: '444444', wrap: true });
  });

  const tempPath = path.join(CONVERTED_DIR, `${uuidv4()}.pptx`);
  await pptx.writeFile({ fileName: tempPath });
  return { filename: path.basename(tempPath), filepath: tempPath };
}

async function pdfToHtml(inputPath) {
  const pdfParse = require('pdf-parse');
  const data     = await pdfParse(readFile(inputPath));
  return saveConverted(
    Buffer.from(wrapHtml(`<pre style="white-space:pre-wrap">${data.text}</pre>`), 'utf-8'),
    'html'
  );
}

async function pdfToXml(inputPath) {
  const pdfParse = require('pdf-parse');
  const data     = await pdfParse(readFile(inputPath));
  const xmlStr   = js2xml.parse('pdf-document', {
    pages: { page: data.text.split('\f').map((t) => ({ _: t.trim() })) },
  });
  return saveConverted(Buffer.from(xmlStr, 'utf-8'), 'xml');
}

async function pdfToOdt(inputPath) {
  const pdfParse = require('pdf-parse');
  const data     = await pdfParse(readFile(inputPath));
  const lines    = data.text.split('\n').filter((l) => l.trim());

  const odtXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  office:version="1.2">
  <office:body>
    <office:text>
      ${lines.map((l) => `<text:p text:style-name="Standard">${l.trim()}</text:p>`).join('\n      ')}
    </office:text>
  </office:body>
</office:document-content>`;

  return saveConverted(Buffer.from(odtXml, 'utf-8'), 'odt');
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERTERS: DOCX → OTHER
// ══════════════════════════════════════════════════════════════════════════════

async function docxToPdf(inputPath) {
  const { value: html } = await mammoth.convertToHtml({ path: inputPath });
  const $    = cheerio.load(html);
  const text = $.text();

  const pdfDoc   = await PDFDocument.create();
  const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11, margin = 50, pageW = 595, pageH = 842;
  const lineH    = fontSize + 4;
  const maxLines = Math.floor((pageH - margin * 2) / lineH);

  function wrapText(txt, maxChars = 90) {
    const words = txt.split(' ');
    const lines = [];
    let cur = '';
    words.forEach((w) => {
      if ((cur + ' ' + w).trim().length > maxChars) { if (cur) lines.push(cur.trim()); cur = w; }
      else cur = cur ? cur + ' ' + w : w;
    });
    if (cur) lines.push(cur.trim());
    return lines;
  }

  const allLines = text.split('\n').flatMap((line) => wrapText(line.trim() || ' '));
  let pageLines = [], currentPage = pdfDoc.addPage([pageW, pageH]);

  allLines.forEach((line, i) => {
    pageLines.push(line);
    if (pageLines.length >= maxLines || i === allLines.length - 1) {
      pageLines.forEach((l, j) => {
        currentPage.drawText(l, { x: margin, y: pageH - margin - j * lineH, size: fontSize, font, color: rgb(0,0,0) });
      });
      if (i < allLines.length - 1) { currentPage = pdfDoc.addPage([pageW, pageH]); pageLines = []; }
    }
  });

  return saveConverted(Buffer.from(await pdfDoc.save()), 'pdf');
}

async function docxToHtml(inputPath) {
  const { value: body } = await mammoth.convertToHtml({ path: inputPath });
  return saveConverted(Buffer.from(wrapHtml(body, 'Converted from DOCX'), 'utf-8'), 'html');
}

async function docxToXml(inputPath) {
  const { value: html } = await mammoth.convertToHtml({ path: inputPath });
  const $ = cheerio.load(html);
  const paragraphs = [], headings = [];
  $('p').each((_, el) => paragraphs.push({ _: $(el).text() }));
  $('h1,h2,h3,h4,h5,h6').each((_, el) => headings.push({ _: $(el).text(), $: { level: el.name } }));
  return saveConverted(Buffer.from(js2xml.parse('document', { headings, paragraphs }), 'utf-8'), 'xml');
}

async function docxToOdt(inputPath) {
  const { value: html } = await mammoth.convertToHtml({ path: inputPath });
  const $ = cheerio.load(html);
  const lines = $.text().split('\n').filter((l) => l.trim());

  const odtXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  office:version="1.2">
  <office:body>
    <office:text>
      ${lines.map((l) => `<text:p text:style-name="Standard">${l.trim()}</text:p>`).join('\n      ')}
    </office:text>
  </office:body>
</office:document-content>`;

  return saveConverted(Buffer.from(odtXml, 'utf-8'), 'odt');
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERTERS: XLSX → OTHER
// ══════════════════════════════════════════════════════════════════════════════

async function xlsxToPdf(inputPath) {
  const wb     = XLSX.readFile(inputPath);
  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.Courier);

  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    const page = pdfDoc.addPage([842, 595]);
    const { height } = page.getSize();

    page.drawText(sheetName, { x: 30, y: height - 30, size: 14, font, color: rgb(0,0,0.6) });
    rows.slice(0, 40).forEach((row, ri) => {
      const rowStr = (row || []).map((c) => String(c ?? '').padEnd(15)).join(' | ');
      page.drawText(rowStr.slice(0, 100), {
        x: 30, y: height - 60 - ri * 13, size: 8, font,
        color: ri === 0 ? rgb(0,0,0) : rgb(0.2,0.2,0.2),
      });
    });
  }

  return saveConverted(Buffer.from(await pdfDoc.save()), 'pdf');
}

async function xlsxToHtml(inputPath) {
  const wb   = XLSX.readFile(inputPath);
  let   body = '';
  wb.SheetNames.forEach((name) => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1 });
    body += `<h2>${name}</h2><table>`;
    rows.forEach((row, i) => {
      body += '<tr>';
      (row || []).forEach((c) => { const t = i === 0 ? 'th' : 'td'; body += `<${t}>${c ?? ''}</${t}>`; });
      body += '</tr>';
    });
    body += '</table><br/>';
  });
  return saveConverted(Buffer.from(wrapHtml(body, 'Excel Data'), 'utf-8'), 'html');
}

async function xlsxToXml(inputPath) {
  const wb = XLSX.readFile(inputPath);
  const workbook = {};
  wb.SheetNames.forEach((name) => {
    workbook[name] = { row: XLSX.utils.sheet_to_json(wb.Sheets[name]) };
  });
  return saveConverted(Buffer.from(js2xml.parse('workbook', workbook), 'utf-8'), 'xml');
}

async function xlsxToOds(inputPath) {
  const wb = XLSX.readFile(inputPath);
  return saveConverted(Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'ods' })), 'ods');
}

async function xlsxToDocx(inputPath) {
  const wb       = XLSX.readFile(inputPath);
  const children = [];

  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });

    children.push(
      new Paragraph({
        text    : sheetName,
        heading : HeadingLevel.HEADING_2,
        spacing : { before: 300, after: 200 },
      })
    );

    if (rows.length > 0) {
      const tableRows = rows.map((row, rowIdx) =>
        new TableRow({
          children: (row || []).map((cell) =>
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: String(cell ?? ''), bold: rowIdx === 0, size: 20 })],
              })],
              width: { size: 2000, type: WidthType.DXA },
            })
          ),
        })
      );

      children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }
  }

  const doc    = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  return saveConverted(buffer, 'docx');
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERTERS: PPTX → OTHER
// ══════════════════════════════════════════════════════════════════════════════

async function extractPptxText(inputPath) {
  const JSZip = require('jszip');
  const zip   = await JSZip.loadAsync(readFile(inputPath));
  let   text  = '';

  const slideFiles = Object.keys(zip.files)
    .filter((f) => f.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort();

  for (const sf of slideFiles) {
    const parsed = await xml2js.parseStringPromise(await zip.files[sf].async('string'));
    function extractText(obj) {
      if (typeof obj === 'string') { text += obj + ' '; return; }
      if (Array.isArray(obj)) { obj.forEach(extractText); return; }
      if (obj && typeof obj === 'object') Object.values(obj).forEach(extractText);
    }
    extractText(parsed);
    text += '\n\n---\n\n';
  }
  return text.trim();
}

async function pptxToPdf(inputPath) {
  const text   = await extractPptxText(inputPath);
  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);

  text.split('---').filter((s) => s.trim()).forEach((slide) => {
    const page = pdfDoc.addPage([792, 612]);
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: height - 60, width, height: 60, color: rgb(0.18, 0.36, 0.62) });
    slide.trim().split('\n').filter((l) => l.trim()).slice(0, 30).forEach((line, i) => {
      page.drawText(line.slice(0, 85), { x: 40, y: height - 90 - i * 16, size: 11, font, color: rgb(0.1,0.1,0.1) });
    });
  });

  return saveConverted(Buffer.from(await pdfDoc.save()), 'pdf');
}

async function pptxToHtml(inputPath) {
  const text   = await extractPptxText(inputPath);
  let   body   = '';
  text.split('---').filter((s) => s.trim()).forEach((slide, i) => {
    body += `<div style="border:1px solid #ccc;padding:20px;margin:20px 0;border-radius:8px">
      <h3 style="color:#1a3c6e">Slide ${i + 1}</h3>
      <pre style="white-space:pre-wrap;font-family:inherit">${slide.trim()}</pre></div>`;
  });
  return saveConverted(Buffer.from(wrapHtml(body, 'Presentation'), 'utf-8'), 'html');
}

async function pptxToDocx(inputPath) {
  const text     = await extractPptxText(inputPath);
  const children = [new Paragraph({ text: 'Presentation Content', heading: HeadingLevel.HEADING_1, spacing: { after: 300 } })];

  text.split('---').filter((s) => s.trim()).forEach((slide, i) => {
    children.push(new Paragraph({ text: `Slide ${i + 1}`, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
    slide.trim().split('\n').filter((l) => l.trim()).forEach((line) => {
      children.push(new Paragraph({ children: [new TextRun({ text: line.trim(), size: 22 })], spacing: { after: 80 } }));
    });
  });

  const doc    = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  return saveConverted(buffer, 'docx');
}

async function pptxToXml(inputPath) {
  const text   = await extractPptxText(inputPath);
  const slides = text.split('---').filter((s) => s.trim());
  const data   = { slide: slides.map((s, i) => ({ $: { number: i + 1 }, _: s.trim() })) };
  return saveConverted(Buffer.from(js2xml.parse('presentation', data), 'utf-8'), 'xml');
}

async function pptxToOdp(inputPath) {
  const text   = await extractPptxText(inputPath);
  const slides = text.split('---').filter((s) => s.trim());

  const slideXml = slides.map((s, i) => `
    <draw:page draw:name="Slide${i + 1}" draw:style-name="dp1"
               draw:master-page-name="Default"
               presentation:presentation-page-layout-name="AL1T0">
      <draw:frame draw:style-name="pr1" draw:text-style-name="P1"
                  draw:layer="layout" svg:width="25.199cm" svg:height="13.86cm"
                  svg:x="1.4cm" svg:y="1.4cm">
        <draw:text-box>
          <text:p>${s.trim().replace(/\n/g, '</text:p><text:p>')}</text:p>
        </draw:text-box>
      </draw:frame>
    </draw:page>`).join('');

  const odpXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
  office:version="1.2">
  <office:body>
    <office:presentation>${slideXml}
    </office:presentation>
  </office:body>
</office:document-content>`;

  return saveConverted(Buffer.from(odpXml, 'utf-8'), 'odp');
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERTERS: HTML → OTHER
// ══════════════════════════════════════════════════════════════════════════════

async function htmlToDocx(inputPath) {
  const html   = fs.readFileSync(inputPath, 'utf-8');
  const buffer = await buildDocxFromHtml(html, 'Converted from HTML');
  return saveConverted(buffer, 'docx');
}

async function htmlToPdf(inputPath) {
  const $ = cheerio.load(fs.readFileSync(inputPath, 'utf-8'));
  const text = $.text();

  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11, margin = 50, pageH = 842, pageW = 595;
  const lineH  = fontSize + 4;
  const maxLines = Math.floor((pageH - margin * 2) / lineH);

  function wordWrap(txt, max = 90) {
    const words = txt.split(' ');
    const lines = [];
    let cur = '';
    words.forEach((w) => {
      if ((cur + ' ' + w).length > max) { if (cur) lines.push(cur); cur = w; }
      else cur = cur ? cur + ' ' + w : w;
    });
    if (cur) lines.push(cur);
    return lines;
  }

  const allLines = text.split('\n').flatMap((l) => wordWrap(l.trim() || ' '));
  let page = pdfDoc.addPage([pageW, pageH]);
  let row  = 0;

  allLines.forEach((line) => {
    if (row >= maxLines) { page = pdfDoc.addPage([pageW, pageH]); row = 0; }
    page.drawText(line, { x: margin, y: pageH - margin - row * lineH, size: fontSize, font, color: rgb(0,0,0) });
    row++;
  });

  return saveConverted(Buffer.from(await pdfDoc.save()), 'pdf');
}

async function htmlToXml(inputPath) {
  const $ = cheerio.load(fs.readFileSync(inputPath, 'utf-8'));
  const data = { title: $('title').text() || 'Document', headings: [], paragraphs: [], links: [] };
  $('h1,h2,h3,h4,h5,h6').each((_, el) => data.headings.push({ _: $(el).text(), $: { tag: el.name } }));
  $('p').each((_, el) => data.paragraphs.push({ _: $(el).text() }));
  $('a').each((_, el) => data.links.push({ _: $(el).text(), $: { href: $(el).attr('href') || '' } }));
  return saveConverted(Buffer.from(js2xml.parse('html-document', data), 'utf-8'), 'xml');
}

async function htmlToXlsx(inputPath) {
  const $ = cheerio.load(fs.readFileSync(inputPath, 'utf-8'));
  const wb = XLSX.utils.book_new();

  $('table').each((ti, table) => {
    const rows = [];
    $(table).find('tr').each((_, tr) => {
      const cells = [];
      $(tr).find('th,td').each((_, td) => cells.push($(td).text()));
      rows.push(cells);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), `Table${ti + 1}`);
  });

  if (wb.SheetNames.length === 0) {
    const lines = $.text().split('\n').filter((l) => l.trim()).map((l) => [l.trim()]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Content'], ...lines]), 'Content');
  }

  return saveConverted(Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })), 'xlsx');
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERTERS: XML → OTHER
// ══════════════════════════════════════════════════════════════════════════════

async function xmlToHtml(inputPath) {
  const parsed = await xml2js.parseStringPromise(fs.readFileSync(inputPath, 'utf-8'));

  function jsonToHtml(obj, depth = 0) {
    let html = '';
    Object.entries(obj).forEach(([key, val]) => {
      const tag = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'p';
      html += `<${tag}><strong>${key}</strong>: `;
      if (typeof val === 'string') html += val;
      else if (Array.isArray(val)) html += '<ul>' + val.map((v) => typeof v === 'object' ? `<li>${jsonToHtml(v, depth+1)}</li>` : `<li>${v}</li>`).join('') + '</ul>';
      else if (typeof val === 'object') html += jsonToHtml(val, depth + 1);
      html += `</${tag}>`;
    });
    return html;
  }

  return saveConverted(Buffer.from(wrapHtml(jsonToHtml(parsed), 'XML Document'), 'utf-8'), 'html');
}

async function xmlToDocx(inputPath) {
  const parsed = await xml2js.parseStringPromise(fs.readFileSync(inputPath, 'utf-8'));
  const lines  = JSON.stringify(parsed, null, 2).split('\n');
  const buffer = await buildDocxFromLines(lines, 'XML Document');
  return saveConverted(buffer, 'docx');
}

async function xmlToXlsx(inputPath) {
  const parsed = await xml2js.parseStringPromise(fs.readFileSync(inputPath, 'utf-8'));

  function flattenXml(obj) {
    const rows = [];
    function recurse(o, p) {
      Object.entries(o).forEach(([k, v]) => {
        const key = p ? `${p}.${k}` : k;
        if (Array.isArray(v)) v.forEach((item) => typeof item === 'object' ? recurse(item, key) : rows.push([key, item]));
        else if (typeof v === 'object') recurse(v, key);
        else rows.push([key, v]);
      });
    }
    recurse(obj, '');
    return rows;
  }

  const rows = flattenXml(parsed);
  const ws   = XLSX.utils.aoa_to_sheet([['Key', 'Value'], ...rows]);
  const wb   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'XML Data');
  return saveConverted(Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })), 'xlsx');
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERTERS: ODT / ODS / ODP → OTHER
// ══════════════════════════════════════════════════════════════════════════════

async function extractOdText(inputPath) {
  const JSZip = require('jszip');
  const zip   = await JSZip.loadAsync(readFile(inputPath));
  if (!zip.files['content.xml']) throw new Error('Invalid OD* file: content.xml not found');

  const parsed = await xml2js.parseStringPromise(await zip.files['content.xml'].async('string'));
  let text = '';
  function extract(obj) {
    if (typeof obj === 'string') { text += obj + ' '; return; }
    if (Array.isArray(obj)) { obj.forEach(extract); return; }
    if (obj && typeof obj === 'object') Object.values(obj).forEach(extract);
  }
  extract(parsed);
  return text.trim();
}

async function odtToDocx(inputPath) {
  const text   = await extractOdText(inputPath);
  const buffer = await buildDocxFromLines(text.split('\n'), 'Converted from ODT');
  return saveConverted(buffer, 'docx');
}

async function odtToPdf(inputPath) {
  const text   = await extractOdText(inputPath);
  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const lines  = text.split('\n').flatMap((l) => l.length > 90 ? [l.slice(0,90), l.slice(90)] : [l]);
  const pageH  = 842, pageW = 595, margin = 50, lineH = 15;
  const maxL   = Math.floor((pageH - margin * 2) / lineH);
  let page = pdfDoc.addPage([pageW, pageH]), row = 0;

  lines.forEach((line) => {
    if (row >= maxL) { page = pdfDoc.addPage([pageW, pageH]); row = 0; }
    page.drawText(line.slice(0,90), { x: margin, y: pageH - margin - row * lineH, size: 11, font, color: rgb(0,0,0) });
    row++;
  });
  return saveConverted(Buffer.from(await pdfDoc.save()), 'pdf');
}

async function odtToHtml(inputPath) {
  const text = await extractOdText(inputPath);
  return saveConverted(Buffer.from(wrapHtml(`<h1>Document Content</h1><pre style="white-space:pre-wrap">${text}</pre>`), 'utf-8'), 'html');
}

async function odtToXml(inputPath) {
  const text   = await extractOdText(inputPath);
  const xmlStr = js2xml.parse('document', {
    paragraphs: { paragraph: text.split('\n').filter((l) => l.trim()) },
  });
  return saveConverted(Buffer.from(xmlStr, 'utf-8'), 'xml');
}

async function odsToXlsx(inputPath) {
  const wb = XLSX.readFile(inputPath);
  return saveConverted(Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })), 'xlsx');
}

async function odpToPptx(inputPath) {
  const text   = await extractOdText(inputPath);
  const pptx   = new PptxGenJS();
  const chunks = text.match(/.{1,600}/gs) || [text];

  chunks.forEach((chunk, i) => {
    const slide = pptx.addSlide();
    slide.addText(`Slide ${i + 1}`, { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 20, bold: true });
    slide.addText(chunk, { x: 0.5, y: 1, w: 9, h: 5, fontSize: 11, wrap: true });
  });

  const tempPath = path.join(CONVERTED_DIR, `${uuidv4()}.pptx`);
  await pptx.writeFile({ fileName: tempPath });
  return { filename: path.basename(tempPath), filepath: tempPath };
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERSION MAP
// ══════════════════════════════════════════════════════════════════════════════

const CONVERSION_MAP = {
  pdf  : { docx: pdfToDocx, doc: pdfToDocx, xlsx: pdfToXlsx, xls: pdfToXlsx, pptx: pdfToPptx, ppt: pdfToPptx, html: pdfToHtml, xml: pdfToXml, odt: pdfToOdt },
  docx : { pdf: docxToPdf, html: docxToHtml, xml: docxToXml, odt: docxToOdt, xlsx: xlsxToDocx, xls: xlsxToDocx },
  doc  : { pdf: docxToPdf, html: docxToHtml, xml: docxToXml, odt: docxToOdt },
  xlsx : { pdf: xlsxToPdf, html: xlsxToHtml, xml: xlsxToXml, ods: xlsxToOds, docx: xlsxToDocx, doc: xlsxToDocx },
  xls  : { pdf: xlsxToPdf, html: xlsxToHtml, xml: xlsxToXml, ods: xlsxToOds, docx: xlsxToDocx },
  pptx : { pdf: pptxToPdf, html: pptxToHtml, xml: pptxToXml, odp: pptxToOdp, docx: pptxToDocx },
  ppt  : { pdf: pptxToPdf, html: pptxToHtml, xml: pptxToXml, odp: pptxToOdp, docx: pptxToDocx },
  html : { pdf: htmlToPdf, docx: htmlToDocx, doc: htmlToDocx, xml: htmlToXml, xlsx: htmlToXlsx, xls: htmlToXlsx },
  htm  : { pdf: htmlToPdf, docx: htmlToDocx, xml: htmlToXml, xlsx: htmlToXlsx },
  xml  : { html: xmlToHtml, docx: xmlToDocx, doc: xmlToDocx, xlsx: xmlToXlsx, xls: xmlToXlsx },
  odt  : { pdf: odtToPdf, html: odtToHtml, xml: odtToXml, docx: odtToDocx },
  ods  : { xlsx: odsToXlsx, xls: odsToXlsx },
  odp  : { pptx: odpToPptx, ppt: odpToPptx },
};

// ══════════════════════════════════════════════════════════════════════════════
//  CONTROLLER: POST /api/convert
// ══════════════════════════════════════════════════════════════════════════════

async function convertFile(req, res) {
  if (!req.file) {
    console.log('[FORMAT] No file received');
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const { path: inputPath, originalname } = req.file;
  const rawTarget = (req.body.targetFormat || '').trim();

  console.log('[FORMAT] File:', originalname, '| Size:', req.file.size, '| MIME:', req.file.mimetype);
  console.log('[FORMAT] Raw targetFormat:', rawTarget);

  if (!rawTarget) {
    return res.status(400).json({ success: false, message: 'targetFormat is required.' });
  }

  // ── Resolve source format ──────────────────────────────────────────────────
  const sourceFormat = resolveFormat(getExtension(originalname));
  console.log('[FORMAT] Source format:', sourceFormat);

  // ── Resolve target format ──────────────────────────────────────────────────
  // Handles: "PDF ↔ Word", "Office Files ↔ HTML", "docx", "pdf", etc.
  let targetFormat;
  if (rawTarget.includes('↔')) {
    const parts     = rawTarget.split('↔').map((p) => resolveFormat(p.trim()));
    const nonSource = parts.find((p) => p !== sourceFormat);
    targetFormat    = nonSource || parts[parts.length - 1];
  } else {
    targetFormat = resolveFormat(rawTarget);
  }

  console.log('[FORMAT] Target format:', targetFormat);

  try {
    const sourceConverters = CONVERSION_MAP[sourceFormat];
    if (!sourceConverters) {
      return res.status(400).json({
        success  : false,
        message  : `Source format "${sourceFormat}" is not supported.`,
        supported: Object.keys(CONVERSION_MAP),
      });
    }

    const converterFn = sourceConverters[targetFormat];
    if (!converterFn) {
      return res.status(400).json({
        success         : false,
        message         : `Cannot convert "${sourceFormat}" → "${targetFormat}".`,
        availableTargets: Object.keys(sourceConverters),
      });
    }

    const { filename } = await converterFn(inputPath);
    fs.unlink(inputPath, () => {});

    return res.status(200).json({
      success    : true,
      message    : `Converted ${sourceFormat.toUpperCase()} → ${targetFormat.toUpperCase()} successfully.`,
      downloadUrl: `/converted/${filename}`,
      filename,
    });

  } catch (err) {
    console.error('[ConvertError]', err);
    fs.unlink(inputPath, () => {});
    return res.status(500).json({ success: false, message: 'Conversion failed.', error: err.message });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTROLLER: GET /api/formats
// ══════════════════════════════════════════════════════════════════════════════

function getSupportedFormats(req, res) {
  const matrix = {};
  Object.entries(CONVERSION_MAP).forEach(([from, targets]) => { matrix[from] = Object.keys(targets); });
  return res.json({ success: true, matrix });
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLEANUP HELPER
// ══════════════════════════════════════════════════════════════════════════════

function cleanupConvertedFiles() {
  const now = Date.now(), maxAge = 60 * 60 * 1000;
  if (!fs.existsSync(CONVERTED_DIR)) return;
  fs.readdir(CONVERTED_DIR, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      const fp = path.join(CONVERTED_DIR, file);
      fs.stat(fp, (err, stat) => {
        if (!err && now - stat.mtimeMs > maxAge) { fs.unlink(fp, () => {}); console.log(`[CLEANUP] Deleted: ${file}`); }
      });
    });
  });
}

module.exports = { convertFile, getSupportedFormats, cleanupConvertedFiles };