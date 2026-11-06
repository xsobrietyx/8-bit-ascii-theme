# 8Bit/ASCII Theme

A retro Jekyll theme inspired by old-school terminals and BBS ASCII art.

## Features

- Terminal green-on-black color scheme
- Customizable ASCII art banner
- Minimal, lightweight layouts
- Build-time syntax highlighting with Rouge, including Cypher and other supported languages

## Usage

1. Install dependencies
2. Run `jekyll serve`
3. Open `http://127.0.0.1:4000`

See the runbook for full instructions.

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
