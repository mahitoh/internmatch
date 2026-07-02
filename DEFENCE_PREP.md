# INTERNBEACON — FULL DEFENCE PREPARATION

---

## SECTION 1: PLATFORM OVERVIEW

**Q: In one sentence, what is InternBeacon?**

InternBeacon is a web-based internship matching platform that connects Cameroonian university students with companies offering internship positions, using a deterministic algorithmic engine to rank candidates and personalise recommendations.

**Q: What specific problem does it solve?**

In Cameroon, internship placement is almost entirely informal — students rely on personal connections, physical notice boards or cold-calling companies, while companies have no structured way to find candidates that match their actual technical needs. InternBeacon digitises the entire process: companies post structured offers, students build profiles with verified skills, and the platform automatically ranks applicants by fit so a company sees the most suitable candidates first without manually reading every CV.

**Q: Who are the users and what can each one do?**

There are three roles. Students can build a profile, upload a CV for AI parsing, browse and apply to internship offers, track application status in real time, and message companies directly. Companies can post internship offers, view a ranked applicant list for each offer, update application statuses, schedule interviews, and communicate with candidates. Administrators have a management dashboard to oversee users, offers and platform health.

**Q: Why build this specifically for Cameroon?**

The platform is deliberately localised. The location scoring uses `CAMEROON_REGIONS` — ten region groups that map Cameroonian cities and regions so that "Yaoundé" and "Centre" are treated as the same location area, and "Bafoussam" and "Ouest" are grouped together. The language factor handles English and French bilingualism, which is a reality for most Cameroonian employers. The academic taxonomy covers Francophone programme names like "génie informatique" and "comptabilité" alongside Anglophone equivalents. A generic international platform would miss all of this nuance.

**Q: What are the most important features from a technical standpoint?**

Four stand out. First, the 5-factor weighted matching engine that produces a 0–100 score and verdict for every student-offer pair deterministically. Second, AI-powered CV parsing that extracts skills from a PDF and writes them into the student's profile, which immediately updates all their match scores. Third, real-time messaging and notifications via Socket.IO so both parties get instant updates without refreshing. Fourth, the recommended offers feed, which ranks open internships by match score for each logged-in student as a personalised discovery tool.

---

## SECTION 2: MATCHING ALGORITHM

**Q: Give me the high-level explanation of how the matching algorithm works.**

The algorithm is a weighted multi-factor scoring model. For any student-offer pair, it computes five independent sub-scores — skills coverage, programme-domain alignment, location proximity, study level fit, and language match — then combines them using fixed weights into a final score from 0 to 100. That score maps to a verdict label and is accompanied by structured strengths, gaps and a tip. The whole calculation is in `backend/src/utils/matchingEngine.js` and is the single source of truth for all matching logic across the entire platform.

**Q: What are the exact five factors and their weights?**

The `WEIGHTS` object in `matchingEngine.js` defines them literally:
- `skills: 0.35` — 35%
- `domain: 0.30` — 30%
- `location: 0.15` — 15%
- `level: 0.15` — 15%
- `language: 0.05` — 5%

They sum to exactly 1.0. Skills is the highest weight because it is the most direct and objective measure of job fit. Domain is second because academic background determines whether a student has the foundational knowledge for the field at all. Location, level and language are tiebreakers — important but rarely the primary disqualifier.

**Q: Walk me through a complete worked example with real numbers.**

Take Brenda Nfor applying to TechNova's Software Engineering Intern offer. The offer requires: React, Node.js, JavaScript, Git, Python — five skills. Brenda's profile has: React ✓, JavaScript ✓, TypeScript, Node.js ✓, Git ✓, CSS, HTML — she matches 4 of 5, so skill coverage = 4/5 = 80, `sk.score = 80`. Her programme is Software Engineering, which `classifyProgramme` maps to the `computer_science` field. The offer domain is "Information Technology", and `DOMAIN_FIELD_MAP["Information Technology"]["computer_science"] = 1.0`, so `ds = 100`. Her city is Yaoundé, offer location is Yaoundé — exact match, `lc = 100`. Year 3, requirements say "Licence 3 or above" — the regex `3[eè]me|licence\s*3` sets `required = 3`, student year 3 ≥ 3, so `ls = 100`. Required language is English, Brenda speaks English — `lg = 100`. Final score: `80×0.35 + 100×0.30 + 100×0.15 + 100×0.15 + 100×0.05 = 28 + 30 + 15 + 15 + 5 = 93`. Verdict: Excellent Match (≥85).

**Q: What are the verdict thresholds?**

Defined in the `getVerdict` function:
- Score ≥ 85 → **Excellent Match**
- Score ≥ 70 → **Good Match**
- Score ≥ 50 → **Moderate Match**
- Score < 50 → **Low Match**

**Q: What are blocking conditions and why do they exist?**

