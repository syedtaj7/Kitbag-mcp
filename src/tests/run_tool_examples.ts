import fs from 'fs';
import os from 'os';
import path from 'path';
import assert from 'assert';
import http from 'http';
import { execFileSync } from 'child_process';
import Jimp from 'jimp';
import QRCode from 'qrcode';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const archiverModule = require('archiver');
const archiver = archiverModule.default ?? archiverModule;

type ExampleFile = {
  input: Record<string, any>;
  output?: Record<string, any>;
};

type ToolModule = {
  tool?: {
    name: string;
    handler: (args: any) => Promise<any>;
  };
};

const validators: Record<string, (actual: any, input: Record<string, any>) => void> = {
  'ai.text_chunker': (actual, input) => {
    assert.ok(Array.isArray(actual.chunks));
    assert.strictEqual(actual.count, actual.chunks.length);
    assert.ok(actual.count > 0);
    for (const [index, chunk] of actual.chunks.entries()) {
      assert.strictEqual(chunk.index, index);
      assert.strictEqual(typeof chunk.content, 'string');
      assert.strictEqual(chunk.length, chunk.content.length);
    }
  },
  'developer.cron_parser': (actual, input) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(actual.expression, input.expression);
    assert.strictEqual(actual.isValid, true);
    assert.ok(Array.isArray(actual.nextExecutions));
    assert.strictEqual(actual.nextExecutions.length, input.iterations);
    for (const execution of actual.nextExecutions) {
      assert.ok(!Number.isNaN(Date.parse(execution)));
    }
  },
  'developer.json_formatter': (actual, input) => {
    const parsedInput = JSON.parse(input.json);
    const parsedOutput = JSON.parse(actual.formatted);
    assert.deepStrictEqual(parsedOutput, parsedInput);
    assert.strictEqual(actual.sizeBytes, Buffer.byteLength(actual.formatted));
  },
  'pdf.convert_to_markdown': (actual) => {
    assert.strictEqual(typeof actual.markdown, 'string');
    assert.ok(actual.markdown.length > 0);
    assert.strictEqual(typeof actual.pages, 'number');
    assert.ok(actual.pages >= 1);
  },
  'pdf.convert_to_text': (actual) => {
    assert.strictEqual(typeof actual.text, 'string');
    assert.ok(actual.text.length > 0);
    assert.strictEqual(typeof actual.pages, 'number');
    assert.ok(actual.pages >= 1);
  },
  'pdf.extract_images': (actual) => {
    assert.strictEqual(actual.success, true);
    assert.ok(Number.isInteger(actual.imageCount));
    assert.ok(Array.isArray(actual.images));
  },
  'pdf.extract_tables': (actual) => {
    assert.strictEqual(actual.success, true);
    assert.ok(Number.isInteger(actual.tableCount));
    assert.ok(Array.isArray(actual.tables));
  },
  'pdf.split': (actual, input) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(typeof actual.totalPages, 'number');
    assert.strictEqual(typeof actual.extractedCount, 'number');
    assert.ok(Array.isArray(actual.files));
    assert.strictEqual(actual.files.length, actual.extractedCount);
    assert.ok(actual.extractedCount > 0);
    for (const file of actual.files) {
      assert.strictEqual(typeof file.page, 'number');
      assert.strictEqual(typeof file.fileData, 'string');
      assert.ok(file.fileData.length > 0);
    }
  },
  'image.compress': (actual) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(typeof actual.fileData, 'string');
    assert.ok(actual.fileData.length > 0);
    assert.strictEqual(typeof actual.mimeType, 'string');
  },
  'image.convert_format': (actual) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(typeof actual.fileData, 'string');
    assert.ok(actual.fileData.length > 0);
    assert.strictEqual(typeof actual.mimeType, 'string');
  },
  'image.exif_metadata': (actual) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(typeof actual.hasMetadata, 'boolean');
    assert.ok(actual.tags && typeof actual.tags === 'object');
  },
  'image.ocr': (actual, input) => {
    assert.strictEqual(typeof actual.text, 'string');
    assert.strictEqual(typeof actual.confidence, 'number');
    assert.strictEqual(actual.language, input.language || 'eng');
  },
  'image.resize': (actual) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(typeof actual.fileData, 'string');
    assert.ok(actual.fileData.length > 0);
    assert.strictEqual(typeof actual.mimeType, 'string');
  },
  'developer.jwt_decoder': (actual, input) => {
    const parts = input.token.split('.');
    assert.ok(parts.length >= 2);
    const decodedHeader = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    assert.deepStrictEqual(actual.header, decodedHeader);
    assert.deepStrictEqual(actual.payload, decodedPayload);
    assert.ok(typeof actual.signatureLength === 'number' && actual.signatureLength > 0);
    assert.ok(typeof actual.issuedAt === 'string');
    assert.ok(typeof actual.expirationTime === 'string');
  },
  'developer.mermaid_generate': (actual, input) => {
    assert.strictEqual(actual.success, true);
    assert.ok(typeof actual.diagram === 'string');
    const normalized = actual.diagram.replace('--- \n', '---\n').trim();
    assert.ok(normalized.includes(input.title));
    for (const element of input.elements) {
      assert.ok(normalized.includes(element.split(' --> ')[0].replace('[', '').replace(']', '')) || normalized.includes(element));
    }
  },
  'utility.email_validate': (actual, input) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(actual.email, input.email.trim());
    assert.strictEqual(actual.syntax?.valid, true);
    assert.strictEqual(actual.syntax?.localPart, input.email.split('@')[0]);
    assert.strictEqual(actual.syntax?.domain, input.email.split('@')[1]);

    if (input.checkMx === false) {
      assert.deepStrictEqual(actual.dns, { checked: false });
      return;
    }

    assert.strictEqual(actual.dns?.checked, true);
    assert.strictEqual(typeof actual.dns?.success, 'boolean');
    assert.strictEqual(typeof actual.dns?.hasMxRecords, 'boolean');
    assert.ok(Array.isArray(actual.dns?.mxRecords));
  },
  'utility.ssl_check': (actual, input) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(actual.host, input.host.trim());
    assert.strictEqual(actual.port, input.port || 443);
    assert.ok(typeof actual.validFrom === 'string');
    assert.ok(typeof actual.validTo === 'string');
    assert.ok(Number.isInteger(actual.daysRemaining));
    assert.ok(actual.daysRemaining >= 0);
    assert.strictEqual(typeof actual.isExpired, 'boolean');
  },
  'utility.uuid_generate': (actual, input) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(typeof actual.type, 'string');
    assert.strictEqual(typeof actual.value, 'string');

    if (input.type === 'password') {
      assert.strictEqual(actual.type, 'secure-password');
      assert.strictEqual(actual.value.length, input.length || 16);
      return;
    }

    const expectedType = input.type === 'v1' ? 'uuid-v1' : 'uuid-v4';
    assert.strictEqual(actual.type, expectedType);
    assert.match(actual.value, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  },
  'utility.zip_create': (actual, input) => {
    assert.strictEqual(actual.success, true);
    assert.strictEqual(typeof actual.outputPath, 'string');
    assert.ok(actual.outputPath.endsWith(path.basename(input.outputPath)));
    assert.ok(actual.sizeBytes > 0);
  },
  'utility.zip_extract': (actual, input) => {
    assert.strictEqual(actual.success, true);
    assert.ok(typeof actual.message === 'string');
    assert.ok(actual.message.includes(path.basename(input.outputPath)));
  },
  'utility.qr_read': (actual) => {
    assert.strictEqual(typeof actual.text, 'string');
    assert.ok(actual.text.length > 0);
  },
  'web.extract_links': (actual, input) => {
    assert.ok(Number.isInteger(actual.linkCount));
    assert.ok(Array.isArray(actual.links));
    assert.strictEqual(actual.links.length, actual.linkCount);
    for (const link of actual.links) {
      assert.strictEqual(typeof link.text, 'string');
      assert.strictEqual(typeof link.url, 'string');
      assert.strictEqual(typeof link.isExternal, 'boolean');
    }
  },
  'web.extract_metadata': (actual, input) => {
    assert.strictEqual(typeof actual.title, 'string');
    assert.ok(actual.openGraph && typeof actual.openGraph === 'object');
    assert.ok(actual.twitter && typeof actual.twitter === 'object');
    assert.ok(Array.isArray(actual.jsonLd));
  },
  'web.rss_parser': (actual) => {
    assert.ok(actual.feedInfo && typeof actual.feedInfo === 'object');
    assert.ok(Number.isInteger(actual.itemCount));
    assert.ok(Array.isArray(actual.items));
    assert.strictEqual(actual.items.length, actual.itemCount);
  },
  'web.sitemap_generator': (actual) => {
    assert.strictEqual(typeof actual.sitemapUrl, 'string');
    assert.strictEqual(typeof actual.urlCount, 'number');
    assert.ok(Array.isArray(actual.urls));
  },
  'web.to_markdown': (actual, input) => {
    assert.strictEqual(typeof actual.markdown, 'string');
    assert.ok(actual.markdown.length > 0);
  },
  'web.dns_lookup': (actual) => {
    assert.strictEqual(typeof actual.domain, 'string');
    assert.strictEqual(typeof actual.rrtype, 'string');
    assert.ok(Array.isArray(actual.records));
  },
  'web.youtube_transcript': (actual, input) => {
    const url = new URL(input.url);
    const videoId = url.searchParams.get('v');
    if (videoId) {
      assert.strictEqual(actual.videoId, videoId);
    }
    assert.strictEqual(actual.languageCode, input.languageCode || actual.languageCode);
    assert.ok(Array.isArray(actual.transcript));
    assert.strictEqual(typeof actual.fullText, 'string');
  }
};

