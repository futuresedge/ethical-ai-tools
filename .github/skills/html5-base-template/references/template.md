# HTML5 Base Template — Reference

## Canonical template

```html
<!DOCTYPE html>
<html lang="{{lang}}">
  <head>
    <meta charset="{{charset}}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
  </head>
  <body>
    {{body}}
  </body>
</html>
```

## Placeholder table

| Placeholder | Default        | Rules                                              |
|-------------|----------------|----------------------------------------------------|
| `{{lang}}`  | `en`           | BCP 47 language tag (e.g. `en`, `en-US`, `fr`)    |
| `{{charset}}`| `UTF-8`       | Always `UTF-8` — do not change                     |
| `{{title}}` | `Document`     | Plain text; no HTML entities unless required       |
| `{{body}}`  | _(empty)_      | Omit the placeholder line when body is empty       |

## Minimum required elements

| Element | Reason |
|---|---|
| `<!DOCTYPE html>` | Triggers standards mode in all browsers |
| `<html lang="…">` | Required for accessibility and i18n |
| `<meta charset="UTF-8">` | Must appear within the first 1024 bytes |
| `<meta name="viewport" …>` | Prevents mobile browsers scaling the layout |
| `<title>` | Required by the HTML5 spec; used by browsers and assistive tech |
| `<body>` | Explicit body avoids parser quirks |

## What is intentionally excluded from the minimum template

The following are valid but non-minimum — only add when explicitly requested:

- `<meta name="description">`
- `<link rel="icon">`
- `<link rel="stylesheet">`
- `<script>`
- Open Graph / Twitter Card meta tags
- `<base>`, `<noscript>`, `<template>`

## Conformance notes

- The `charset` declaration must appear before `<title>` so the browser reads
  the encoding before parsing any text content.
- Void elements (`<meta>`, `<link>`) must not be self-closed (`<meta />`) in
  HTML5 — omit the trailing slash.
- `<!DOCTYPE html>` is case-insensitive but lowercase is conventional.
