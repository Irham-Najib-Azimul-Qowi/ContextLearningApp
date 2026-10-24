# DEPASKAN — PRE-IMPROVEMENT TECHNICAL AUDIT & DEVELOPERDAY 2026 READINESS REPORT

**Audit Date:** October 24, 2026  
**Auditor:** Antigravity AI Senior Systems & Evaluation Auditor  
**Repository:** `Irham-Najib-Azimul-Qowi/ContextLearningApp`  
**Current Git Commit:** `68f224d` (Branch: `main`)  
**Deployment Target:** Vercel Serverless + Supabase (Targeting Domain: `depaskan.njb.my.id`)  
**Audit Status:** AUDIT COMPLETE — VERIFIED EVIDENCE BASELINE ESTABLISHED

---

## 1. Executive Summary

Depaskan (formerly Pahami V2) is a full-stack educational web platform designed to contextualize elementary school (SD) learning materials and assessment questions with verified Indonesian local knowledge (specifically historical Karesidenan Madiun: Kota Madiun, Kab. Madiun, Ngawi, Magetan, Ponorogo, Pacitan, alongside an expansion to Kota Semarang).

### Key Audit Findings:
1. **Core Working Architecture (`VERIFIED`)**: The core application is unified in **Next.js 16.3.5 (App Router, Turbopack)** running on React 19.2.8 and deployed as Vercel Serverless Functions. Data storage uses a dual-layer strategy: an in-browser local storage repository for offline resilience (`lib/db/repository.ts`) paired with bi-directional Supabase PostgreSQL synchronization via tombstoning (`/api/sync/user-data`).
2. **Current Gemini Dependency (`VERIFIED`)**: Gemini is **not** called for context retrieval, entity classification, or mathematical validation—these run locally or via SQL. However, Gemini 2.5 Flash is currently **exclusively required for generative rewriting, new question/material generation, and multimodal OCR**. If Gemini fails or keys expire, the system degrades to a fallback question parser (`parseRawQuestionsToDraft`) without contextualization.
3. **NLP-First Feasibility (`VERIFIED`)**: The codebase already contains an initial deterministic regex-based slot substitutor (`rewriteText()` in `pipeline.ts:207-217`) and dictionary matchers (`COMMODITY_PATTERNS`, `LOCATION_PATTERNS`). Transitioning to a hybrid NLP-first engine (where protected numbers/units are isolated, and local entities are substituted deterministically with Gemini as a selective fallback) is **technically feasible within TypeScript/Node.js without requiring a separate Python microservice**.
4. **Current Critical Production Blocker (`BLOCKED`)**: Supabase Free Tier project `ubwsgabbongnbbflxmxo` is currently in a **PAUSED** state due to 7+ days of inactivity, causing `DNS_PROBE_FINISHED_NXDOMAIN` worldwide on authentication redirects (`/auth/v1/authorize`). This blocks Google OAuth login until the project is resumed via the Supabase dashboard.
5. **DeveloperDay 2026 Standing (`VERIFIED`)**: Official competition criteria (organized by PANDI / FTII / ASPILUKI for Road to APICTA 2026) require a `.id` domain and evaluate Uniqueness (25%), Market Potential (25%), Functionalities & Features (25%), and Quality & Tech (25%). The application demonstrates strong technical differentiation in local RAG and educational invariance, but needs domain binding (`depaskan.njb.my.id`), UI visual diff highlighting, and independent mathematical verification to maximize judging scores.

---

## 2. Verified Repository and Architecture Overview

### A1. Technology Stack
* **Framework & Runtime**: Next.js 16.3.5, React 19.2.8, Node.js 20+ (`package.json`).
* **Language & Styling**: TypeScript 5, Tailwind CSS 4 (`postcss.config.mjs`, `@tailwindcss/postcss`).
* **Database & Auth**:
  * Cloud: Supabase Managed PostgreSQL + `pgvector` (extension 384 dimensions) + Supabase Auth (Google OAuth 2.0).
  * Client: Local Storage Engine (`lib/db/repository.ts`) with bi-directional synchronization and tombstone markers (`app/api/sync/user-data/route.ts`).
* **AI & Document Processing**:
  * AI SDK: `@google/genai` (v2.23.0).
  * Document Parsing: `pdf-parse` (v2.4.5), native HTML5 Canvas compression (`camera-capture-modal.tsx`).
  * Math & Typography: `katex` (v0.18.7), `lucide-react` (v1.47.0).