Blocking conditions in `applyBlockingConditions` prevent a perfect score on one factor from masking a hard disqualifying mismatch on another. Without them, a student who perfectly matches all skills but is in a completely different city could still get "Excellent Match" — which would be misleading. There are three blocking rules: (1) If skill coverage is zero against an offer that has listed requirements, the verdict is forced to "Low Match" regardless of score, because having zero matching skills against a specific technical role is disqualifying. (2) If the study level score `ls ≤ 40`, meaning the student is two or more years below the requirement, the score is capped at 64 and the verdict becomes "Review Carefully". (3) If `lc ≤ 30` (different region) and the raw verdict would be "Excellent Match", it is downgraded to "Good Match" — you cannot call a cross-city placement excellent.

**Q: How does skill normalisation work?**

The `normalizeSkill` function lowercases and trims a skill string, then looks it up in the `SKILL_ALIASES` map. For example `"reactjs"` → `"react"`, `"node.js"` → `"nodejs"`, `"typescript"` → `"typescript"` (unchanged), `"comptabilité"` → `"accounting"`. This means a company that writes "ReactJS" and a student who lists "React" still match. Both the student's skills and the offer's required skills are normalised before comparison, so the matching is alias-aware on both sides.

**Q: What is the ACADEMIC_FIELDS taxonomy and how does it work?**

`ACADEMIC_FIELDS` is a dictionary mapping canonical field names (like `computer_science`, `finance`, `management`) to arrays of keyword strings that a student's programme text might contain. `classifyProgramme` takes the student's programme string, lowercases it, and finds which field has the longest matching keyword — it uses longest-match to prevent short words like "it" (inside "droit") from causing false positives. For example, "Software Engineering" matches `computer_science` because the keyword `"software engineering"` is in that field's array. "Comptabilité" matches `accounting`. If no keyword matches, the function returns `null`, meaning the programme is unrecognised.

**Q: What happens when a programme is unrecognised?**

When `classifyProgramme` returns `null`, the `domainScore` function also returns `null`, and in `computeMatch` we detect `domainUnknown = true`. Instead of treating unknown as zero (which would penalise the student unfairly) or as 50 (which would give a fake neutral score), we redistribute: half of the domain weight (0.15) is added to the skills weight, and the remaining half is scored at a neutral 50. So the student is only penalised in that the domain factor contributes weakly, but their skills and other factors still carry their full significance. The same redistribution applies if location data is missing on either side.

**Q: How does location scoring work?**

The `locationScore` function first checks if the offer location contains the word "remote" or "télétravail" — if so, it returns 100 for everyone. Otherwise it compares the student's city to the offer location. An exact city match (or substring containment) returns 100. Then it checks `CAMEROON_REGIONS` — ten arrays of city and region synonyms. If both the student city and offer location appear in the same group, it returns 60 (same region, partial credit). Otherwise it returns 30 (different region, minimum score — not zero, because the student might still relocate). If either side has no location data, the function returns `null`, which triggers the same weight redistribution as an unknown domain.

**Q: How does study level scoring work?**

The `studyLevelScore` function scans the offer's `requirements` text with a priority-ordered set of regex patterns. Final year/Master patterns set `required = 4`, fourth-year patterns set `required = 4`, third-year/Licence 3 patterns set `required = 3`, bachelor/undergraduate patterns set `required = 2`. It then compares the student's `study_year` integer: if `studentYear >= required` → 100; if `studentYear === required - 1` → 70; if `studentYear === required - 2` → 40; below that → 20. If the student has no `study_year` set, a neutral 50 is returned.

**Q: How is language matching done?**

The `languageScore` function checks whether the offer has a `required_languages` array set explicitly — if so, that's authoritative. If not, it falls back to scanning the offer's `requirements` and `description` text for the words "English"/"anglais" and "French"/"français". It then checks whether the student's `languages` array contains matching values (checking both English and French name variants). The score is `covered / needed × 100`. If no languages are required, the score is 100 for everyone. Language tokens are also filtered out of the required skills list — if a company accidentally puts "French" in their required skills, it is caught by `isLanguageToken` and not counted as a missing technical skill.

**Q: Why is the matching engine deterministic and not ML-based?**

Three reasons. First, determinism was a core thesis requirement — the same inputs always produce the same output, which means I can explain to a jury, to a student, and to a company exactly why a score is what it is. An ML model is a black box. Second, I did not have a dataset of historical internship placements in Cameroon to train a model on — you cannot build a supervised learning system without labelled training data. Third, the weights I chose (35% skills, 30% domain, etc.) are grounded in the thesis's literature review on hiring criteria and can be defended academically. They can always be calibrated later once real platform data accumulates.

**Q: How does the algorithm connect to Chapter 4 of your thesis?**

Chapter 4 defines the matching model theoretically — the five factors, their weights and the rationale for each. The `matchingEngine.js` file is the direct computational implementation of that model. Every constant in the code — the `WEIGHTS` object, the verdict thresholds in `getVerdict`, the `CAMEROON_REGIONS` groups, the `DOMAIN_FIELD_MAP` scores of 1.0/0.6/0.0 — maps to a design decision justified in Chapter 4. The code is the thesis made executable.

