import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isPrototypePolluted,
  safeJsonParse,
  sanitizeUrl,
  sanitizeColor,
  sanitizeAndValidateCanvasDocument,
  sanitizeAndValidateCardState,
} from '../src/services/schemaValidator.ts';

import {
  MAX_IMAGE_FILE_SIZE_BYTES,
  validateImageMagicBytes,
  sanitizeSvgMarkup,
  dataUrlToBlob,
} from '../src/services/imageSecurity.ts';

import {
  safeLocalStorageSet,
  safeLocalStorageGet,
} from '../src/services/storageManager.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Prototype Pollution Resilience', () => {
  // Test detection of direct __proto__ injection
  const maliciousPayload1 = JSON.parse('{"__proto__": {"admin": true}}');
  assert.equal(isPrototypePolluted(maliciousPayload1), true, 'Direct __proto__ must be detected');

  // Test detection of nested constructor pollution
  const maliciousPayload2 = {
    nested: {
      constructor: { prototype: { polluter: true } },
    },
  };
  assert.equal(isPrototypePolluted(maliciousPayload2), true, 'Nested constructor pollution must be detected');

  // Clean object
  const cleanPayload = { id: 'doc-1', title: 'My Card', objects: [] };
  assert.equal(isPrototypePolluted(cleanPayload), false, 'Clean object must pass');

  // safeJsonParse strips pollution
  const parsed = safeJsonParse<any>('{"title": "Safe", "__proto__": {"evil": true}}');
  assert.ok(parsed, 'Parsed object should not be null');
  assert.equal(parsed.title, 'Safe');
  assert.equal(Object.prototype.hasOwnProperty.call(parsed, '__proto__'), false);
  assert.equal((Object.prototype as any).evil, undefined, 'Global prototype must not be polluted');

  // safeJsonParse returns null on syntax error without throwing
  const corrupt = safeJsonParse('{{{ invalid json');
  assert.equal(corrupt, null, 'Invalid JSON must return null');
});

test('Canvas Document Schema Validation & Boundary Hardening', () => {
  // Reject null or polluted input
  assert.equal(sanitizeAndValidateCanvasDocument(null), null);
  assert.equal(sanitizeAndValidateCanvasDocument(JSON.parse('{"__proto__": {"hacked": true}}')), null);

  // Clamps extreme dimensions
  const extremeDoc = {
    canvasWidth: 99999999,
    canvasHeight: -500,
    background: 'url(javascript:alert(1))',
    objects: [],
  };
  const sanitizedExtreme = sanitizeAndValidateCanvasDocument(extremeDoc);
  assert.ok(sanitizedExtreme);
  assert.equal(sanitizedExtreme.canvasWidth, 16384, 'Extreme width clamped to 16,384');
  assert.equal(sanitizedExtreme.canvasHeight, 100, 'Negative height clamped to 100 minimum');
  assert.equal(sanitizedExtreme.background, '#191715', 'Malicious CSS background reset to safe color');

  // Strips malicious image URLs (javascript:, data:text/html)
  const docWithMaliciousLayers = {
    canvasWidth: 1200,
    canvasHeight: 630,
    objects: [
      {
        id: 'layer-evil-1',
        type: 'image',
        src: 'javascript:alert(document.domain)',
      },
      {
        id: 'layer-evil-2',
        type: 'image',
        src: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      },
      {
        id: 'layer-valid',
        type: 'image',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA=',
        width: 100,
        height: 100,
      },
    ],
  };
  const sanitizedLayers = sanitizeAndValidateCanvasDocument(docWithMaliciousLayers);
  assert.ok(sanitizedLayers);
  assert.equal(sanitizedLayers.objects.length, 1, 'Only safe image layer preserved; malicious URIs stripped');
  assert.equal(sanitizedLayers.objects[0].id, 'layer-valid');

  // Object limit (cap at 500)
  const bloatedDoc = {
    canvasWidth: 800,
    canvasHeight: 800,
    objects: Array.from({ length: 650 }, (_, i) => ({
      id: `layer-${i}`,
      type: 'text',
      text: `Item ${i}`,
    })),
  };
  const sanitizedBloat = sanitizeAndValidateCanvasDocument(bloatedDoc);
  assert.ok(sanitizedBloat);
  assert.equal(sanitizedBloat.objects.length, 500, 'Objects capped at 500 layers to protect against DOM freeze');
});

