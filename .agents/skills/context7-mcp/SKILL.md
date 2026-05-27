---
name: context7-mcp
description: Use when the user asks about libraries, frameworks, API references, or needs code examples. Activates for setup questions, code generation involving libraries, or mentions of specific frameworks (React, Next.js, Drizzle, Tailwind, etc.).
---

When the user asks about libraries, frameworks, or needs code examples, use the **Context7 MCP** tools (`resolve-library-id`, `query-docs`) instead of relying on training data. No API key is required for the MCP server.

## When to use

- Setup or configuration questions ("How do I configure Next.js middleware?")
- Code involving libraries ("Write a Drizzle query for…")
- API references ("What are the Neon serverless driver options?")
- Version-specific framework questions

## How to fetch documentation

### 1. Resolve the library ID

Call `resolve-library-id` with:

- `libraryName`: library name from the question
- `query`: the user's full question (improves ranking)

### 2. Select the best match

Prefer exact name matches, higher benchmark scores, and version-specific IDs when the user names a version.

### 3. Fetch docs

Call `query-docs` with:

- `libraryId`: e.g. `/vercel/next.js`
- `query`: the specific question

### 4. Answer from fetched docs

Use current documentation and cite versions when relevant.

## Afenda priority

For tenancy, governed UI, package boundaries, and ARCH docs, use repo doctrine (`docs/architecture/`, `.cursor/rules/`) **before** Context7. See rule `afenda-external-context`.

Stack library hints: `.agents/stack-context.md`.