**Q: How does `computeMatch` know which skills to use from the student profile?**

It reads exclusively from `student.skills` — the curated column in `student_profiles`. The `ai_summary` JSON blob is intentionally ignored, even if it previously contained a `skills` key. This is by design: if a student deletes a skill from their profile, it must stop affecting their match score immediately. Reading `ai_summary.skills` would resurrect deleted skills and introduce non-determinism because the AI might have extracted slightly different values than what the student curated.

**Q: Can you explain the `computeRecommendationReasons` function?**

It calls `computeMatch` internally (no recomputation) and then builds a human-readable `reasons` array from the breakdown. It produces up to three reasons: one for domain alignment (if `domain.score ≥ 0.65`), one listing matched skill names, and one confirming the study year is appropriate. These strings appear on the recommended offers feed on the student's dashboard. The full match result (score, verdict, breakdown) is also returned so the frontend has everything it needs.

**Q: What does the `method: 'algorithmic'` field mean in the return value?**

It is a forward-compatibility marker. `computeMatch` always returns `method: 'algorithmic'`. When a future ML model is added, it would return `method: 'ml'`. The rest of the API contract (score, verdict, breakdown, etc.) stays identical, so the frontend and all consumers never need to change — they can treat the score as a score regardless of how it was computed.

---

## SECTION 3: CV PARSING & AI INTEGRATION

**Q: Walk me through the complete CV parsing flow from upload to database.**

When a student uploads their PDF, the file goes through Multer into memory as a Buffer — nothing is written to disk. The `POST /api/upload/cv` endpoint validates the MIME type using `file-type` (a real buffer inspection, not just the extension), then uploads the buffer to the `cvs` Supabase Storage bucket and saves the URL to `student_profiles.cv_url`. When the student then hits `POST /api/ai/parse-cv`, the backend fetches their PDF from Supabase Storage, passes the buffer through `pdf-parse` to extract raw text, sends that text to `callAI` with a structured JSON prompt, receives a JSON response containing skills, education, experience, languages and a summary, strips any prose preamble with `extractJSON`, and then updates `student_profiles` — writing extracted skills to the `skills` column and the narrative fields (education, experience, summary) to the `ai_summary` blob.

**Q: Which AI providers does the system use and in what order?**

The active provider chain is Gemini → Groq → Grok (xAI). Within Gemini, it tries three models in order: Gemini 2.5 Flash, then 2.0 Flash, then 2.0 Flash Lite. The `callAI` function in `aiProvider.js` iterates through the `PROVIDERS` array and returns the first successful response. Anthropic (Claude) and OpenAI are configured in the code but are currently disabled by being excluded from the active `PROVIDERS` array because API credits are exhausted. To re-enable them, you simply add them back to the array.

**Q: What happens if all AI providers fail?**

`callAI` throws a 503 error with the message "All AI providers are currently unavailable." The `parse-cv` controller catches this and returns a 503 to the frontend. The system has a deterministic fallback in `matchingEngine.js` — `extractSkillsFromText` — which scans raw CV text against `SKILL_VOCAB`, a list of 60+ known skills with regex patterns. This fallback can be invoked without any API call; it means the system can still extract something useful from a CV even with zero AI connectivity.

**Q: What is the `extractJSON` helper and why is it needed?**

AI models sometimes prefix their JSON response with prose like "Here is the extracted information:" or wrap it in markdown code fences (` ```json ... ``` `). `extractJSON` finds the first `{` or `[` character in the response text and slices from there, then calls `JSON.parse`. Without it, `JSON.parse` would throw on any response that doesn't start with a brace, making the parser fragile.

**Q: Why do extracted skills go into the `skills` column and not stay in `ai_summary`?**

Because `student_profiles.skills` is the single authoritative source for the matching engine. If skills stayed only in `ai_summary`, then a student who manually deleted a skill from their profile would still have it affecting their match scores. By writing skills to the column and then stripping them from `ai_summary`, we ensure that the profile editor is the canonical source of truth. `ai_summary` becomes display-only metadata — education history, experience descriptions, a summary paragraph.

**Q: Why is AI used for parsing but not for matching?**

Matching requires determinism, explainability and reproducibility — properties that LLMs fundamentally do not have. A match score needs to be the same every time for the same inputs, and I need to be able to tell a student exactly why they scored 76. An LLM match would produce different scores on different calls and could not be explained. Parsing, on the other hand, is a structured extraction task — take unstructured PDF text and find skill names, university names, languages. LLMs excel at this, and the output of parsing (a list of skill strings) feeds into the deterministic engine, so the non-determinism of the AI is contained to one step.

**Q: What is `extractSkillsFromText` and when is it used?**

It is a deterministic skill extractor in `matchingEngine.js` that scans raw text against `SKILL_VOCAB` — 60+ entries each with a skill display name and a regex pattern. For example `['React', /\breact(\.?js)?\b/]` catches "React", "ReactJS" and "react.js". It is used as a no-AI fallback — either when all AI providers are down, or as an alternative parse path. The `extractLanguagesFromText` companion function does the same for language detection.