function findFiles(dir: string, matcher: (name: string) => boolean): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, matcher));
    } else if (matcher(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function writeImageFixture(filePath: string, text?: string) {
  ensureDir(filePath);
  const image = new Jimp(320, 180, 0xffffffff);
  if (text) {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(font, 20, 60, text);
  }
  await image.writeAsync(filePath);
}

async function writeJpegFixture(filePath: string, text?: string) {
  ensureDir(filePath);
  const image = new Jimp(320, 180, 0xfff4d7ff);
  if (text) {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(font, 20, 60, text);
  }
  await image.quality(90).writeAsync(filePath);
}

async function writeQrFixture(filePath: string, text: string) {
  ensureDir(filePath);
  await QRCode.toFile(filePath, text);
}

async function writePdfFixture(filePath: string, kind: string) {
  ensureDir(filePath);
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const addTextPage = (lines: string[], options: { title?: string; drawTable?: boolean } = {}) => {
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    let y = height - 72;

    if (options.title) {
      page.drawText(options.title, { x: 72, y, size: 20, font, color: rgb(0, 0, 0) });
      y -= 32;
    }

    for (const line of lines) {
      page.drawText(line, { x: 72, y, size: 12, font, color: rgb(0, 0, 0) });
      y -= 18;
    }
  };

  if (kind === 'sample') {
    addTextPage([
      'This is a paragraph of the sample PDF text.',
      '',
      '- Point 1',
      '- Point 2'
    ], { title: 'Sample Document' });
  } else if (kind === 'report') {
    for (let index = 1; index <= 5; index++) {
      addTextPage([`Page ${index} Content`], { title: `Report Page ${index}` });
    }
  } else if (kind === 'images') {
    const image = new Jimp(120, 120, 0xffff55ff);
      const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
      const embedded = await pdfDoc.embedPng(buffer);
    const page = pdfDoc.addPage([612, 792]);
    page.drawText('Report with embedded image', { x: 72, y: 720, size: 18, font });
    page.drawImage(embedded, { x: 72, y: 520, width: 120, height: 120 });
  } else if (kind === 'table') {
    const page = pdfDoc.addPage([612, 792]);
    page.drawText('Report With Table', { x: 72, y: 720, size: 18, font });
    const startX = 72;
    const startY = 640;
    const cellWidth = 140;
    const cellHeight = 36;
    const rows = [
      ['Name', 'Age', 'Role'],
      ['Alice', '30', 'Engineer'],
      ['Bob', '25', 'Manager']
    ];

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
        const x = startX + colIndex * cellWidth;
        const y = startY - rowIndex * cellHeight;
        page.drawRectangle({ x, y, width: cellWidth, height: cellHeight, borderWidth: 1, borderColor: rgb(0, 0, 0) });
        page.drawText(rows[rowIndex][colIndex], { x: x + 8, y: y + 12, size: 12, font });
      }
    }
  } else if (kind === 'split') {
    for (let index = 1; index <= 5; index++) {
      addTextPage([`Page ${index} Content`], { title: `Split Source Page ${index}` });
    }
  } else if (kind === 'merge-part-1') {
    addTextPage(['Merged file part 1'], { title: 'Part 1' });
  } else if (kind === 'merge-part-2') {
    addTextPage(['Merged file part 2'], { title: 'Part 2' });
  }

  const bytes = await pdfDoc.save();
  fs.writeFileSync(filePath, Buffer.from(bytes));
}

