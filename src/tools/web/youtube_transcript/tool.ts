import * as cheerio from 'cheerio';
import { ToolDefinition } from '../../../registry/registry.js';

function extractVideoId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  throw new Error(`Could not parse YouTube video ID from URL: ${url}`);
}

export const tool: ToolDefinition = {
  name: "web.youtube_transcript",
  description: "Extract text transcripts and captions with timestamps from a YouTube video URL.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL of the YouTube video."
      },
      languageCode: {
        type: "string",
        description: "The preferred language code for transcripts (e.g. 'en', 'es'). Defaults to 'en'.",
        default: "en"
      }
    },
    required: ["url"]
  },
  handler: async (args: { url: string; languageCode?: string }) => {
    const videoId = extractVideoId(args.url);
    const lang = args.languageCode || 'en';

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?});/);
    if (!playerResponseMatch) {
      // codeql[js/incomplete-url-substring-sanitization] - This is checking the raw HTML body to detect if YouTube redirected to a consent wall, not performing URL validation.
      if (html.includes("consent.youtube.com")) {
        throw new Error("YouTube redirected to a consent/cookie page. Scraper blocked.");
      }
      throw new Error("Could not find transcript player response metadata. Scraper might be rate-limited or blocked by YouTube.");
    }

    let playerResponse: any;
    try {
      playerResponse = JSON.parse(playerResponseMatch[1]);
    } catch (e: any) {
      throw new Error(`Failed to parse YouTube player metadata: ${e.message}`);
    }

    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || !Array.isArray(captionTracks) || captionTracks.length === 0) {
      throw new Error("No captions or transcripts are available for this video.");
    }

    let track = captionTracks.find((t: any) => t.languageCode === lang);
    if (!track) {
      track = captionTracks[0];
    }

    const trackUrl = track.baseUrl;
    if (!trackUrl) {
      throw new Error("Could not retrieve caption track URL.");
    }

    const xmlResponse = await fetch(trackUrl);
    if (!xmlResponse.ok) {
      throw new Error(`Failed to retrieve XML transcript from YouTube api: ${xmlResponse.status}`);
    }

    const xmlText = await xmlResponse.text();
    const $ = cheerio.load(xmlText, { xmlMode: true });

    const transcript: Array<{ start: number; duration: number; text: string }> = [];

    $('text').each((_, el) => {
      const start = parseFloat($(el).attr('start') || '0');
      const duration = parseFloat($(el).attr('dur') || '0');
      const text = $(el).text();
      transcript.push({
        start,
        duration,
        text: cheerio.load(text).text()
      });
    });

    const fullText = transcript.map(t => t.text).join(' ');

    return {
      videoId,
      languageCode: track.languageCode,
      languageName: track.name?.simpleText || track.languageCode,
      transcript,
      fullText
    };
  }
};