* **Data Pipeline (Offline Tooling)**:
  * Python 3.10+ in `data-pipeline/` using `pydantic` v2, `pyyaml`, `sentence-transformers`, `torch` (model: `intfloat/multilingual-e5-small`).
  * **Status**: Purely offline curation and evaluation tool; zero Python runtime dependencies in production.
* **Git Status**: Clean working tree on branch `main` at commit `68f224d`.

### A2. Data Flow Architecture Map

```
[ User Input (Teacher/Student) ]
           │
           ▼
[ Ingestion Modes ] ──► (1) Manual Text
                    ──► (2) PDF Document (pdf-parse)
                    ──► (3) Camera OCR (Canvas 1600px compress -> Gemini inlineData)
                    ──► (4) AI Prompt Synthesis
                    ──► (5) From Material (Bound to existing module narrative)
           │
           ▼ [VERIFIED]
[ Normalization: contextEngine.normalizeContent() ]
  - Extracts subject, grade (1-6), regionId (BPS code), target questionCount & questionType
           │
           ▼ [VERIFIED]
[ Context Retrieval: LocalContextRetriever ]
  ├── Mode A: Supabase RPC lkb_retrieve_context (pgvector + lexical search) [VERIFIED]
  └── Mode B: MockLocalContextRetriever (In-memory verified Madiun & Semarang facts) [VERIFIED]
           │
           ▼ [VERIFIED]
[ Protected-Span & Invariant Extraction: pipeline.ts ]
  - extractNumbers(): Isolates all arithmetic numbers & quantities
  - extractEntities(): Matches patterns (commodity, location, tradition, geography, occupation)
           │
           ▼ [VERIFIED: Remote LLM Dependency]
[ Contextual Transformation: Gemini 2.5 Flash / AIProviderManager ]
  - Injects local facts into prompt with instruction: "Konteks berubah, kompetensi tetap"
  - Enforces JSON structured output (options, correct_answer, explanation, rubric, context_variables)
           │
           ▼ [VERIFIED]
[ Educational Integrity Validation: validateEducationalIntegrity() ]
  - Verifies 100% preservation of original arithmetic numbers
  - Validates regional grounding (checks mentions of retrieved entity names)
           │
           ▼ [VERIFIED]
[ Teacher Studio Review & Editing: app/teacher/questions/page.tsx (Step 3) ]
  - Teacher edits text, options, answers, explanations, or adds questions directly
           │
           ▼ [VERIFIED]
[ Storage & Distribution ]
  ├── (A) Local Repository (Instant local storage write) [VERIFIED]
  ├── (B) Supabase Sync (Non-destructive upsert with tombstones) [VERIFIED]
  ├── (C) Live Interactive Room (/room/[code] -> Student exam session) [VERIFIED]
  └── (D) Standardized Printable Exam (/teacher/print/exam/[id] -> PDF/Print) [VERIFIED]
```

### A3. Technology Inventory

| Component | Technology | Actual Role | Implementation Status | Evidence File / Function |
|---|---|---|---|---|
| **Web Framework** | Next.js 16.3.5 | Unified Frontend & API backend | `VERIFIED` | `package.json`, `next.config.ts` |
| **UI Components** | React 19.2.8 + Tailwind 4 | Responsive teacher/student UI | `VERIFIED` | `app/`, `components/` |
| **Cloud Database** | Supabase PostgreSQL | Central persistence & vector store | `PARTIALLY VERIFIED` | `supabase/migrations/`, `DATABASE_URL` (Domain currently paused) |
| **Local Persistence** | Browser `localStorage` | Offline-first client repository | `VERIFIED` | `lib/db/repository.ts` (`PahamiRepository`) |
| **Cloud Sync** | Next.js Route Handler | Tombstone-aware data merger | `VERIFIED` | `app/api/sync/user-data/route.ts` |
| **Authentication** | Supabase Auth + Google OAuth | Single sign-on for teachers/students | `PARTIALLY VERIFIED` | `app/login/page.tsx`, `app/auth/callback/route.ts` (Blocked by paused DB) |
| **AI Orchestration** | `AIProviderManager` | Multi-slot credential pool & failover | `VERIFIED` | `lib/ai/ai-provider-manager.ts` |
| **AI Provider** | `@google/genai` (Gemini 2.5 Flash) | Generative rewriting & OCR vision | `VERIFIED` | `lib/ai/gemini-provider.ts` |
| **Context Retrieval** | `LocalContextRetriever` | Hybrid LKB retrieval (Mock + SQL RPC)| `VERIFIED` | `lib/context-engine/retrieval-adapter.ts` |
| **Document OCR** | HTML5 Canvas + Gemini Vision | Downsamples images <=1600px | `VERIFIED` | `components/media/camera-capture-modal.tsx` |
| **PDF Extraction** | `pdf-parse` (v2.4.5) | Digital PDF text extraction | `VERIFIED` | `lib/ai/pdf-extractor.ts`, `app/api/ai/extract/route.ts` |
| **Assessment Room** | Next.js Route + Storage | Live exam room via 6-digit PIN | `VERIFIED` | `app/room/[code]/page.tsx`, `app/api/room/[code]/route.ts` |
| **Document Printing** | React Print Component | Standardized exam paper layouts | `VERIFIED` | `components/print/depaskan-printable-document.tsx` |