test('CardState Schema Validation & Color Sanitization', () => {
  // Test sanitizeUrl
  assert.equal(sanitizeUrl('javascript:alert(1)'), '', 'javascript: URI must be stripped');
  assert.equal(sanitizeUrl('data:text/html;base64,PHNjcmlwdD4='), '', 'data:text/html must be stripped');
  assert.equal(sanitizeUrl('https://images.unsplash.com/photo.jpg'), 'https://images.unsplash.com/photo.jpg');

  // Test sanitizeColor
  assert.equal(sanitizeColor('red; background: url(evil)'), '#191715');
  assert.equal(sanitizeColor('#c69d78'), '#c69d78');
  assert.equal(sanitizeColor('transparent'), 'transparent');

  // Test URL parameter and draft state sanitization
  const rawState = {
    docTitle: '<script>alert(1)</script>Editorial Notes',
    quote: 'A'.repeat(10000), // Exceeds limit
    bgColor: '#191715',
    inkColor: 'expression(alert(1))',
    fontSize: 5000,
    padding: -50,
    aspectRatio: 'invalid-ratio',
  };

  const clean = sanitizeAndValidateCardState(rawState);
  assert.ok(clean);
  assert.equal(clean.docTitle, 'alert(1)Editorial Notes', 'HTML tags stripped from docTitle');
  assert.ok(clean.quote.length <= 5000, 'Quote string length strictly capped');
  assert.equal(clean.bgColor, '#191715');
  assert.equal(clean.inkColor, '#efe6d8', 'Invalid ink expression color reset to neutral');
  assert.equal(clean.fontSize, 120, 'Font size clamped to 120 max');
  assert.equal(clean.padding, 16, 'Padding clamped to 16 min');
  assert.equal(clean.aspectRatio, '1:1', 'Invalid aspect ratio normalized to 1:1');
});

test('Image Security, Magic Bytes & SVG Sanitization', () => {
  // Magic bytes: PNG
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).buffer;
  assert.equal(validateImageMagicBytes(pngHeader).valid, true);
  assert.equal(validateImageMagicBytes(pngHeader).detectedMime, 'image/png');

  // Magic bytes: JPEG
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).buffer;
  assert.equal(validateImageMagicBytes(jpegHeader).valid, true);
  assert.equal(validateImageMagicBytes(jpegHeader).detectedMime, 'image/jpeg');

  // Magic bytes: Invalid / Executable disguise (.exe / ELF)
  const exeHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]).buffer;
  assert.equal(validateImageMagicBytes(exeHeader).valid, false, 'Executable signature must be rejected');

  // SVG Sanitization: Eliminates <script>, event handlers, foreignObject, javascript: URIs
  const dirtySvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" onload="alert('pwned')">
      <!-- Hidden comment -->
      <script>fetch('/steal?cookie=' + document.cookie);</script>
      <circle cx="50" cy="50" r="40" fill="red" onclick="alert(1)" onmouseover="eval('bad')" />
      <foreignObject width="100" height="100">
        <iframe src="https://evil.com"></iframe>
      </foreignObject>
      <a href="javascript:void(0)"><text>Click</text></a>
    </svg>
  `;

  const safeSvg = sanitizeSvgMarkup(dirtySvg);
  assert.equal(safeSvg.includes('<script'), false, 'All script tags removed');
  assert.equal(safeSvg.includes('onload'), false, 'onload handler removed');
  assert.equal(safeSvg.includes('onclick'), false, 'onclick handler removed');
  assert.equal(safeSvg.includes('onmouseover'), false, 'onmouseover handler removed');
  assert.equal(safeSvg.includes('foreignObject'), false, 'foreignObject removed');
  assert.equal(safeSvg.includes('iframe'), false, 'iframe removed');
  assert.equal(safeSvg.includes('javascript:'), false, 'javascript: URI removed');
  assert.ok(safeSvg.includes('<circle'), 'Valid SVG elements preserved');

  // Fast DataURL to Blob conversion
  const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const blob = dataUrlToBlob(testDataUrl);
  assert.equal(blob.type, 'image/png');
  assert.ok(blob.size > 0, 'Blob size must be positive');
  assert.equal(MAX_IMAGE_FILE_SIZE_BYTES, 10 * 1024 * 1024, 'Max image upload limit must be 10MB');
});

test('Storage Resilience & Quota Fallback', () => {
  // In node environment without window.localStorage, must return null or fail-safe object without throw
  const val = safeLocalStorageGet('test_key');
  assert.equal(val, null, 'Must return null safely when storage unavailable');

  const setRes = safeLocalStorageSet('test_key', 'test_val');
  assert.equal(setRes.success, false, 'Must fail-safe when storage unavailable');
});

test('HTTP Security Headers & Content Security Policy in public/_headers', () => {
  const headersPath = path.join(rootDir, 'public', '_headers');
  assert.ok(fs.existsSync(headersPath), 'public/_headers must exist');

  const content = fs.readFileSync(headersPath, 'utf8');

  // Check CSP
  assert.ok(content.includes('Content-Security-Policy:'), 'Must define Content-Security-Policy');
  assert.ok(content.includes("object-src 'none'"), "CSP must disallow plugins (object-src 'none')");
  assert.ok(content.includes("frame-ancestors 'none'"), "CSP must prevent clickjacking (frame-ancestors 'none')");
  assert.ok(content.includes("base-uri 'self'"), "CSP must restrict base-uri");

  // Check standard OWASP headers
  assert.ok(content.includes('X-Content-Type-Options: nosniff'), 'Must enforce nosniff');
  assert.ok(content.includes('X-Frame-Options: DENY'), 'Must enforce DENY for legacy framing');
  assert.ok(content.includes('Referrer-Policy: strict-origin-when-cross-origin'), 'Must enforce Referrer-Policy');
  assert.ok(content.includes('Permissions-Policy:'), 'Must restrict browser permissions');
});
