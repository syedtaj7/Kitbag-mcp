# Kitbag MCP — A Modular Utility MCP Server

Kitbag MCP is a single, open-source Model Context Protocol (MCP) server that bundles a curated library of high-value utility tools — document conversion, OCR, web scraping, data transformation, and AI developer utilities — under one install.

Instead of installing, configuring, and maintaining multiple single-purpose MCP servers, you install **Kitbag MCP** and selectively enable only the modules you need, preventing tool-selection degradation in LLM agents.

---

## Features

- **Modular Design**: Grouped into namespaces (e.g., `pdf.`, `web.`, `image.`).
- **Selective Enablement**: Expose only the tool categories or individual tools you need.
- **Cross-Platform Compatibility**: Fully tested on Windows, macOS, and Linux. Built with pure JS libraries where possible to avoid C++ binary compilation issues on Windows.
- **Built-in Security limits**: Standard 30s timeouts, payload size validation (50MB max PDF, 20MB max image), and standard sandboxing.

---

## 1. Quick Start

### Run via npx (Node.js)
```bash
npx kitbag-mcp --enabled-modules pdf,web
```

### Run via Docker
```bash
docker run -i -v /path/to/files:/data kitbag-mcp --enabled-modules pdf,data
```

---

## 2. Configuration Options

You can configure which modules or specific tools are enabled using:
1. **Command Line Flags**: `--enabled-modules` or `--enabled-tools`
2. **Environment Variables**: `KITBAG_ENABLED_MODULES` or `KITBAG_ENABLED_TOOLS`
3. **JSON Config File**: A `kitbag-config.json` file in the current working directory, or specified using `--config /path/to/config.json`.

### Configuration JSON Schema
```json
{
  "enabledModules": ["pdf", "web", "image", "data", "utility", "ai"],
  "enabledTools": [],
  "defaultTimeoutMs": 30000,
  "maxPayloadSizeBytes": 52428800
}
```

---

## 3. Supported Clients Setup

### Claude Desktop
Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "kitbag-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "kitbag-mcp",
        "--enabled-modules",
        "pdf,web,image,data,utility,ai"
      ]
    }
  }
}
```

### Cursor
1. Go to **Settings** > **Beta Features** > **MCP**.
2. Click **+ Add New MCP Server**.
3. Set:
   - **Name**: `Kitbag MCP`
   - **Type**: `stdio`
   - **Command**: `npx -y kitbag-mcp --enabled-modules pdf,web,data`

### Windsurf
Add this to your `mcp_config.json`:
```json
{
  "mcpServers": {
    "kitbag-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "kitbag-mcp"
      ],
      "env": {
        "KITBAG_ENABLED_MODULES": "pdf,web,data,utility"
      }
    }
  }
}
```

---

## 4. Phase 1 Tool Directory

| Tool Name | Description | Example Agent Prompt |
|---|---|---|
| **`pdf.convert_to_text`** | Extract raw text from a PDF document | *"Extract the text from reports/invoice.pdf"* |
| **`pdf.convert_to_markdown`** | Parse PDF and format it into clean Markdown | *"Convert layout of guide.pdf to markdown"* |
| **`web.to_markdown`** | Scrape webpage and extract main body as Markdown | *"Convert https://example.com/blog to markdown"* |
| **`web.extract_metadata`** | Extract title, description, OpenGraph, and JSON-LD data | *"Get metadata for URL https://news.ycombinator.com"* |
| **`image.ocr`** | Perform local optical character recognition on images | *"Extract text from screenshot.png"* |
| **`data.csv_to_json`** | Convert CSV file or text to JSON objects | *"Parse users.csv and return it as JSON"* |
| **`data.json_to_csv`** | Convert JSON array of objects to CSV output | *"Convert this array of users to a CSV table"* |
| **`utility.qr_generate`** | Create a QR code (base64 Data URL or file) | *"Create a QR code for https://google.com"* |
| **`utility.qr_read`** | Decode a QR code from a file or base64 stream | *"What does the QR code in qrcode.png say?"* |
| **`ai.text_chunker`** | Chunk large text using paragraph/sentence/word/char strategies | *"Chunk this document into 500-char sizes with overlap"* |

---

## 5. Contribution Standards

Every new utility tool submitted as a Pull Request must include:
1. **`tool.ts`**: The main execution code exporting a `ToolDefinition`.
2. **`README.md`**: Direct tool documentation and parameter descriptions.
3. **`example.json`**: An exact JSON mapping of sample inputs and expected outputs.
4. **`tests.ts`**: Self-contained unit tests using mocks where necessary to run instantly.