---

## SECTION 4: TECHNOLOGY STACK JUSTIFICATION

**Q: Why Node.js and Express for the backend?**

Node.js fits this project for three reasons: it is JavaScript, which means the same language on both frontend and backend, reducing context switching; its non-blocking I/O model handles many concurrent API requests efficiently, which matters when multiple students and companies are using the platform simultaneously; and its npm ecosystem has mature packages for everything I needed — Supabase client, Multer, pdf-parse, express-validator. Express was chosen over alternatives like Fastify or NestJS because it is minimal and gives me explicit control over every middleware layer without framework magic obscuring the request lifecycle.

**Q: Why React and Vite for the frontend?**

React's component model makes building a complex multi-role UI (different dashboards for student, company and admin) clean and maintainable. Vite was chosen over Create React App because it uses native ES modules for development, resulting in near-instant hot module replacement — the dev server starts in under a second. Tailwind CSS handles styling without writing custom CSS files, and the design system is encoded entirely in `index.css` and Tailwind classes.

**Q: Why Supabase and PostgreSQL instead of a custom backend database?**

Supabase gives me PostgreSQL — a mature, ACID-compliant relational database — with a managed hosting layer, built-in authentication, Storage for file uploads and a real-time subscription layer, all through a single service. Building all of that from scratch (auth, storage, hosting, SSL, backups) would have taken months and was outside the thesis scope. PostgreSQL specifically was chosen over MongoDB because the data is relational: students apply to offers, offers belong to companies, messages belong to applications. A relational model with foreign keys enforces this integrity at the database level.

**Q: Why Socket.IO for real-time features instead of plain WebSockets?**

Socket.IO wraps WebSockets with automatic fallback (to long-polling if WebSockets are blocked), connection management, room abstractions and reconnection logic. Plain WebSockets would require me to implement all of that manually. The room model is exactly what I needed: `user:{userId}` rooms for private notifications and `thread:{appId}` rooms for application-specific messaging. Socket.IO's `io.to(room).emit()` makes broadcasting to the right recipients trivial.

**Q: Why TanStack Query v5 for frontend data fetching?**

TanStack Query manages server state — caching, background refetching, loading/error states — without me writing any of that logic manually. When a student applies to an offer, Query automatically invalidates the relevant cache key and refetches fresh data. The v5 API removed the `onSuccess` callback from `useQuery` (because it caused double-invocations in StrictMode); I handle side effects by deriving state from the query result or using `useEffect` with the data as a dependency.

**Q: Why Multer for file uploads, and why memory storage specifically?**

Multer is the standard Express middleware for handling `multipart/form-data`. I use memory storage (not disk storage) because the files are immediately passed to either `file-type` for MIME validation or to Supabase Storage for upload — they never need to exist on the server's filesystem. Disk storage would create temporary files that need cleanup, and in a cloud deployment the filesystem may not be persistent anyway. The size limits are 5MB for CVs and 2MB for images, enforced by Multer's `limits.fileSize` option.

**Q: Why the `file-type` package for MIME validation instead of checking the file extension?**

File extensions are trivially spoofed — a user could rename `malware.exe` to `cv.pdf`. The `file-type` package inspects the actual file buffer's magic bytes (the first few bytes that identify a file format at the binary level) to determine the real type. I import it with `const { fileTypeFromBuffer } = await import('file-type')` because it is an ESM-only package (version 20+) that cannot be `require()`d in CommonJS — the dynamic `await import()` is the correct interop pattern.

**Q: Why express-validator for input validation?**

express-validator integrates with Express's middleware chain cleanly — you declare validation rules as middleware before the controller, and the controller can call `validationResult(req)` to retrieve any errors. This keeps validation logic separate from business logic and prevents malformed input (like a `study_year` of 99 or a negative stipend) from reaching the database.

**Q: What does helmet do?**

Helmet sets HTTP security headers automatically — Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security and others. These headers tell browsers to enforce security constraints that prevent common attacks like clickjacking, MIME-type sniffing and cross-site scripting. It is one line of middleware that adds substantial security coverage.

**Q: Why rate limiting?**

The `generalLimiter` middleware caps how many requests a single IP can make in a time window. Without it, a single client could flood the server with thousands of requests per second, degrading service for everyone else (a denial-of-service attack), or brute-force password attempts on the login endpoint. Rate limiting is a standard defensive layer in any production API.

---

## SECTION 5: AUTHENTICATION & SECURITY

**Q: How does authentication work in InternBeacon?**

Authentication is entirely delegated to Supabase Auth — I wrote no custom JWT logic. When a user logs in, the frontend calls Supabase's `signInWithPassword`, which returns an `accessToken` and `refreshToken`. These are stored in `localStorage`. Every API request from the frontend sends `Authorization: Bearer <accessToken>` in the header. The backend `authenticate` middleware calls `supabaseAdmin.auth.getUser(token)` — a live network call to Supabase — which verifies the token and returns the user object. `req.user` is then set with `{ userId, email, role, userMetadata }` where `role` comes from `user.app_metadata.role`.

