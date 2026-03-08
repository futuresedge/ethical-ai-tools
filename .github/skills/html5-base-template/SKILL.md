# SKILL: html5-base-template

## Purpose
Produce a minimal, valid HTML5 base template on demand. Apply whenever an agent
must scaffold a standalone HTML file from scratch.

## Trigger phrases
- "html5 template"
- "html boilerplate"
- "base html file"
- "minimal html"
- "create html page"

## Steps
1. Load `references/template.md` — contains the canonical template and field rules.
2. Substitute values for any placeholders the user specifies (title, lang, charset).
3. Emit the completed template verbatim with no additional wrapping markup.
4. If any placeholder is unspecified, apply the defaults defined in `references/template.md`.

## Constraints
- Output only what is required for a conformant HTML5 document — no optional
  boilerplate (`<meta name="author">`, Open Graph tags, favicon links, etc.)
  unless explicitly requested.
- Never add a CSS framework link, JS bundle, or `<script>` tag unless the user
  asks for one.
- `charset` must always be `UTF-8`.
- The `<title>` element is mandatory — use the default if the user omits it.
- Void elements (`<meta>`, `<link>`) must not have a closing tag.

## References
- `references/template.md` — canonical template, placeholder table, defaults
