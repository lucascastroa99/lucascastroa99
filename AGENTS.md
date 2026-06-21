# AGENTS.md

## Project Overview

GitHub profile README generator. Uses Nunjucks templates and YAML data files to produce bilingual (Portuguese/English) Markdown READMEs for the user's GitHub profile.

- **Primary output:** `README.md` (PT) and `README-EN.md` (EN)
- **Tech stack:** Node.js (ESM), Nunjucks templating, YAML data
- **Data source:** Synced from external `curriculum-vitae` repo via GitHub raw content

## Architecture

```
GitHub Profile/
├── data/              # YAML data files (personal info, resume, shared config)
├── templates/         # Nunjucks templates for Markdown generation
├── scripts/           # Build scripts (sync + generate)
├── images/            # Static assets (memoji)
├── README.md          # Generated output (Portuguese)
└── README-EN.md       # Generated output (English)
```

## Directory Structure

| Directory | Purpose | Files |
|-----------|---------|-------|
| `data/` | Source data | `personal.yaml`, `resume.yaml`, `common.yaml` |
| `templates/` | Nunjucks templates | `readme.njk`, `readme-en.njk`, `common.njk` |
| `scripts/` | Build automation | `sync-professional-data.js`, `generate-markdown-readme.js` |
| `images/` | Static assets | `personal-memoji.png` |

## Development Workflow

1. Edit YAML files in `data/` to update profile information
2. Run `pnpm build` to sync remote data and regenerate READMEs
3. Commit updated `README.md` and `README-EN.md` to GitHub

## Setup Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Full rebuild (sync + generate)
pnpm sync             # Sync data from remote curriculum-vitae repo only
pnpm generate         # Generate READMEs from local data only
```

## Build Process

- `pnpm build` runs sequentially: `sync-professional-data.js` → `generate-markdown-readme.js`
- `sync-professional-data.js` fetches `personal.yaml` and `resume.yaml` from GitHub raw content (`lucascastroa99/curriculum-vitae` repo, `main` branch)
- `generate-markdown-readme.js` parses all YAML files, renders Nunjucks templates, normalizes Markdown output, and writes `README.md` / `README-EN.md`

## Code Style and Conventions

- **ESM modules** (`"type": "module"` in `package.json`)
- **Node.js built-in imports** use `node:` prefix (`node:fs`, `node:path`)
- **Nunjucks templates** use `{%- -%}` for whitespace control
- **YAML data** supports bilingual fields via `{ en: "...", pt: "..." }` object structure
- **Common macros** live in `templates/common.njk`, imported as `c` in locale templates

## Key Patterns

### Bilingual Fields
```yaml
position:
  en: Full Stack Developer
  pt: Desenvolvedor Full Stack
```

### Template Filters
- `field(lang)` — resolve bilingual field
- `phone(lang)` — format phone number with country code
- `formatDate(lang)` — format date with localized month names
- `skillDetails(lang)` — resolve skill description
- `split(sep)`, `replace(search, replacement)` — string utilities

## Testing Instructions

No test suite exists. Verify by:

```bash
pnpm build                    # Should complete without errors
diff README.md README-EN.md   # Confirm both files generated
```

Check output manually for:
- Correct bilingual field resolution
- Proper date formatting (month names in correct language)
- Phone number formatting
- Badge rendering and links

## Build and Deployment

- **Build:** `pnpm build` generates both README files locally
- **Deploy:** Push updated `README.md` / `README-EN.md` to GitHub
- **CI/CD:** None configured — manual build and push workflow
- **Data sync:** Run `pnpm sync` before build to pull latest profile data from remote repo

## Agent Rules

- Always edit YAML data files (`data/`) to change profile content, not the generated READMEs
- Never modify `templates/common.njk` without understanding both PT and EN template rendering
- After editing templates, run `pnpm generate` to regenerate READMEs
- After editing YAML data, run `pnpm build` (includes sync) to ensure consistency
- Generated files (`README.md`, `README-EN.md`) should not be manually edited — they will be overwritten on next build

## Additional Notes

- `common.yaml` contains badge configurations and skill icon mappings (using `skills.syvixor.com` API)
- GitHub stats use `github-profile-summary-cards.vercel.app` API
- Visitor counter uses `komarev.com` service
- Resume PDFs are hosted in the external `curriculum-vitae` repo