**Q: Why make a live network call to Supabase on every request instead of verifying the JWT locally?**

Local JWT verification using `SUPABASE_JWT_SECRET` would be faster, but it cannot detect revoked tokens. If a user's session is invalidated (logout, security revocation), a locally verified JWT would still pass for its full lifetime. By calling `supabaseAdmin.auth.getUser(token)` on every request, the backend always gets the current truth from Supabase's auth server. For a platform where companies manage student applications, this security guarantee is worth the network overhead.

**Q: What are the three roles and how are they enforced?**

The roles are `student`, `company` and `admin`. The role is stored in Supabase `app_metadata` (set server-side via the service role key at registration — users cannot set their own role). After `authenticate` sets `req.user`, the `authorize(role)` middleware checks `req.user.role === requiredRole` and returns 403 if it does not match. For example, `POST /api/offers` has the middleware chain `[authenticate, authorize('company'), ...]` — only company accounts can create offers.

**Q: What is the service role key and why does it bypass RLS?**

Supabase has two access levels: the anon key (respects Row Level Security policies) and the service role key (bypasses RLS entirely, acts as a superuser). The backend uses the service role key because access control is enforced in the Express middleware layer — the `authorize` middleware — not in database policies. This is a deliberate architecture decision: middleware authorization is easier to reason about, test and debug than RLS policies, and it avoids the complexity of syncing two parallel access control systems.

**Q: What is `authenticateOptional` and where is it used?**

`authenticateOptional` works like `authenticate` but never blocks: if a valid token is present, it sets `req.user`; if no token or an invalid token is present, it calls `next()` anyway so the request proceeds unauthenticated. It is used on `GET /api/offers` and `GET /api/offers/:id` so that logged-in students receive inline match scores on every offer card, while anonymous visitors still get the full offer listing without scores.

**Q: How does token refresh work end-to-end?**

When the Axios response interceptor in `frontend/src/api/axios.js` receives a 401, it calls `POST /api/auth/refresh` with the stored `refreshToken`. The backend calls Supabase to get new tokens, returns them, and the interceptor stores the new `accessToken` in `localStorage` and retries the original request. It also dispatches a custom `token:refreshed` DOM event. `SocketContext` listens for this event and reconnects the Socket.IO connection using the new token, so real-time features are not interrupted by a token refresh.

**Q: How does password security work — are passwords stored in your database?**

No. Passwords are never stored in my database or seen by my backend. They go directly from the browser to Supabase Auth, which hashes them using bcrypt. My backend only ever works with JWT access tokens. This means even if my database were compromised, no passwords would be exposed.

---

## SECTION 6: DATABASE DESIGN

**Q: What is your database schema — what are the key tables?**

The core tables are: `student_profiles` (one per student user — skills, programme, city, languages, cv_url, ai_summary), `company_profiles` (one per company — name, sector, city, description), `internship_offers` (belongs to a company_profile via `company_id`, has required_skills array, domain, location, deadline), `applications` (junction between a student_profile and an offer, has status, cover_letter, profile_snapshot), `messages` (belongs to an application, has sender_id and receiver_id as auth user UUIDs), `notifications` (belongs to a user by user_id), and `application_status_history` (audit log of every status change on an application).

**Q: Why does `internship_offers.company_id` reference `company_profiles.id` and not the auth user id?**

Because the matching engine, the offer card, and all company-side queries need company data like name, logo, sector and city — not the auth user record. The `company_profiles` table is where that data lives. If `company_id` referenced `auth.users.id`, every query that needs company name or logo would require an extra join. By pointing directly to `company_profiles.id`, one join gives everything needed.

**Q: What is the `profile_snapshot` in the applications table?**

It is a JSONB field that captures the student's profile at the exact moment of application — first name, last name, university, programme, skills, languages, bio, CV URL. Because student profiles can be updated at any time, if a company opens an application weeks later they need to see what the student looked like when they applied, not who they are today. The snapshot is written once on `INSERT` and never updated, making it an immutable historical record.

**Q: Why is there a `study_year` CHECK constraint in the database?**

`CHECK (study_year >= 1 AND study_year <= 5)` prevents invalid data at the database level as a last line of defence. The backend validates `study_year` before the database call, but the constraint ensures that even if validation code has a bug or is bypassed, the database will never store a year of 0, -1 or 99. Defence in depth.

**Q: Why PostgreSQL over a NoSQL database like MongoDB?**

The data model is inherently relational. Students apply to offers; offers belong to companies; messages belong to applications; notifications belong to users. These are hard foreign key relationships — an application cannot exist without both a student and an offer. PostgreSQL enforces referential integrity at the database level. A MongoDB document model would require me to manage these relationships manually in application code, which is error-prone. PostgreSQL also has excellent JSON support (the JSONB type for `profile_snapshot` and `ai_summary`) so I get relational integrity AND flexible document storage where needed.