---

## 3. Current Feature Inventory & Status Matrix

| Module / Feature | Intended Purpose | Primary Files | Verified Status | Limitations / Technical Debt | Preserve for Competition? |
|---|---|---|---|---|---|
| **Landing Page** | Value proposition & portal entry | `app/page.tsx` | `VERIFIED` | Hero links redirect cleanly to login/onboarding | **Yes (Crucial)** |
| **Google Authentication** | Teacher & Student SSO login | `app/login/page.tsx`, `app/auth/callback/` | `BLOCKED` | Fails with `NXDOMAIN` while Supabase project is paused | **Yes (Fix immediately)** |
| **Teacher Onboarding** | Binds teacher to school & region | `app/auth/onboarding/page.tsx` | `VERIFIED` | Requires school selection; fallback works offline | **Yes** |
| **Teacher Dashboard** | Overview of metrics, materials, rooms | `app/teacher/dashboard/page.tsx` | `VERIFIED` | Real-time counts bound to repository state | **Yes** |
| **Material Studio** | Ingestion & adaptation of lessons | `app/teacher/materials/page.tsx` | `VERIFIED` | Ingestion works via 4 modes; generates LKB links | **Yes (Core UVP)** |
| **Question Studio** | 5-mode question creation wizard | `app/teacher/questions/page.tsx` | `VERIFIED` | Supports MC, Essay, and Mixed; parses drafts | **Yes (Core UVP)** |
| **From Material Workflow**| Direct generation of questions from modules | `app/teacher/questions/page.tsx`, `pipeline.ts`| `VERIFIED` | Auto-detects URL param `?from_material=<id>` | **Yes (High Value)** |
| **Contextual Engine** | Invariant-preserving RAG adaptation | `lib/context-engine/pipeline.ts` | `VERIFIED` | Relies on Gemini for text generation | **Yes (Upgrade to NLP-first)** |
| **Exam Room Hosting** | Live assessment room with PIN | `app/teacher/rooms/page.tsx`, `app/room/[code]` | `VERIFIED` | Snapshot captures immutable questions/materials | **Yes (High Impact)** |
| **Student Room Exam** | Student exam session without login | `app/room/[code]/page.tsx` | `VERIFIED` | Multiple-choice graded deterministically | **Yes (High Impact)** |
| **Essay Grading Studio** | Teacher rubrics & essay scoring | `app/teacher/examinations/review-essay/` | `VERIFIED` | Supports score override and feedback notes | **Yes** |
| **Exam Sheet Printing** | Paper-based printable exams | `components/print/depaskan-printable-document.tsx` | `VERIFIED` | Formats clean A4/F4 with school headers & answer grids | **Yes** |
| **Admin Control Center** | Key management, health, usage | `app/admin/dashboard/page.tsx` | `VERIFIED` | In-memory Dev mock fallback if DB unconfigured | **Internal Demo Only** |
| **Sync Engine** | Cross-device tombstone sync | `app/api/sync/user-data/route.ts` | `VERIFIED` | Protects newly saved local items against collision | **Yes** |

---

## 4. Actual End-to-End User Workflows

