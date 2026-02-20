import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

// Ensure browser globals are polyfilled for Node.js environment before parser imports
if (typeof global !== 'undefined') {
    if (!(global as any).DOMMatrix) {
        (global as any).DOMMatrix = class DOMMatrix { constructor() { } };
    }
    if (!(global as any).ImageData) {
        (global as any).ImageData = class ImageData { constructor() { } };
    }
    if (!(global as any).Canvas) {
        (global as any).Canvas = class Canvas { constructor() { } };
    }
    if (!(global as any).Image) {
        (global as any).Image = class Image { constructor() { } };
    }
    // Added navigator polyfill for some pdf.js versions
    if (!(global as any).navigator) {
        (global as any).navigator = { userAgent: 'node.js' };
    }
}

export async function parsePdf(buffer: Buffer): Promise<string> {
    try {
        // Load pdf-parse lazily to avoid issues during build-time static analysis
        const pdf = require('pdf-parse');

        console.log('Starting PDF extraction, buffer size:', buffer.length);
        const data = await pdf(buffer, {
            // Provide a custom pagerender to avoid the "n is not a function" error
            // which often occurs in Node environment with some pdf.js versions
            pagerender: async function (pageData: any) {
                const content = await pageData.getTextContent();
                return content.items
                    .map((item: any) => item.str)
                    .join(' ');
            }
        });
        console.log('PDF extraction successful, text length:', data.text?.length || 0);
        return data.text || '';
    } catch (error: any) {
        console.error('PDF Parse Error:', error);
        throw new Error(`PDF Extraction failed: ${error.message || 'Unknown error'}. Please ensure the file is not password-protected or corrupted.`);
    }
}

export async function parseDocx(buffer: Buffer): Promise<string> {
    try {
        console.log('Starting DOCX extraction, buffer size:', buffer.length);
        const result = await mammoth.extractRawText({ buffer });
        console.log('DOCX extraction successful, text length:', result.value?.length || 0);
        return result.value || '';
    } catch (error) {
        console.error('Docx Parse Error:', error);
        throw new Error('Could not extract text from DOCX. Ensure the file is not corrupted.');
    }
}

export async function parseUrl(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, and other non-content elements
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();

        const text = $('body').text();
        return text.replace(/\s+/g, ' ').trim();
    } catch (error: any) {
        console.error('URL Parse Error:', error);
        throw new Error(`Failed to parse URL: ${error.message}`);
    }
}
