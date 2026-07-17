import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverTools } from '../registry/registry.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Jimp from 'jimp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createDummyPdf(pagesCount = 1): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pagesCount; i++) {
    const page = pdfDoc.addPage();
    page.drawText(`Page ${i + 1} Content`, { font, x: 50, y: 300, size: 12 });
  }
  const bytes = await pdfDoc.save();
  return Buffer.from(bytes).toString('base64');
}

async function createDummyImage(format = 'png'): Promise<string> {
  const img = new Jimp(20, 20, 0x00FF00FF);
  const mime = format === 'jpeg' ? Jimp.MIME_JPEG : Jimp.MIME_PNG;
  const buf = await img.getBufferAsync(mime);
  return buf.toString('base64');
}

async function run() {
  console.log("Starting Real-Life Validation of All 50 Tools...\n");

  const toolsDir = path.join(__dirname, '../tools');
  const allTools = await discoverTools(toolsDir);
  console.log(`Discovered ${allTools.length} tools to execute.\n`);

  // Dynamically prepare values
  const dummyPdf = await createDummyPdf(3);
  const dummyPdfSingle = await createDummyPdf(1);
  const dummyPng = await createDummyImage('png');
  const dummyJpeg = await createDummyImage('jpeg');

  // Fetch real-world parseable PDF from W3C
  let w3cPdfBase64 = dummyPdfSingle;
  try {
    const w3cRes = await fetch('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    if (w3cRes.ok) {
      const arrayBuffer = await w3cRes.arrayBuffer();
      w3cPdfBase64 = Buffer.from(arrayBuffer).toString('base64');
      console.log("Fetched real-world standard PDF from W3C for parser validation.");
    }
  } catch (e) {
    console.warn("Could not fetch W3C PDF, falling back to dummyPdfSingle.");
  }

  // Generate QR code for utility.qr_read test
  const qrGenModule = await import('../tools/utility/qr_generate/tool.js');
  const qrGenResult = await qrGenModule.tool.handler({ text: "Real Life QR Decode Check" });
  const qrCodeBase64 = qrGenResult.dataUrl.split(',')[1];

  const inputs: Record<string, any> = {
    "ai.text_chunker": {
      text: "The Model Context Protocol (MCP) allows AI agents to interact with external tools and resources. It establishes a secure channel for data transfer and function execution. In this guide, we discuss how to build custom MCP servers.",
      chunkSize: 50,
      chunkOverlap: 10
    },
    "data.csv_to_json": {
      csvData: "id,name,role\n1,Alice,Developer\n2,Bob,Designer"
    },
    "data.json_to_csv": {
      jsonData: JSON.stringify([{ id: 1, name: "Alice", role: "Developer" }, { id: 2, name: "Bob", role: "Designer" }])
    },
    "data.deduplicate": {
      arrayData: JSON.stringify([{ id: 1, val: "A" }, { id: 1, val: "B" }, { id: 2, val: "C" }]),
      key: "id"
    },
    "data.xml_to_json": {
      xml: "<bookstore><book category=\"web\"><title>Learning XML</title><author>Erik T. Ray</author><year>2003</year></book></bookstore>"
    },
    "data.json_to_xml": {
      jsonData: JSON.stringify({ bookstore: { book: { "@category": "web", title: "Learning XML", author: "Erik T. Ray", year: 2003 } } })
    },
    "data.yaml_to_json": {
      yaml: "database:\n  host: localhost\n  port: 5432\n  enabled: true\n"
    },
    "data.json_to_yaml": {
      jsonData: JSON.stringify({ database: { host: "localhost", port: 5432, enabled: true } })
    },
    "data.diff_arrays": {
      arrayA: JSON.stringify([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]),
      arrayB: JSON.stringify([{ id: 1, name: "Alice Modified" }, { id: 3, name: "Charlie" }]),
      key: "id"
    },
    "developer.code_detector": {
      code: "def greet(name):\n    print(f'Hello, {name}!')\n\nif __name__ == '__main__':\n    greet('World')"
    },
    "developer.cron_parser": {
      expression: "0 9 * * 1-5",
      iterations: 3
    },
    "developer.diff_files": {
      contentA: "Line 1\nLine 2\nLine 3",
      contentB: "Line 1\nLine 2 modified\nLine 3\nLine 4 added"
    },
    "developer.diff_json": {
      jsonA: JSON.stringify({ api: { version: "1.0", enabled: true } }),
      jsonB: JSON.stringify({ api: { version: "1.1", enabled: true, secure: false } })
    },
    "developer.json_formatter": {
      json: '{"user":{"id":123,"profile":{"name":"John"}}}',
      indent: 4
    },
    "developer.jwt_decoder": {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4MDAwMDAwMDB9.sig"
    },
    "developer.markdown_lint": {
      markdown: "## Title \n\nSome paragraph text here with trailing space "
    },
    "developer.mermaid_generate": {
      type: "flowchart",
      title: "Flow",
      elements: ["A[Input] --> B{Valid?}", "B -- Yes --> C[Process]", "B -- No --> D[Error]"]
    },
    "developer.openapi_parser": {
      spec: `
openapi: 3.0.0
info:
  title: Petstore
  version: 1.0.0
paths:
  /pets:
    get:
      summary: List all pets
`
    },
    "developer.regex_tester": {
      regex: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b",
      text: "Send inquiries to info@example.com or support@google.com."
    },
    "developer.sql_formatter": {
      sql: "select id, name, email from users where status = 'active' order by created_at desc;",
      dialect: "postgresql"
    },
    "image.resize": {
      fileData: dummyPng,
      width: 50,
      height: 50
    },
    "image.compress": {
      fileData: dummyJpeg,
      quality: 80
    },
    "image.convert_format": {
      fileData: dummyPng,
      format: "jpeg"
    },
    "image.exif_metadata": {
      fileData: dummyJpeg
    },
    "image.ocr": {
      fileData: dummyPng
    },
    "pdf.convert_to_text": {
      fileData: w3cPdfBase64
    },
    "pdf.convert_to_markdown": {
      fileData: w3cPdfBase64
    },
    "pdf.extract_images": {
      fileData: dummyPdfSingle
    },
    "pdf.extract_tables": {
      fileData: w3cPdfBase64
    },
    "pdf.merge": {
      files: [
        { fileData: dummyPdfSingle, name: "file1.pdf" },
        { fileData: dummyPdfSingle, name: "file2.pdf" }
      ]
    },
    "pdf.split": {
      fileData: dummyPdf,
      pages: "1, 3"
    },
    "utility.base64_encode": {
      text: "Kitbag MCP Server"
    },
    "utility.base64_decode": {
      base64: "S2l0YmFnIE1DUCBTZXJ2ZXI="
    },
    "utility.email_validate": {
      email: "hello@google.com",
      checkMx: true
    },
    "utility.file_hash": {
      text: "hello",
      algorithm: "sha256"
    },
    "utility.qr_generate": {
      text: "https://github.com"
    },
    "utility.qr_read": {
      fileData: qrCodeBase64
    },
    "utility.ssl_check": {
      host: "google.com",
      port: 443
    },
    "utility.unit_convert": {
      value: 1024,
      type: "data",
      from: "mb",
      to: "gb"
    },
    "utility.url_parser": {
      url: "https://example.com/search?query=ts&limit=10#results"
    },
    "utility.uuid_generate": {
      type: "password",
      length: 12
    },
    "utility.zip_create": {
      files: [
        { name: "hello.txt", content: "Zip content real check" }
      ],
      outputPath: path.join(__dirname, 'real_test.zip')
    },
    "utility.zip_extract": {
      zipPath: path.join(__dirname, 'real_test.zip'),
      outputPath: path.join(__dirname, 'real_test_extracted')
    },
    "web.dns_lookup": {
      domain: "google.com",
      rrtype: "A"
    },
    "web.extract_links": {
      url: "https://example.com",
      ignoreAnchorOnly: true
    },
    "web.extract_metadata": {
      url: "https://example.com"
    },
    "web.rss_parser": {
      url: "https://github.blog/feed/"
    },
    "web.sitemap_generator": {
      url: "https://www.google.com/sitemap.xml"
    },
    "web.to_markdown": {
      url: "https://example.com"
    },
    "web.youtube_transcript": {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  };

  const results: Array<{ name: string; success: boolean; result?: any; error?: string }> = [];

  for (const tool of allTools) {
    console.log(`Running real-world invocation for: ${tool.name}`);
    const input = inputs[tool.name];
    if (!input) {
      console.warn(`⚠️ No custom inputs defined for ${tool.name}, skipping!`);
      continue;
    }

    try {
      const output = await tool.handler(input);
      results.push({
        name: tool.name,
        success: true,
        result: output
      });
      console.log(`✅ Success!\n`);
    } catch (e: any) {
      results.push({
        name: tool.name,
        success: false,
        error: e.message
      });
      console.error(`❌ Failed: ${e.message}\n`);
    }
  }

  // Clean up zip test files if created
  try {
    const zipPath = path.join(__dirname, 'real_test.zip');
    const extractDir = path.join(__dirname, 'real_test_extracted');
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
  } catch (e) {
    // Ignore cleanup errors
  }

  // Write markdown report
  const reportPath = 'C:\\Users\\syedt\\.gemini\\antigravity-ide\\brain\\ca9558e4-d4e2-485d-9f1e-abbcf06c1d10\\real_life_test_results.md';
  let md = `# Real-Life MCP Tools Execution Report\n\n`;
  md += `This report lists the output of executing all 50 registered tools with live, real-life arguments (live DNS, fetch request connections, SSL sockets, PDF generators, image processes, etc.) as of **${new Date().toISOString()}**.\n\n`;
  md += `## Summary\n\n`;
  md += `- **Total Tools Discovered**: ${allTools.length}\n`;
  md += `- **Passed Live**: ${results.filter(r => r.success).length}\n`;
  md += `- **Failed Live**: ${results.filter(r => !r.success).length}\n\n`;

  md += `## Detailed Tool Invocations\n\n`;

  for (const r of results) {
    md += `### ${r.success ? '✅' : '❌'} ${r.name}\n\n`;
    if (r.success) {
      // Truncate huge binary base64 output inside reports to keep markdown file clean
      const cleaned = JSON.parse(JSON.stringify(r.result));
      if (cleaned.fileData && cleaned.fileData.length > 100) {
        cleaned.fileData = cleaned.fileData.substring(0, 80) + "... [TRUNCATED BASE64]";
      }
      if (cleaned.files && Array.isArray(cleaned.files)) {
        cleaned.files.forEach((f: any) => {
          if (f.fileData && f.fileData.length > 100) {
            f.fileData = f.fileData.substring(0, 80) + "... [TRUNCATED BASE64]";
          }
        });
      }
      md += "```json\n" + JSON.stringify(cleaned, null, 2) + "\n```\n\n";
    } else {
      md += `> **Error message**: ${r.error}\n\n`;
    }
  }

  fs.writeFileSync(reportPath, md);
  console.log(`Real-life execution results saved to: ${reportPath}`);
}

run().catch((e) => {
  console.error("Fatally failed real life runner:", e);
});