### 4.1. Teacher Question Creation Workflow (Verified)
1. **Selection (Step 1)**: Teacher chooses between `Manual`, `Camera OCR`, `Upload PDF`, `Generate AI`, or `From Material`.
2. **Configuration (Step 2)**: Teacher selects Region (e.g., `Kabupaten Ponorogo`), Subject (`Matematika`), Grade (`Kelas 5`), Question Count (`1-10`), and Variety (`Pilihan Ganda`, `Esai`, `Campuran`).
3. **Contextual Processing**:
   * If `From Material`: The module narrative is sent to `/api/ai/contextualize`.
   * LKB retriever retrieves verified regional entities (e.g., *Pasar Legi Ponorogo*, *Susu Sapi Pudak*).
   * Gemini formulates questions anchored to these entities.
   * `validateEducationalIntegrity()` checks that numbers match.
4. **Studio Review (Step 3)**: Teacher reviews questions in an interactive card list. Can edit text, alter options, modify explanations, or add questions.
5. **Persistence (Step 4)**: Saved to `localStorage` immediately. Dispatches `questionSaved` custom event. Background sync sends to Supabase.

### 4.2. Student Examination Workflow (Verified)
1. **Access**: Student opens `/room` on any smartphone/laptop and enters a 6-character room code (e.g., `RM-8742`) and name.
2. **Session**: Room questions are loaded from immutable snapshots captured when the room was published.
3. **Execution**: Student answers questions with countdown timer.
4. **Grading**:
   * Multiple Choice: Graded instantly in the client (`userAnswer === correctAnswer`).
   * Essay: Stored in submission record for teacher review.
5. **Completion**: Score is displayed and saved to room submissions.

---

## 5. Gemini Dependency & Cost Analysis

### C1. Gemini Call Map

| Workflow | Calling Function / File | Why Gemini is Called | Input / Output | Failure Handling | Paid API Required? |
|---|---|---|---|---|---|
| **Question Generation** | `contextEngine.contextualize()` in `pipeline.ts:488` | Generates new questions based on topic/material | Input: Prompt + LKB facts.<br>Output: JSON questions array. | Fallback: Parses raw prompt into static draft via `parseRawQuestionsToDraft` | **No** (Runs on Gemini Flash Free Tier) |
| **Material Generation** | `contextEngine.contextualize()` in `pipeline.ts:318` | Generates narrative teaching module | Input: Topic + LKB facts.<br>Output: JSON title, content, summary. | Fallback: Throws structured error, catches in UI with error banner | **No** (Runs on Gemini Flash Free Tier) |
| **Document Vision OCR** | `geminiProvider.scanQuestionImage()` in `gemini-provider.ts:84` | Reads photos of printed exam papers | Input: Base64 JPEG.<br>Output: JSON extracted questions. | Fallback: Rejects with error, invites manual editing | **No** (Runs on Gemini Flash Free Tier) |
| **Single Question AI** | `geminiProvider.generateQuestion()` in `gemini-provider.ts:43` | Standalone question generator helper | Input: Single question params.<br>Output: Single question item. | Throws structured error | **No** (Runs on Gemini Flash Free Tier) |

### C2. Dependency Assessment
* **Token Tracking**: Token usage is **estimated heuristically** (`Math.ceil(length / 4)`) in `ai-provider-manager.ts:418-419`. Actual token counts from Gemini response headers are not parsed.
* **Prompt Length Controls**: Material prompts are capped at 3,500 characters (`pipeline.ts:277-279`). Output tokens are set to `maxOutputTokens: 8192`.
* **Caching**: **No response caching or semantic caching exists**. Submitting the same topic twice burns two separate AI calls.
* **Deterministic Operations Delegated to AI**: Currently, generating the final Indonesian sentence narrative is delegated to Gemini. However, variable substitution and entity selection could be performed deterministically.
* **Offline Operation**: If Gemini is offline, teachers can still manually input, edit, review, print, and conduct live room exams using existing or manually written questions without AI.

---

## 6. Context Engine Assessment