async function writeZipFixture(filePath: string) {
  ensureDir(filePath);
  const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kitbag-zip-src-'));
  try {
    fs.writeFileSync(path.join(sourceDir, 'readme.txt'), 'Welcome to my zip file!');
    fs.mkdirSync(path.join(sourceDir, 'data'), { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'data', 'notes.txt'), 'Important information here.');

    const command = `Compress-Archive -Path "${path.join(sourceDir, '*')}" -DestinationPath "${filePath}" -Force`;
    execFileSync('powershell.exe', ['-NoProfile', '-Command', command], { stdio: 'ignore' });
  } finally {
    fs.rmSync(sourceDir, { recursive: true, force: true });
  }
}

async function createWebFixtureServer() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');

    if (url.pathname === '/feed.xml') {
      response.writeHead(200, { 'content-type': 'application/rss+xml; charset=utf-8' });
      response.end(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example Blog Feed</title>
    <description>Latest updates from Example Blog</description>
    <link>http://127.0.0.1</link>
    <item>
      <title>Hello World Post</title>
      <link>http://127.0.0.1/posts/hello-world</link>
      <description>This is our first blog post description.</description>
      <pubDate>Fri, 17 Jul 2026 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`);
      return;
    }

    if (url.pathname === '/sitemap.xml') {
      response.writeHead(200, { 'content-type': 'application/xml; charset=utf-8' });
      response.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://127.0.0.1/</loc></url>
  <url><loc>http://127.0.0.1/about</loc></url>
</urlset>`);
      return;
    }

    if (url.pathname === '/about') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end('<!doctype html><html><head><title>About</title></head><body><p>About page.</p></body></html>');
      return;
    }

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html>
<html>
  <head>
    <title>Example Domain</title>
    <meta name="description" content="Illustrative example domain description" />
    <meta name="keywords" content="example, domain" />
    <meta property="og:title" content="Example Domain" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <script type="application/ld+json">[{"@context":"https://schema.org","@type":"WebSite","name":"Example"}]</script>
  </head>
  <body>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents.</p>
    <a href="https://www.iana.org/domains/reserved">More information...</a>
  </body>
