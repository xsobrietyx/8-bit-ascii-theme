# 8Bit/ASCII Theme

A retro Jekyll theme inspired by old-school terminals and BBS ASCII art.

## Features

- Terminal green-on-black color scheme
- Customizable ASCII art banner
- Minimal, lightweight layouts
- Build-time syntax highlighting with Rouge, including Cypher and other supported languages
- Shared responsive spacing, aligned header/footer, and keyboard-scrollable tables

## Usage

1. Install dependencies
2. Run `jekyll serve`
3. Open `http://127.0.0.1:4000`

See the runbook for full instructions.

## Layout and spacing

`assets/css/layout.css` loads after the palette stylesheet and keeps the same
700px reading column, fonts, and colours. It supplies consistent heading,
paragraph, list, code, and footer spacing for every palette. The decorative
binary banner wraps between groups on narrow screens; code preserves its
whitespace and scrolls inside its own block.

Hover over the binary banner to reveal its decoded text, `computer science`.
Keyboard focus reveals the same text. Both representations share a grid cell,
so switching between them preserves the banner's height and surrounding spacing.
The reveal uses CSS only; assistive technology receives the decoded label.

The default layout wraps rendered tables in focusable `.table-scroll` regions.
Wide tables scroll horizontally without making the entire page wider, and can
be scrolled with the keyboard. Content links are underlined; navigation keeps
the existing minimal appearance and indicates the current section. The blog
index omits a publication date because the list is continuously updated.

## Syntax highlighting

The shared head includes `assets/css/syntax.css` after the main stylesheet.
Jekyll's default Rouge highlighter generates the token markup during the build;
no browser JavaScript or extra Jekyll plugin is needed.

Add a language identifier to fenced code blocks:

````markdown
```cypher
MATCH (m:MemberOfParliament)-[:VOTED]->(s:VotingSession)
WHERE s.id = 'demo:rc:1'
RETURN m.name;
```

```bash
cypher-shell -u neo4j -f schema.cypher
```
````

Use the appropriate Rouge identifier, such as `go`, `rust`, `clojure`, `awk`,
`python`, `java`, `javascript`, `json`, `yaml`, or `sql`. Use `text` for diagrams
and terminal output that should remain plain. Unsupported language identifiers
fall back to plain text; the stylesheet does not add lexer support.

The default token colours match the Monochrome Minimal code background. The
Green Matrix and Cyber Dracula stylesheets set `--syntax-*` colour variables
for their dark backgrounds. Custom palettes can override those variables on
`body`. Token rules are scoped to `.highlight`, leaving inline code unchanged.

## Optional Google Analytics 4

Set a GA4 web stream's public Measurement ID in your site's `_config.yml`:

```yaml
analytics:
  ga4_measurement_id: "G-YOURSTREAMID"
  domains: "example.com,www.example.com"
  debug: false
```

The integration renders only with a nonempty ID and `JEKYLL_ENV=production`.
Its runtime also checks the ID, HTTPS, and allowed hostnames. Leave the ID
empty to keep collection off. Host a `/privacy/` page describing your setup.

Google's tag loads only after the visitor accepts analytics. Consent mode
defaults to denied, advertising consent stays denied, and Google Signals and
advertising personalization are disabled. Consent preferences last up to 180
days in local storage; analytics cookies are configured to last 90 days. A
footer control lets visitors change their preference. Withdrawing consent
disables tracking, clears accessible GA cookies, and reloads without the tag.
Global Privacy Control and an exposed Do Not Track preference keep tracking off.

Turn **Enhanced Measurement off** for this web stream in GA4 to prevent its
automatic click, scroll, and download events from overlapping with these
deliberate events. The Google tag sends the initial `page_view`; this script
does not send a second manual pageview. GA4's standard session and engagement
events remain available.

| Event | Meaning | Parameters |
| --- | --- | --- |
| `article_scroll` | A post's visible content reaches 25%, 50%, 75%, or 100%, once per milestone after consent | `percent_scrolled` |
| `asset_download` | A link to a same-site downloadable file is clicked, including CSV and Cypher files | `file_name`, `file_extension`, `link_url` |
| `outbound_click` | An HTTP(S) link to a hostname outside `domains` is clicked | `link_domain`, `link_url` |

Page, referrer, and custom link URLs exclude query strings and fragments.
No typed form values, selected text, or code contents are collected by the
custom events. Download clicks do not establish completed transfers, and
scrolling does not establish reading. Blocking the Google tag can reduce
reported traffic; the integration does not bypass browser blocking.

Exclude your own visits in each browser/site origin using its developer console:

```javascript
localStorage.setItem('hibernate.analytics-disabled', '1');
location.reload();
```

Remove that key to make analytics available again. For development verification,
use a production build with a test ID and intercept all Google requests; do not
send synthetic traffic to a real property. Set `analytics.debug: true` only for
intentional DebugView verification with your own real stream.
