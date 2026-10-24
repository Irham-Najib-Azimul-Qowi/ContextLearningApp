<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Depaskan Project-Wide Engineering Rules (Always-On)

Depaskan is a contextual learning platform for Indonesian elementary school (SD) materials and questions.
These rules apply to all AI coding agents working on this codebase.

## 1. Universal Engineering Rules
1. **Inspect Before Editing**: Read active code files and trace the data flow (`UI` -> `Local Repository` -> `API Sync` -> `Supabase`) before proposing or making changes.
2. **Strict YAGNI & Minimal Diffs**: Never introduce speculative abstractions, unnecessary generic wrappers, or unneeded dependencies. Solve problems with the minimum necessary code.
3. **Preserve Architectural Invariants**:
   - **Dual-Storage**: In-browser Local Repository (`lib/db/repository.ts`) provides offline capability; Supabase route (`app/api/sync/user-data/route.ts`) handles sync with tombstones to prevent resurrection.
   - **Deterministic > Probabilistic**: Local Knowledge Base (LKB) and rule-based processing take precedence over generative AI. Model output is treated as untrusted input.
   - **Math Preservation**: Mathematical quantities ($20 * 12.000 = 240.000$) and answer keys must never be altered during contextualization.
   - **Teacher Oversight**: AI outputs are drafts until reviewed and approved by teachers.
4. **Security & Privacy Invariants**:
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` or privileged secrets in client-side code (`NEXT_PUBLIC_*`).
   - Mask all API keys in UI and logs (`AIK...9xy`).
   - Protect student privacy; minimize child PII collection.
5. **Quality Gates Invariance**:
   - Never weaken, delete, or skip existing tests. The 97-test baseline (14 suites) must always pass 100%.
   - Maintain zero ESLint errors and strict TypeScript compliance.
6. **Honest & Transparent Reporting**:
   - Conclude every response modifying or reviewing code with what was verified, what was skipped, verified facts vs assumptions, and remaining risks.

## 2. Specialized Project Skills (.agents/skills/)
Load specific skills on-demand when working on targeted domains:
- **`depaskan-engineering`**: Core architecture, Kurikulum Merdeka SD, LKB Madiun Raya, room lifecycle.
- **`disciplined-engineering`**: Minimalist engineering, Ponytail principles, data-flow tracing, YAGNI.
- **`frontend-ui-engineering`**: UI components, accessibility (WCAG 2.1 AA), responsive layouts, 5 essential states.
- **`secure-coding-supabase`**: Authentication, RLS policies, dual-storage sync, secret masking, student privacy.
- **`testing-quality-gates`**: Node.js test runner, regression assertions, quality gate execution, TDD.
- **`ai-evaluation-provenance`**: Gemini AI workflows, math preservation, transformation provenance metadata.
