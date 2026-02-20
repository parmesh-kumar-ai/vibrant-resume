import { NextRequest, NextResponse } from 'next/server';

// Force the route to be dynamic to prevent build-time static analysis
export const dynamic = 'force-dynamic';

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
    if (!(global as any).navigator) {
        (global as any).navigator = { userAgent: 'node.js' };
    }
}

import { parsePdf, parseDocx, parseUrl } from '@/lib/parser';

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';

        let text = '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('file') as File;

            if (!file) {
                return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const type = file.type;
            const filename = file.name.toLowerCase();

            console.log(`Parsing file: ${filename}, type: ${type}, size: ${buffer.length}`);

            if (type === 'application/pdf' || filename.endsWith('.pdf')) {
                text = await parsePdf(buffer);
            } else if (
                type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                type === 'application/msword' ||
                filename.endsWith('.docx') ||
                filename.endsWith('.doc')
            ) {
                text = await parseDocx(buffer);
            } else if (filename.endsWith('.txt') || type === 'text/plain') {
                text = buffer.toString('utf-8');
            } else {
                return NextResponse.json({
                    success: false,
                    error: `Unsupported file type: ${type || 'unknown'}. Please upload PDF, DOCX, or TXT.`
                }, { status: 400 });
            }

        } else if (contentType.includes('application/json')) {
            const body = await req.json();
            const { url } = body;

            if (!url) {
                return NextResponse.json({ success: false, error: 'No URL provided' }, { status: 400 });
            }

            text = await parseUrl(url);
        } else {
            return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 400 });
        }

        return NextResponse.json({ success: true, text });

    } catch (error: any) {
        console.error('Error parsing content:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process content: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