</html>`);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start local web fixture server.');
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve()))
  };
}

async function prepareInput(
  toolName: string,
  input: Record<string, any>,
  tempRoot: string,
  pathMap: Map<string, string>,
  baseUrl: string
): Promise<Record<string, any>> {
  const cloned = deepClone(input);

  const mapOutputPath = (originalPath: string) => {
    const tempPath = path.join(tempRoot, path.basename(originalPath) || 'output');
    pathMap.set(tempPath, originalPath);
    return tempPath;
  };

  const mapInputFile = async (originalPath: string, kind: 'png' | 'jpeg' | 'pdf' | 'zip' | 'qr' | 'text-image') => {
    const tempPath = path.join(tempRoot, path.basename(originalPath));
    pathMap.set(tempPath, originalPath);

    if (kind === 'png') {
      await writeImageFixture(tempPath, 'Example');
    } else if (kind === 'jpeg') {
      await writeJpegFixture(tempPath, 'Example');
    } else if (kind === 'text-image') {
      await writeImageFixture(tempPath, 'This is the extracted text from the image.');
    } else if (kind === 'pdf') {
      const basename = path.basename(originalPath);
      if (basename === 'sample.pdf') {
        await writePdfFixture(tempPath, 'sample');
      } else if (basename === 'report.pdf') {
        await writePdfFixture(tempPath, 'split');
      } else if (basename === 'report_with_images.pdf') {
        await writePdfFixture(tempPath, 'images');
      } else if (basename === 'report_with_table.pdf') {
        await writePdfFixture(tempPath, 'table');
      } else if (basename === 'part1.pdf') {
        await writePdfFixture(tempPath, 'merge-part-1');
      } else if (basename === 'part2.pdf') {
        await writePdfFixture(tempPath, 'merge-part-2');
      } else {
        await writePdfFixture(tempPath, 'sample');
      }
    } else if (kind === 'zip') {
      await writeZipFixture(tempPath);
    } else if (kind === 'qr') {
      await writeQrFixture(tempPath, 'https://example.com');
    }

    return tempPath;
  };

  if (toolName === 'web.extract_metadata' || toolName === 'web.extract_links' || toolName === 'web.to_markdown') {
    cloned.url = `${baseUrl}/`;
  }

  if (toolName === 'web.rss_parser') {
    cloned.url = `${baseUrl}/feed.xml`;
  }

  if (toolName === 'web.sitemap_generator') {
    cloned.url = `${baseUrl}/sitemap.xml`;
  }

  if (toolName === 'utility.qr_read' && typeof cloned.filePath === 'string') {
    cloned.filePath = await mapInputFile(cloned.filePath, 'qr');
  }

  if (toolName === 'utility.zip_extract' && typeof cloned.zipPath === 'string') {
    cloned.zipPath = await mapInputFile(cloned.zipPath, 'zip');
    if (typeof cloned.outputPath === 'string') {
      cloned.outputPath = mapOutputPath(cloned.outputPath);
    }
  }

  if (toolName === 'utility.zip_create' && typeof cloned.outputPath === 'string') {
    cloned.outputPath = mapOutputPath(cloned.outputPath);
  }

  if (toolName === 'image.ocr' && typeof cloned.filePath === 'string') {
    cloned.filePath = await mapInputFile(cloned.filePath, 'text-image');
  }

  if (toolName.startsWith('image.') && toolName !== 'image.ocr' && typeof cloned.filePath === 'string') {
    const extension = path.extname(cloned.filePath).toLowerCase();
    cloned.filePath = await mapInputFile(cloned.filePath, extension === '.jpg' || extension === '.jpeg' ? 'jpeg' : 'png');
  }

  if (toolName === 'pdf.convert_to_markdown' || toolName === 'pdf.convert_to_text') {
    if (typeof cloned.filePath === 'string') {
      cloned.filePath = await mapInputFile(cloned.filePath, 'pdf');
    }
  }

  if (toolName === 'pdf.extract_images' || toolName === 'pdf.extract_tables') {
    if (typeof cloned.filePath === 'string') {
      const basename = path.basename(cloned.filePath);
      const kind = basename === 'report_with_images.pdf' ? 'pdf' : 'pdf';
      cloned.filePath = await mapInputFile(cloned.filePath, kind);
    }
  }

  if (toolName === 'pdf.merge' && Array.isArray(cloned.files)) {
    cloned.files = await Promise.all(
      cloned.files.map(async (entry: any, index: number) => {
        if (entry && typeof entry.filePath === 'string') {
          const basename = path.basename(entry.filePath);
          const created = await mapInputFile(entry.filePath, basename === 'part1.pdf' ? 'pdf' : 'pdf');
          return { ...entry, filePath: created };
        }
        return entry;
      })
    );
    if (typeof cloned.outputPath === 'string') {
      cloned.outputPath = mapOutputPath(cloned.outputPath);
    }
  }

  if (toolName === 'pdf.split' && typeof cloned.filePath === 'string') {
    cloned.filePath = await mapInputFile(cloned.filePath, 'pdf');
  }

  if (toolName === 'pdf.extract_images' && typeof cloned.filePath === 'string') {
    cloned.filePath = await mapInputFile(cloned.filePath, 'pdf');
  }

  if (toolName === 'utility.qr_generate' && typeof cloned.outputPath === 'string') {
    cloned.outputPath = mapOutputPath(cloned.outputPath);
  }

  if (toolName === 'image.resize' || toolName === 'image.compress' || toolName === 'image.convert_format') {
    if (typeof cloned.outputPath === 'string') {
      cloned.outputPath = mapOutputPath(cloned.outputPath);
    }
  }

  return cloned;
}

function normalizeActualPaths(value: any, pathMap: Map<string, string>): any {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeActualPaths(item, pathMap));
  }

  if (value && typeof value === 'object') {
    const normalized: Record<string, any> = {};
    for (const [key, childValue] of Object.entries(value)) {
      normalized[key] = normalizeActualPaths(childValue, pathMap);
    }
    return normalized;
  }

  if (typeof value === 'string') {
    for (const [tempPath, originalPath] of pathMap.entries()) {
      if (value.includes(tempPath)) {
        return value.split(tempPath).join(originalPath);
      }
    }
  }

  return value;
}

function compareDeep(expected: any, actual: any, location = 'root'): string[] {
  if (expected === actual) {
    return [];
  }

  if (typeof expected !== typeof actual) {
    return [`${location}: expected ${typeof expected}, got ${typeof actual}`];
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      return [`${location}: expected array, got ${typeof actual}`];
    }

    if (expected.length !== actual.length) {
      return [`${location}: expected array length ${expected.length}, got ${actual.length}`];
    }

    const issues: string[] = [];
    for (let index = 0; index < expected.length; index++) {
      issues.push(...compareDeep(expected[index], actual[index], `${location}[${index}]`));
      if (issues.length > 10) {
        break;
      }
    }
    return issues;
  }

  if (expected && typeof expected === 'object') {
    const expectedKeys = Object.keys(expected).sort();
    const actualKeys = Object.keys(actual || {}).sort();

    if (expectedKeys.length !== actualKeys.length || expectedKeys.some((key, index) => key !== actualKeys[index])) {
      return [`${location}: expected keys ${expectedKeys.join(', ')}, got ${actualKeys.join(', ')}`];
    }

    const issues: string[] = [];
    for (const key of expectedKeys) {
      issues.push(...compareDeep(expected[key], actual[key], `${location}.${key}`));
      if (issues.length > 10) {
        break;
      }
    }
    return issues;
  }

  return [`${location}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`];
}

async function run() {
  const toolsDir = path.join(__dirname, '../tools');
  const exampleFiles = findFiles(toolsDir, (name) => name === 'example.json');
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kitbag-tools-'));
  const webFixtures = await createWebFixtureServer();

  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  };

  console.log(`Discovered ${exampleFiles.length} tool examples.`);

  try {
    for (const exampleFile of exampleFiles) {
      summary.total++;
      const toolDir = path.dirname(exampleFile);
      const toolPath = path.join(toolDir, 'tool.ts');

      if (!fs.existsSync(toolPath)) {
        summary.skipped++;
        console.warn(`SKIP ${path.relative(toolsDir, toolDir)}: missing tool.ts`);
        continue;
      }

      const rawExample = JSON.parse(fs.readFileSync(exampleFile, 'utf8')) as ExampleFile;
      const pathMap = new Map<string, string>();
      const expectedOutput = rawExample.output ? deepClone(rawExample.output) : undefined;

      const module = (await import(pathToFileURL(toolPath).href)) as ToolModule;
      const tool = module.tool;

      if (!tool || typeof tool.handler !== 'function') {
        summary.failed++;
        console.error(`FAIL ${path.relative(toolsDir, toolDir)}: tool export missing or invalid`);
        continue;
      }

      const relativeName = path.relative(toolsDir, toolDir).replace(/\\/g, '/');
      process.stdout.write(`RUN  ${relativeName} ... `);

      try {
        const input = await prepareInput(tool.name, rawExample.input, tempRoot, pathMap, webFixtures.baseUrl);
        const previousMockPdfParse = (globalThis as any).__mockPdfParse;
        if (tool.name === 'pdf.extract_tables') {
          (globalThis as any).__mockPdfParse = async () => ({
            text: 'Name    Age    Role\nAlice    30    Dev\nBob      25    PM',
            numpages: 1,
            info: {}
          });
        }

        try {
          const actual = normalizeActualPaths(await tool.handler(input), pathMap);

          const validator = validators[tool.name];
          if (validator) {
            validator(actual, rawExample.input);
          } else if (expectedOutput) {
            const mismatches = compareDeep(expectedOutput, actual);
            assert.strictEqual(mismatches.length, 0, mismatches.join('\n'));
          }

          summary.passed++;
          console.log('ok');
        } finally {
          (globalThis as any).__mockPdfParse = previousMockPdfParse;
        }
      } catch (error: any) {
        summary.failed++;
        console.log('fail');
        console.error(`  ${tool.name}`);
        console.error(`  ${error?.stack || error}`);
      }
    }
  } finally {
    await webFixtures.close();
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }

  console.log('\nExample test summary');
  console.log(`  total:   ${summary.total}`);
  console.log(`  passed:  ${summary.passed}`);
  console.log(`  failed:  ${summary.failed}`);
  console.log(`  skipped: ${summary.skipped}`);

  if (summary.failed > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error('Tool example runner failed fatally:', error);
  process.exit(1);
});