---

## SECTION 7: REAL-TIME FEATURES

**Q: How is Socket.IO set up in the backend?**

The Socket.IO server is attached to the same HTTP server instance as Express — `new Server(httpServer, { cors: {...} })`. This means both REST API requests and WebSocket connections share the same port. Authentication happens in `io.use()` middleware using the same `supabaseAdmin.auth.getUser(token)` pattern as the REST middleware — the client sends the access token as a handshake auth parameter. On successful connection, the socket joins the `user:{userId}` room for private notifications.

**Q: What are the two room types and what are they used for?**

`user:{userId}` is a private room each user joins on connection — it receives that user's personal notifications (new application, status update, new message alert). `thread:{appId}` is a room for a specific application's messaging thread — when a student and company open their conversation, both join this room, and messages sent in it are delivered to both parties in real time. The thread room is joined dynamically when a user opens a conversation, not at connection time.

**Q: How does the `notifier.js` fire-and-forget pattern work?**

The `notify` function inserts a notification row into the `notifications` table, then calls `emitNotification` to push it to the user's socket room. It is wrapped in a try-catch that silently swallows errors — it never throws and never returns a promise that callers need to await. This means a notification failure never breaks the main operation (for example, a failed notification on application submission does not roll back the application itself). The function is called from controllers after the primary operation succeeds.

**Q: How does the frontend reconnect Socket.IO after a token refresh?**

The Axios interceptor dispatches a `token:refreshed` custom DOM event after successfully refreshing tokens. `SocketContext` has a `window.addEventListener('token:refreshed', ...)` handler that disconnects the current socket and creates a new connection with the fresh token as the auth parameter. This is necessary because the Socket.IO handshake token would otherwise be stale and any subsequent auth checks would fail.

---

## SECTION 8: FILE UPLOADS

**Q: How does file upload security work?**

Three layers. First, Multer enforces size limits in memory before any processing — 5MB for CVs, 2MB for images. Second, `file-type` inspects the actual buffer bytes to confirm the real MIME type matches what is expected (PDF for CVs, image types for avatars/logos) — this prevents extension spoofing. Third, Supabase Storage signed URLs for CV access enforce additional access rules: a student can only get a signed URL for their own CV, a company can only get one if there is a shared application between them, and admins can access any CV.

**Q: Why use memory storage in Multer instead of disk storage?**

In a cloud deployment, the server's local filesystem may be ephemeral or shared across instances — writing temp files there is unreliable. Memory storage keeps the file buffer in RAM for the duration of the request, where it is immediately consumed (validated and uploaded to Supabase), then garbage collected. No cleanup logic needed and no filesystem dependency.

**Q: Why does `file-type` need a dynamic `await import()` instead of `require()`?**

`file-type` version 20+ is published as an ES Module only — it has `"type": "module"` in its `package.json` and no CommonJS build. The InternBeacon backend is CommonJS (Node.js `require` style). CommonJS modules cannot statically `require()` an ES Module. The `await import()` syntax is the official interop bridge that allows a CommonJS module to asynchronously load an ES Module at runtime.

---

## SECTION 9: FRONTEND ARCHITECTURE

**Q: How does TanStack Query v5 differ from v4, and how did you adapt?**

TanStack Query v5 removed the `onSuccess`, `onError` and `onSettled` callbacks from `useQuery` and `useMutation` because they caused issues with StrictMode double-invocations and were architecturally confusing. Instead, I derive state from the query's `data` and `isSuccess` properties directly in the component, or use `useEffect` with `data` as a dependency for side effects like showing a toast notification. Mutations still have `onSuccess` in their options object — only query-level callbacks were removed.

**Q: How does the frontend handle the camelCase / snake_case mismatch?**

The database and API use snake_case (`first_name`, `study_year`, `is_paid`). The frontend expects camelCase (`firstName`, `studyYear`, `isPaid`). The mapping happens in the backend controllers: `normaliseStudentProfile` and `normaliseCompanyProfile` helper functions convert snake_case DB columns to camelCase before sending the JSON response. Going the other direction (frontend → backend), the API modules send camelCase keys and the controllers read them directly from `req.body`.

**Q: How do match scores appear on offer cards for logged-in students?**

The `GET /api/offers` endpoint uses `authenticateOptional`. When a student is logged in, the controller fetches their `student_profiles` record in parallel with the offer list query. For each offer, it calls `computeMatch(studentProfile, offer)` and attaches `{ score, verdict, breakdown, strengths }` to the normalised offer object as a `match` property. The frontend offer card reads `offer.match?.score` and renders the score badge and verdict label. Anonymous visitors receive offers without the `match` field and the card simply doesn't render a score.

**Q: How does the single Axios instance work?**