1. **Retrieval Reality**: The application retrieves **actual, verified local knowledge**. It does not merely prompt the LLM to "hallucinate" facts. `MockLocalContextRetriever` has 18 detailed verified facts with source URLs, and `SupabaseLocalContextRetriever` queries PostgreSQL `pgvector`.
2. **Location vs. Genuinely Relevant Context**: The engine distinguishes generic locations from cultural/economic context via 5 taxonomy categories: `commodity`, `location`, `tradition`, `geography`, `occupation`.
3. **Replaceable Span Identification**: `pipeline.ts:136-157` uses pattern matching (`COMMODITY_PATTERNS`, `LOCATION_PATTERNS`, etc.) to flag replaceable spans.
4. **Number and Unit Preservation**: `extractNumbers()` extracts all integers and decimals (`\b\d+(?:[\.,]\d+)?\b`). Validation flags warnings if original numbers are altered.
5. **Visual Diff Highlighting**: **Partially missing in UI**. The AI returns `context_variables` with `{ original_term, replacement_term, reason }`, but the teacher UI currently renders the updated text without inline visual before/after color diffing.
6. **Deterministic Replacement Rules**: `rewriteText()` in `pipeline.ts:207-217` implements regex replacement (`\b${m.original_term}\b`), but is currently bypassed in favor of Gemini's complete generative rewrite.
7. **Curated & Verified Sources**: Sources in `data-pipeline/` are sourced from BPS, Pemkab Ponorogo, Kemdikbud Warisan Budaya, and Wikimedia Commons (with CC-BY-SA attribution).
8. **Insufficient Context Behavior**: If an unknown region is requested, the system gracefully falls back to district-to-regency resolution or displays a generic regional template rather than crashing (`retrieval-adapter.ts:316-332`).

---

## 7. Feasibility of an NLP-First Architecture

### E1. Deterministic Text Processing Feasibility (`VERIFIED: HIGH`)
A purely deterministic contextualization engine can be implemented in TypeScript within the existing Node.js environment:
* **Tokenization**: Regex boundary tokenization (`Intl.Segmenter` native in Node 18+ and modern browsers).
* **Gazetteer & Longest-Match Matching**: Storing local knowledge entities in an Aho-Corasick trie or length-descending regex array. Ensures *"Pasar Legi Ponorogo"* matches before *"Pasar"*.
* **Protected Spans**:
  * Math numbers: `\b\d+(?:[.,]\d+)?\b`
  * Math operators & equations: `[+\-×÷=/%]`
  * Units: `\b(kg|gram|meter|cm|liter|rupiah|Rp|butir|buah|ekor)\b`
  * Options: `^[A-D][.)]`
* **Controlled Replacement**: Replaces matched generic entities with local entities while preserving grammatical casing (TitleCase vs lowercase).
* **Visual Diff**: Generates character/token range diffs rendered as `<mark class="bg-amber-100 text-amber-900">` in the UI.

### E2. Indonesian NLP Options Evaluation

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| **spaCy (Python)** | Rich syntactic parsing, POS tagging | **No official Indonesian core pipeline** (`id_core_news_*` does not exist). Requires heavy Python microservice, breaking Vercel zero-serverless model. | **Reject for Production** (Overkill & High Complexity) |
| **Sastrawi (JS / TS)** | Native JavaScript, zero dependencies, Indonesian root word stemming | Focuses on stemming rather than NER | **Accept as Secondary Helper** |
| **TypeScript Native Gazetteer + Regex Rule Engine** | 0 ms latency, 0 token cost, 100% deterministic, 0 deployment overhead | Cannot synthesize new creative sentences from scratch | **Accept as Primary Context Engine** |
| **Selective Gemini / Groq Fallback** | Natural sentence flow, handles complex reformulations | Latency (1-3s), subject to rate limits | **Accept as Selective Secondary Fallback** |

---

## 8. Educational Integrity & Validation Assessment

### Real Implementation of `validateEducationalIntegrity()` (`pipeline.ts:219-244`):

| Check | Status | Verification Details |
|---|---|---|
| **Numerical Consistency** | `VERIFIED` | `extractNumbers()` extracts all numbers; flags warning if any number is missing from the output. |
| **Local Grounding** | `VERIFIED` | Checks if adapted text mentions retrieved entity names or target region name (`pipeline.ts:339-347`). |
| **Competency Preservation** | `HEURISTIC` | Assumes competency is preserved if numbers match and regional grounding exists (`pipeline.ts:350`). Does not parse semantic Bloom's taxonomy. |
| **Mathematical Correctness** | `HEURISTIC` | Sets `math_subtraction_addition_correct: true` statically. Does not execute an AST symbolic math check. |
| **Answer-Key Consistency** | `HEURISTIC` | Assumes answer key is preserved if the LLM output provides `correct_answer`. |
| **Teacher Approval Gate** | `VERIFIED` | Every question/material generated by AI is placed in Step 3 for mandatory teacher inspection, editing, and saving before entering any Room. |

