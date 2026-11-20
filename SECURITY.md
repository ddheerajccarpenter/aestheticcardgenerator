# Security Policy & Architecture (`SECURITY.md`)

## 1. Overview & Architecture

**Aesthetic Card Generator (ACG)** is designed from the ground up as a **100% client-side, zero-backend creative tool**.
- No account registration or authentication credentials required.
- No remote databases storing user designs, quotes, or uploaded photos.
- All typography parsing, canvas rendering, color extraction, and high-resolution exports run exclusively within the user's browser sandbox.

Because ACG has no backend application server, the primary threat landscape focuses on client-side attacks: cross-site scripting (DOM XSS), prototype pollution via imported JSON schemas, malicious SVG payload execution, browser memory exhaustion (decompression bombs), canvas tainting, and storage corruption.

---

## 2. Trust Boundaries & Security Controls

### 2.1 Untrusted Input & DOM Sanitization
- **React-Native Escaping**: ACG avoids `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, and `eval()`. All dynamic typography and user quote text are compiled and rendered as escaped React node trees (`parseRichText`).
- **URL Parameter Hardening**: URL share parameters (`?q=...`, `?bg=...`) are strictly type-checked and sanitized via `sanitizeAndValidateCardState`. Color strings are validated against safe hexadecimal and RGB/HSL formats, stripping CSS injection vectors (`url()`, `expression()`). String lengths are clamped to prevent DOM bloat.

### 2.2 Prototype Pollution Prevention
- **Schema Validation (`src/services/schemaValidator.ts`)**:
  - `isPrototypePolluted`: Deep recursive inspection detects and blocks payloads containing `__proto__`, `constructor`, or `prototype` keys.
  - `safeJsonParse`: Utilizes a custom JSON reviver that deletes polluted property keys during parsing.
  - `sanitizeAndValidateCanvasDocument` & `sanitizeAndValidateCardState`: Validates all objects against strict whitelists:
    - Canvas dimensions clamped to safe integer ranges (`100px` to `16,384px`).
    - Layer counts strictly capped at 500 objects to protect against main-thread denial of service.
    - Image URLs strictly restricted to safe protocols (`data:image/`, `blob:`, `https://`, `/`), stripping `javascript:`, `vbscript:`, and `data:text/html`.

### 2.3 Image & SVG Upload Security (`src/services/imageSecurity.ts`)
- **File Size Ceiling**: Strictly capped at 10MB per image upload.
- **Magic Byte Verification**: Verifies binary signatures for all image uploads (PNG `89 50 4E 47`, JPEG `FF D8 FF`, GIF `47 49 46 38`, WebP `RIFF...WEBP`, AVIF `ftypavif`). Disguised executables or malformed payloads are rejected prior to rendering.
- **SVG Sanitization (`sanitizeSvgMarkup`)**:
  - Strips all `<script>`, `<foreignObject>`, `<iframe>`, `<embed>`, and `<object>` elements.
  - Strips all inline DOM event handlers (`onload`, `onerror`, `onclick`, `onmouseover`, etc.).
  - Strips `javascript:`, `vbscript:`, and `data:text/html` attribute values.
- **Decompression Bomb Protection**: Offscreen natural dimension verification limits images to 16,384px per axis and 67.1 Megapixels total.

### 2.4 Custom Font Validation (`src/services/customFontManager.ts`)
- Uploaded fonts (`.woff2`, `.woff`, `.ttf`, `.otf`) are capped at 15MB.
- Binary magic bytes are validated (`wOF2`, `wOFF`, `\x00\x01\x00\x00`, `OTTO`).
- Embedded safely in IndexedDB `AestheticCardStudioFontsDB` with sanitized family names.

### 2.5 Storage Quota & Safe Error Recovery (`src/services/storageManager.ts`)
- `safeLocalStorageSet`: Intercepts `QuotaExceededError` (or `NS_ERROR_DOM_QUOTA_REACHED`), automatically prunes legacy draft and temporary cache keys, and retries the write.
- Prevents unhandled exceptions from crashing React component trees in private browsing modes or quota-constrained mobile browsers.

### 2.6 Canvas Tainting & High-Res Export Recovery
- `dataUrlToBlob`: Synchronous, memory-efficient Base64-to-Blob decoding bypassing WebKit/Safari `fetch(dataUrl)` URL length constraints.
- Dedicated catch handlers in export pipelines classify failures (CORS/tainted canvas vs. memory allocation limits vs. network failure) to present actionable feedback to the user.

---

## 3. HTTP Security Headers & Content Security Policy (`public/_headers`)

Cloudflare Pages enforces strict edge headers across all served routes:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data: blob:; img-src 'self' data: blob: https:; connect-src 'self' https://openlibrary.org https://covers.openlibrary.org https://itunes.apple.com https://*.mzstatic.com data: blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

- **`frame-ancestors 'none'` & `X-Frame-Options: DENY`**: Eliminates clickjacking attacks.
- **`object-src 'none'`**: Disables Flash/Java/Silverlight browser plugins.
- **`X-Content-Type-Options: nosniff`**: Prevents MIME-type sniffing exploits.
- **`connect-src`**: Restricts network access strictly to self and verified metadata APIs (Open Library, iTunes/Apple Music).

---

## 4. Vulnerability Reporting

If you identify a security defect, please do not file a public issue on GitHub. Instead, report findings directly with reproduction steps and proof-of-concept payloads to the engineering maintainer.