`frontend/src/api/axios.js` creates one Axios instance with `VITE_API_URL` as the `baseURL` and a request interceptor that attaches `Authorization: Bearer <token>` from `localStorage` on every request. A response interceptor handles 401s by calling the refresh endpoint, updating stored tokens, and retrying the original request transparently. All API modules import this single instance, so every call in the entire frontend automatically has auth headers and refresh behaviour — no duplication.

---

## SECTION 10: SYSTEM ARCHITECTURE & REQUEST LIFECYCLE

**Q: Walk me through the complete lifecycle of a request from browser to database.**

A request arrives at the Express server and passes through: `helmet` (sets security headers), `cors` (validates the origin against `CLIENT_URL`/`CLIENT_URL_WWW`), body parsers (`express.json()`, `express.urlencoded()`), a health-check bypass (so `/api/health` skips all auth), `generalLimiter` (rate limiting by IP), then the matched route. Inside the route: `authenticate` (calls Supabase, sets `req.user`), `authorize` (checks role), `express-validator` validators (check body/param shapes), the controller function (business logic), then `supabaseAdmin` database calls. The controller sends a `{ success: true, data: ... }` JSON response. If anything throws, it propagates to the global error handler in `app.js`, which returns `{ success: false, message: err.message }` in development or a generic "Internal server error" in production.

**Q: What does the offer expiry job do and why does it need two separate queries?**

`startExpiryJob` in `backend/src/utils/expiry.js` runs hourly. It closes all offers where `deadline < now` and `status = 'open'`. It uses two queries: first it fetches the IDs of expired offers with `SELECT id`, then it runs `UPDATE ... WHERE id IN (...)` on those IDs. This is because PostgREST (the API layer Supabase uses) does not support `.update().select('relation(...)')` — a join after an update fails. By separating fetch from update, we avoid that limitation entirely.

**Q: What is `fireOfferAlerts` and when does it run?**

When a company publishes a new internship offer (status changes to `open`), `fireOfferAlerts` is called. It fetches all students who have opted into offer alerts, runs `computeMatch` for each student against the new offer, and sends a notification to any student whose match score meets the threshold. This means students are proactively notified about relevant new opportunities without polling — the alert fires once at publish time.

---

## SECTION 11: HARD QUESTIONS / CHALLENGES

**Q: What are the limitations of a purely algorithmic approach to matching?**

The weights are fixed — they do not learn from outcomes. If students with strong location matches consistently get hired while domain alignment turns out to be less predictive, the algorithm has no way to discover that without manual recalibration. A machine learning model trained on historical placement outcomes would discover optimal weights automatically. The algorithm also cannot capture soft signals: communication skills, portfolio quality, motivation letter quality beyond keyword matching. These are real limitations that I acknowledge, and they are the foundation for a v2 roadmap.

**Q: How would you improve the system with more time or data?**

With real placement data (which student got which internship, which applications were rejected), I could train a logistic regression or gradient boosting model to learn weights from outcomes rather than setting them manually. The `method: 'algorithmic'` field returned by `computeMatch` is already designed to support this — a future ML model would return `method: 'ml'` and the rest of the API contract would stay identical. I would also add portfolio link analysis, recommendation letter uploads and a company feedback loop where companies rate interns after placement.

**Q: Why are the weights the values they are — who decided 35% for skills?**

The weights were determined through a literature review on hiring criteria in the African technology sector, combined with interviews with Cameroonian company recruiters conducted during the thesis research phase. Skills being the highest weight (35%) reflects that technical skills are the most direct and objective measure of suitability for a technical internship. Domain alignment at 30% reflects that a student from a completely unrelated academic background has a fundamental knowledge gap regardless of skills. The remaining 35% is split between location, study level and language as tiebreakers. These are documented and justified in Chapter 4 of the thesis.

**Q: What happens if Supabase goes down?**

The entire platform becomes unavailable — every API request calls Supabase either for authentication (`auth.getUser`) or for data. This is a single-point-of-failure trade-off I accepted in exchange for the benefits of a managed service. Supabase maintains a 99.9% uptime SLA and has automatic failover. For a production v2, mitigation strategies include token caching to reduce auth round-trips (partially implemented in `authenticate.js`), and read replicas for high-traffic queries.

**Q: How did you validate that the matching scores are correct?**

I engineered the demo dataset specifically to produce predictable, calculable scores. For the Software Engineering Intern offer, I computed every applicant's score by hand using the algorithm's formula, then seeded the database with profiles that have exactly the skills needed to produce those scores. When I log into the platform and run the match, the scores I see must equal my hand-calculated values — if they differ, there is a bug. This is effectively a form of integration testing through the demo data.

**Q: What would you add in version 2?**

Four priorities. First, a company verification system (the ShieldCheck badge is already partially implemented) with document upload and admin approval to build trust. Second, a structured interview scheduling system with calendar integration instead of just storing a date and external link. Third, ML-based weight calibration once placement outcome data accumulates. Fourth, mobile applications using React Native, since most Cameroonian students access the internet primarily via smartphone.