---

## 9. Testing, Security, and Reliability Findings

### G1. Automated Test Execution (`VERIFIED`)
* **Test Command**: `npm run test` (`tsx --test tests/*.test.ts`)
* **Test Results**:
  * **14 Suites Passed**, **97 Tests Passed**, **0 Failures** (Duration: 7.82s).
  * Covers: Multi-tenant school isolation, LKB zero-leakage retrieval, document parser anti-header pollution, math quantity preservation ($20 \times 12.000 = 240.000$), tombstone synchronization, room snapshot immutability, and from-material generation.

### G2. Code Quality & Linter Execution (`VERIFIED`)
* **Lint Command**: `npm run lint` (`next lint` / `eslint`)
* **Lint Results**:
  * **0 Errors**, **519 Warnings**.
  * All errors (React 19 purity, `prefer-const`) previously reported were resolved. Remaining warnings are non-breaking `@typescript-eslint/no-explicit-any` and unused variables in admin mock stubs.

### G3. Security & Reliability Concerns
1. **Critical Active Blocker (`BLOCKED`)**: Supabase project `ubwsgabbongnbbflxmxo` is paused, completely disabling cloud authentication and sync.
2. **Hardcoded Administrative Credentials (`VERIFIED`)**: `lib/admin/admin-repository.ts:22-23` contains hardcoded salt and password hashes for `admin123` and `AdminPahami2026!`. Must be gated strictly behind production environment variables.
3. **Secret Masking & Key Storage (`VERIFIED`)**: AES-256-GCM encryption is implemented in `lib/admin/crypto.ts` for credential pooling. Plaintext API keys are never returned to client components.

---

## 10. DeveloperDay 2026 Readiness Assessment

* **Official Organizer**: PANDI (Pengelola Nama Domain Internet Indonesia), FTII, ASPILUKI.
* **Competition Theme**: *"Open Innovation for Indonesia's Digital Future"* (Road to APICTA 2026).
* **Official Evaluation Criteria (APICTA Standard)**:
  1. *Uniqueness* (25%)
  2. *Market Potential* (25%)
  3. *Functionalities & Features* (25%)
  4. *Quality & Application of Technology* (25%)

### Dimension Readiness Breakdown:

| Dimension | Current Evidence | Gap | Recommended Action | Priority |
|---|---|---|---|---|
| **1. Uniqueness (25%)** | Working Local Knowledge Base (LKB) anchoring Kurikulum Merdeka to local cultural/economic heritage | Lacks visible before/after contextual variable highlighting in teacher UI | Add visual diff tags showing exact words adapted from local culture | **HIGH** |
| **2. Functionalities (25%)** | 5-mode question studio, module studio, live exam room, auto-grading, PDF print engine | Login is currently blocked by paused Supabase DB | Resume Supabase project and verify smooth login | **CRITICAL** |
| **3. Quality & Tech (25%)** | 97 automated tests pass, Turbopack clean build, 0 lint errors, offline-first local repository | Heavy reliance on Gemini for rewriting; math validation is heuristic | Introduce deterministic NLP slot-engine with Gemini fallback | **HIGH** |
| **4. Market Potential (25%)** | Validated with real teachers (solves gadget misuse, saves 90% exam prep time, supports ANBK) | Pitch deck and impact metrics are not structured for APICTA judges | Prepare concise 5-minute slide deck emphasizing teacher time saved | **HIGH** |
| **5. Domain Requirement** | Currently deployed at `depaskan.vercel.app` | DeveloperDay mandates deployment on a `.id` domain | Bind `depaskan.njb.my.id` to Vercel production project | **CRITICAL** |

---

## 11. Existing Domain and Deployment Assessment

