# web.extract_links

Scrape a webpage and extract all links with their anchor text, categorizing them as internal or external.

## Usage

Provide the `url` of the web page to scrape.

### Input Schema

- `url` (string, required): The URL of the webpage to scrape links from.
- `ignoreAnchorOnly` (boolean, optional): If true, ignores anchor-only links. Defaults to true.