---

## SECTION 12: QUICK-FIRE DEFINITIONS

| Term | Definition |
|------|-----------|
| **API** | Application Programming Interface — a defined contract of endpoints that allows two software systems to communicate, in this case the frontend and backend. |
| **REST** | Representational State Transfer — an architectural style for APIs where resources are addressed by URLs, HTTP verbs (GET/POST/PATCH/DELETE) define actions, and responses are stateless. |
| **JWT** | JSON Web Token — a signed, base64-encoded token containing user claims (id, role, expiry) that a server can verify; Supabase issues these on login. |
| **OAuth** | An authorisation protocol that lets a user grant a third-party app access to their account on another service (e.g. "Continue with Google") without sharing their password. |
| **WebSocket** | A full-duplex, persistent TCP connection between browser and server that allows either side to push data at any time, unlike HTTP which is request-response only. |
| **Socket.IO** | A library that wraps WebSockets with rooms, reconnection, fallback to long-polling and event-based messaging; used for real-time notifications and chat in InternBeacon. |
| **ORM** | Object-Relational Mapper — a library that maps database rows to programming language objects; InternBeacon uses the Supabase JS client (query builder) rather than a traditional ORM like Prisma. |
| **RLS** | Row Level Security — PostgreSQL policies that restrict which rows a database user can read or write; InternBeacon bypasses RLS using the service role key and enforces access in Express middleware instead. |
| **CDN** | Content Delivery Network — a geographically distributed network of servers that caches static assets close to users to reduce load times. |
| **PDF parsing** | Extracting plain text content from a PDF file's binary structure; InternBeacon uses the `pdf-parse` library's `PDFParse` class API to get text from uploaded CVs. |
| **LLM** | Large Language Model — an AI model trained on vast text corpora that can generate, summarise and extract structured information from natural language; Gemini, Groq/Llama and Grok are the LLMs used for CV parsing. |
| **RAG** | Retrieval-Augmented Generation — an AI pattern where relevant documents are retrieved and injected into an LLM's context to ground its responses; not used in InternBeacon. |
| **Prompt engineering** | The craft of writing input instructions to an LLM that reliably produce structured, useful output; the CV parsing prompt instructs the model to return JSON with specific fields. |
| **TanStack Query** | A React library for managing server state — handles caching, background refetching, loading/error states and cache invalidation without Redux or manual fetch logic. |
| **Vite** | A frontend build tool that uses native ES modules during development for instant hot module replacement, and Rollup for optimised production builds. |
| **Supabase** | An open-source Firebase alternative providing PostgreSQL hosting, Auth, Storage and real-time subscriptions as managed services. |
| **PostgreSQL** | An open-source, ACID-compliant relational database system with strong support for JSON (JSONB), arrays, full-text search and complex queries. |
| **Middleware** | A function in Express that sits in the request-handling chain, reads or modifies `req`/`res`, and either ends the request or calls `next()` to pass it to the next function. |
| **CORS** | Cross-Origin Resource Sharing — a browser security mechanism that blocks frontend JavaScript from calling APIs on a different domain unless the server explicitly allows it via `Access-Control-Allow-Origin` headers. |
| **Helmet** | An Express middleware that sets HTTP security headers (CSP, X-Frame-Options, HSTS etc.) to protect against common web vulnerabilities in one line. |
| **Rate limiting** | Restricting the number of requests an IP address can make in a time window to prevent brute-force attacks and denial-of-service flooding. |
| **Multer** | An Express middleware for handling `multipart/form-data` (file uploads), configurable for memory or disk storage with size and file-count limits. |
| **MIME type** | A standardised label identifying a file's content format (e.g. `application/pdf`, `image/jpeg`); InternBeacon validates MIME type from the file buffer using `file-type`, not the filename extension. |
| **ESM vs CJS** | ES Modules (`import`/`export`) vs CommonJS (`require`/`module.exports`) — two incompatible JavaScript module systems; `file-type` v20+ is ESM-only so it requires `await import()` from CommonJS code. |
| **camelCase vs snake_case** | Two naming conventions — `firstName` (camelCase, used in JavaScript/frontend) vs `first_name` (snake_case, used in PostgreSQL columns); InternBeacon maps between them in controller normalisation helpers. |
| **ACID** | Atomicity, Consistency, Isolation, Durability — the four properties that guarantee database transactions are processed reliably; PostgreSQL is fully ACID-compliant. |
| **JSONB** | A PostgreSQL data type for storing JSON as binary, with indexing and query support; used for `profile_snapshot` (immutable application record) and `ai_summary` (CV extraction metadata). |
| **Blocking condition** | A rule in `applyBlockingConditions` that overrides the raw weighted score when a hard disqualifying mismatch is detected (e.g. zero skills overlap, study year too low). |
| **Domain redistribution** | When a student's programme or an offer's domain is unrecognised, the domain weight is split — half moves to skills, half stays as a neutral 50 — so missing data never silently penalises the student. |