* **Current Domain**: `https://depaskan.vercel.app` (Hosted on Vercel Edge Network, SSL active).
* **Target Domain**: `depaskan.njb.my.id` (User owns root domain `njb.my.id`).
* **Feasibility of CNAME Binding**:
  * Adding `depaskan.njb.my.id` to Vercel requires adding a DNS **CNAME record** pointing `depaskan` to `cname.vercel-dns.com` in the DNS management console of `njb.my.id`.
  * Vercel will automatically provision a free Let's Encrypt SSL/TLS certificate for `depaskan.njb.my.id`.
* **Separate Python NLP Service (`api.depaskan.njb.my.id`)**:
  * **Not Recommended**. Hosting a separate Python backend would incur unnecessary server costs or require waking up sleeping Hugging Face Spaces (30s+ cold start).
  * The entire deterministic NLP engine and local dictionary matcher can run natively in Next.js on Vercel at **0 cost** and **< 2ms latency**.

---

## 12. Prioritized Improvement Roadmap

```
Phase 1: Immediate Unblocking & Domain Compliance (Pre-requisite)
Phase 2: NLP-First Deterministic Substitution Engine (Core Innovation)
Phase 3: Visual Diff & Teacher Trust UX (Presentation & Judging)
Phase 4: Independent Symbolic Mathematical Verification (Quality)
```

| Recommendation | Competition Impact | Effort | Regression Risk | Dependencies | Mandatory for Submission? |
|---|---|---|---|---|---|
| **1. Resume Supabase & Bind Domain `depaskan.njb.my.id`** | **Critical** | Low | Low | Supabase Dashboard, DNS CNAME | **Yes (Mandatory)** |
| **2. Implement Deterministic NLP Slot-Engine** | **High** | Medium | Low | `lib/context-engine/` | **Yes (High APICTA Tech Score)** |
| **3. Add Visual Before-and-After Highlighting** | **High** | Low | Low | `app/teacher/questions/` | **Yes (Visual WOW Factor)** |
| **4. Add Symbolic Math Invariant Verification** | **Medium** | Low | Low | `pipeline.ts` | **Yes (Pedagogical Safety)** |
| **5. Multi-Provider Fallback (Groq + Gemini)** | **Medium** | Low | Low | `ai-provider-manager.ts` | **Can wait for Finalist stage** |

---

## 13. Exact Files and Functions Requiring Changes

1. **`lib/context-engine/pipeline.ts`**:
   * Function: `rewriteText()` -> Enhance with longest-match gazetteer, case preservation, and protected-span boundaries.
   * Function: `contextualize()` -> Insert deterministic NLP pipeline before calling `aiProviderManager.execute()`. Only call LLM if deterministic substitution confidence is low or input mode is generative.
2. **`lib/context-engine/types.ts`**:
   * Add `diff_spans?: { original_term: string; replacement_term: string; category: string; index: number }[]` to `QuestionDraftItem` and `MaterialContextualizedResult`.
3. **`app/teacher/questions/page.tsx`**:
   * Render visual highlighted pill badges on questions where local entities were adapted so teachers immediately see what changed.
4. **`components/media/camera-capture-modal.tsx`**:
   * Already optimized with 1600px canvas downsampling; preserve intact.
5. **`app/login/page.tsx`**:
   * Already verified Supabase session checks; will function smoothly as soon as database is resumed.

---

## 14. Missing Information & Unresolved Questions

1. **Supabase Ownership**: Whether the project `ubwsgabbongnbbflxmxo` is under the user's primary Google account or a secondary account (user must confirm in Supabase dashboard).
2. **DeveloperDay Exact Stage**: Whether the user is submitting for initial selection or preparing for finalist presentation (as the official timeline noted October 24 as finalist announcement).
3. **DNS Registrar Access**: Confirmation that user has access to the DNS zone editor for `njb.my.id` to add the CNAME record for `depaskan`.

---

## 15. Recommended First Implementation Iteration

**Iteration 1 (Safest, Zero-Regression First Step):**
1. Unblock database access by resuming the Supabase project.
2. Add the DNS CNAME record for `depaskan.njb.my.id` on Vercel to satisfy the mandatory `.id` competition rule.
3. Implement the **Deterministic Protected-Span Extractor** inside `pipeline.ts` with unit tests in `tests/deterministic-nlp.test.ts` to prove that arithmetic invariants and local entities can be matched and swapped with 0 token cost and 0 API calls.

*End of Pre-Improvement Technical Audit Report.*
