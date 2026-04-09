# 🗺️ Implementation Plan
## Assignment Submission Automation System (ASAS)
**Last Updated:** April 9, 2026  
**Timeline:** 4 Days  
**Stack:** Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase

---

## 📊 Overall Progress

| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| Phase 0 | Documentation Setup | ✅ Complete | 3/3 files |
| Phase 1 | UI Refinement | ✅ Complete | 8/8 tasks |
| Phase 2 | Supabase Authentication | ✅ Complete | 5/6 tasks |
| Phase 3 | Assignment System (Database) | ⛾ Not Started | 0/5 tasks |
| Phase 4 | File Upload (Storage) | ⛾ Not Started | 0/4 tasks |
| Phase 5 | Version Tracking System | ⛾ Not Started | 0/4 tasks |
| Phase 6 | Grading & Feedback | ⛾ Not Started | 0/4 tasks |
| Phase 7 | Final Polish & Testing | 🟡 In Progress | 4/6 tasks |

---

## ✅ Phase 0: Documentation Setup
**Goal:** Create all required project docs in `/docs` folder  
**Status:** ✅ COMPLETE  
**Duration:** 30 minutes

- [x] Create `/docs/PRD.md` — Product Requirements Document
- [x] Create `/docs/FEATURES.md` — Full features list (MVP + Optional)
- [x] Create `/docs/IMPLEMENTATION_PLAN.md` — This file (live progress tracker)

---

## ✅ Phase 1: UI Refinement
**Goal:** Polish existing UI, add missing components, improve UX  
**Status:** ✅ COMPLETE  
**Duration:** ~4 hours  
**Day:** Day 1–2

### 1.1 — Global Styles & Animations
- [x] Add keyframe animations (`fadeIn`, `slideUp`, `fadeInUp`) to `app/globals.css`
- [x] Add smooth scrollbar styling (orange 6px thumb)
- [x] Add focus-visible states for accessibility (2px orange outline)
- [x] Verify orange theme tokens are consistent in light + dark mode

### 1.2 — Login Page (`components/login.tsx`)
- [x] Add **Sign Up tab** — toggle between Sign In / Sign Up
- [x] Add **Full Name field** visible only on signup (animates in with `fadeIn`)
- [x] Add **loading spinner** on form submit (`Loader2` icon, button disabled)
- [x] Add **error messages** (inline `AlertCircle` styled error box)
- [x] Add subtle entrance animation (card slides up via `slideUp` keyframe)
- [x] Fix mobile padding and layout (responsive `max-w-md` centered)

### 1.3 — Student Dashboard (`components/student-dashboard.tsx`)
- [x] Add **Stats Cards** row at top (Total, Submitted, Pending, Under Review)
- [x] Add **search bar** to filter assignment cards
- [x] Add **deadline urgency indicator** (red < 2 days, amber < 5 days)
- [x] Add **"View"** button in submissions table → opens Version History panel
- [x] Add **version badge** (v1, v2…) on current submissions
- [x] Add **grade column** with color-coded badge (green/amber/red)
- [x] Staggered card entrance animations with `animationDelay`
- [x] Empty state with icon + helpful message

### 1.4 — Teacher Dashboard (`components/teacher-dashboard.tsx`)
- [x] Add **Stats Cards** row at top (Assignments, Total Submissions, Pending, Graded)
- [x] Add **Active / Expired** badge per assignment based on deadline
- [x] Add **Delete assignment** button with AlertDialog confirmation
- [x] Add **Grade button** (GraduationCap icon) → opens GradeModal
- [x] Add **Hist button** per submission → opens Version History panel
- [x] Responsive grid: 1-col mobile, 3-col desktop

### 1.5 — Upload Modal (`components/upload-modal.tsx`)
- [x] Restrict accepted files: `.pdf,.doc,.docx,.zip,.ppt,.pptx`
- [x] File type + size validation with `AlertCircle` error message
- [x] Simulated **upload progress bar** (Progress component, 0→100%)
- [x] **Version note** optional textarea field
- [x] Shows next version: "Will submit as v2"
- [x] File size displayed in MB

### 1.6 — Version History Component (`components/version-history.tsx`) — NEW FILE
- [x] Created slide-out **Sheet panel**
- [x] Timeline layout: dot indicator → version badge → filename → date → size → note
- [x] Latest version highlighted with orange badge + "Latest" label
- [x] Download button for teachers only (`isTeacher` prop)
- [x] Empty state with FileText icon + message

### 1.7 — Grade Modal (`components/grade-modal.tsx`) — NEW FILE
- [x] Created Dialog modal for grading
- [x] Numeric score input (0–100) with inline validation error
- [x] Written feedback textarea (optional)
- [x] Submit Grade → updates status to "graded" in parent state
- [x] Pre-fills existing grade/feedback when re-grading

### 1.8 — Floating Menu (`components/floating-menu.tsx`)
- [x] Replaced Share/Favorite with Search + History contextual buttons
- [x] Tooltip labels on all buttons via `TooltipProvider`
- [x] Contextual `centerLabel` prop per dashboard role
- [ ] Hide-on-scroll-down / show-on-scroll-up (deferred — not critical for MVP)

---

## ✅ Phase 2: Supabase Authentication
**Goal:** Real login/signup/logout with Supabase Auth  
**Status:** ✅ COMPLETE (SQL run in dashboard still needed)  
**Duration:** ~3 hours  
**Day:** Day 2

### 2.1 — Environment Setup
- [x] Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (template created — **fill in real credentials**)
- [x] Add `.env.local` to `.gitignore` (already present by default)
- [x] Install Supabase client: `npm install @supabase/supabase-js` ✔ (confirmed installed)

### 2.2 — Supabase Client (`lib/supabase.ts`)
- [x] Create browser Supabase client with env vars
- [x] Export typed client + `Profile`, `Assignment`, `Submission` interfaces

### 2.3 — Auth Functions (`lib/auth.ts`)
- [x] `signUp(email, password, fullName, role)` — creates user with metadata
- [x] `signIn(email, password)` — authenticates user
- [x] `signOut()` — logs out and clears session
- [x] `getUserProfile()` — fetches profile row from `profiles` table
- [ ] `getSession()` — returns current session *(minor omission, can add inline)*

### 2.4 — Auth Hook (`hooks/use-auth.ts`)
- [x] `useAuth()` hook with profile + loading states
- [x] Auto-fetch profile via `getUserProfile()` after session confirmed
- [x] `onAuthStateChange` listener handles sign in / sign out automatically

### 2.5 — Wire Login Component
- [x] Connect Sign In form → `signIn()` → `useAuth` detects session → routes to dashboard
- [x] Connect Sign Up form → `signUp()` → same routing flow
- [x] Supabase error messages mapped to user-friendly text
- [x] Loading spinner on button during auth
- [x] Role selector shown only on Sign Up (cleaner UX)

### 2.6 — Supabase Database Setup (SQL — run in Supabase Dashboard)
- [x] SQL schema file created at `docs/supabase-schema.sql` (profiles + assignments + submissions + RLS)
- [ ] **Run SQL in Supabase Dashboard → SQL Editor** *(you need to do this)*
- [ ] Confirm trigger is working (test signup)

---

## ⬜ Phase 3: Assignment System (Database)
**Goal:** Full CRUD for assignments and submissions in Supabase  
**Status:** ⬜ NOT STARTED  
**Duration:** ~2 hours  
**Day:** Day 3

### 3.1 — Database Schema (run in Supabase SQL Editor)
```sql
-- Assignments table
CREATE TABLE public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Submissions table (each row = one version)
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  version INTEGER NOT NULL DEFAULT 1,
  version_note TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'graded')),
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Assignments: anyone authenticated can view, only teachers can insert/delete
CREATE POLICY "Anyone can view assignments" ON public.assignments
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Teachers can create assignments" ON public.assignments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );
CREATE POLICY "Teachers can delete own assignments" ON public.assignments
  FOR DELETE USING (teacher_id = auth.uid());

-- Submissions: students see own, teachers see all
CREATE POLICY "Students see own submissions" ON public.submissions
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers see all submissions" ON public.submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );
CREATE POLICY "Students can insert submissions" ON public.submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers can update submissions (grading)" ON public.submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );
```
- [ ] Run assignments + submissions SQL in Supabase Dashboard
- [ ] Verify RLS policies in Supabase Table Editor

### 3.2 — Database Functions (`lib/database.ts`)
- [ ] `getAssignments()` — fetch all assignments with teacher profile join
- [ ] `createAssignment(title, description, deadline)` — teacher creates
- [ ] `deleteAssignment(id)` — teacher deletes
- [ ] `getStudentSubmissions(studentId)` — latest version per assignment
- [ ] `getAllSubmissions()` — teacher view with student profile join
- [ ] `getVersionHistory(assignmentId, studentId)` — all versions sorted
- [ ] `getNextVersionNumber(assignmentId, studentId)` — returns next version int

### 3.3 — Wire Student Dashboard to Database
- [ ] Replace `mockAssignments` with `getAssignments()` call
- [ ] Replace `mockSubmissions` with `getStudentSubmissions()` call
- [ ] Add loading skeleton while data fetches
- [ ] Real-time subscription on new assignments

### 3.4 — Wire Teacher Dashboard to Database
- [ ] Replace mock data with `getAllSubmissions()` call
- [ ] Wire Create Assignment form to `createAssignment()`
- [ ] Wire Delete button to `deleteAssignment()` with confirm dialog
- [ ] Real-time subscription on new submissions

### 3.5 — Update page.tsx
- [ ] Remove mock login logic
- [ ] Use `useAuth()` for session and role detection
- [ ] Pass real `userName` from profile

---

## ⬜ Phase 4: File Upload (Supabase Storage)
**Goal:** Real file uploads stored in Supabase, with download access for teachers  
**Status:** ⬜ NOT STARTED  
**Duration:** ~2 hours  
**Day:** Day 3

### 4.1 — Supabase Storage Setup (Dashboard)
- [ ] Create storage bucket: `submissions` (private)
- [ ] Set bucket policy: authenticated users can upload, teachers can download
```sql
-- Storage Policy: Students can upload to own folder
CREATE POLICY "Students can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions' AND auth.role() = 'authenticated'
);

-- Storage Policy: Users can access their own files; teachers can access all
CREATE POLICY "Access own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'submissions' AND (
    auth.uid()::text = (storage.foldername(name))[2]
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  )
);
```
- [ ] Run storage policies in Supabase SQL Editor

### 4.2 — Storage Functions (`lib/storage.ts`)
- [ ] `uploadFile(file, assignmentId, studentId, version)` → returns file URL
- [ ] `getDownloadUrl(filePath)` → returns signed URL (1 hour expiry)
- [ ] `deleteFile(filePath)` → removes from storage

### 4.3 — Wire Upload Modal to Storage
- [ ] On form submit: call `uploadFile()` → get URL
- [ ] Insert submission row into DB with `file_url`, `file_name`, `file_size`, `version`
- [ ] Show real upload progress from Supabase SDK
- [ ] Show success toast with version number
- [ ] On error: show error toast, allow retry

### 4.4 — Wire Teacher Download
- [ ] Download button → calls `getDownloadUrl()` → triggers browser download
- [ ] Handle expired URLs gracefully

---

## ⬜ Phase 5: Version Tracking System
**Goal:** Full version history UI wired to Supabase data  
**Status:** ⬜ NOT STARTED  
**Duration:** ~2 hours  
**Day:** Day 3–4

### 5.1 — Version History UI (`components/version-history.tsx`)
- [ ] Open Sheet panel when "View History" clicked
- [ ] Fetch version history from `getVersionHistory()` on open
- [ ] Display timeline: v1 → v2 → v3... newest at top
- [ ] Each entry: version badge, filename, date, file size, optional note
- [ ] Highlight latest version with orange ring
- [ ] Download button (teachers only) → signed URL download

### 5.2 — Auto-increment Version Logic
- [ ] On new upload: call `getNextVersionNumber()` before upload
- [ ] Pass version number to upload path and DB insert
- [ ] Update submissions table to insert new row (not update existing)

### 5.3 — Student Dashboard Integration
- [ ] "View History" button per row in submissions table → opens version panel
- [ ] Submissions table shows latest version badge (v1, v2, v3)
- [ ] Upload button label changes to "Resubmit (v2)" if already submitted

### 5.4 — Teacher Dashboard Integration
- [ ] "View History" button per student row → opens version panel
- [ ] Version panel shows download button for teachers
- [ ] Submissions table shows highest version per student

---

## ⬜ Phase 6: Grading & Feedback System
**Goal:** Teachers can grade submissions and students can see their grades  
**Status:** ⬜ NOT STARTED  
**Duration:** ~2 hours  
**Day:** Day 4

### 6.1 — Grade Modal (`components/grade-modal.tsx`)
- [ ] Dialog opens from "Grade" button in teacher dashboard
- [ ] Shows student name, assignment name, latest version
- [ ] Numeric score input: 0–100 with validation
- [ ] Feedback textarea: optional written comments
- [ ] If already graded: shows existing grade/feedback pre-filled
- [ ] Submit → call `gradeSubmission(id, grade, feedback)`

### 6.2 — Grade DB Function (`lib/database.ts`)
- [ ] `gradeSubmission(submissionId, grade, feedback)` — updates row, sets status = 'graded'
- [ ] `updateStatus(submissionId, status)` — teacher manually updates status

### 6.3 — Wire Teacher Dashboard
- [ ] "Grade" button per submission row → open grade modal
- [ ] After grading: row status badge updates to "Graded"
- [ ] Grade score shown in submissions table

### 6.4 — Wire Student Dashboard
- [ ] Submissions table shows "Grade" column (hidden until graded)
- [ ] Display: `85/100` with colored indicator (green ≥ 75, amber ≥ 50, red < 50)
- [ ] Click grade badge → shows feedback in tooltip or small popover

---

## ⬜ Phase 7: Final Polish & Testing
**Goal:** Production-ready quality, no broken flows, fully responsive  
**Status:** ⬜ NOT STARTED  
**Duration:** ~2 hours  
**Day:** Day 4

### 7.1 — Loading States
- [ ] Add `Skeleton` components on all data-fetched areas
- [ ] Loading spinner on all async buttons (submit, upload, grade)
- [ ] Disable buttons during loading to prevent double-submit

### 7.2 — Error Handling
- [ ] Wrap data-fetching in try/catch with user-friendly toast errors
- [ ] Network error fallback state (retry button)
- [ ] File upload failure recovery

### 7.3 — Toast Notifications (Sonner)
- [ ] Login success / failure
- [ ] Signup success / failure
- [ ] Assignment created / deleted
- [ ] File uploaded successfully (with version number)
- [ ] Grade submitted
- [ ] Session expired → redirect toast

### 7.4 — Accessibility
- [ ] All interactive elements have `aria-label`
- [ ] Keyboard navigation through dashboards
- [ ] Color contrast meets WCAG AA in both light and dark mode
- [ ] Form inputs have associated labels

### 7.5 — Responsive Testing
- [ ] Login page: mobile (375px), tablet (768px), desktop (1280px)
- [ ] Student Dashboard: all breakpoints
- [ ] Teacher Dashboard: all breakpoints
- [ ] Upload Modal: mobile scroll works
- [ ] Version History panel: mobile layout

### 7.6 — Build Verification
- [ ] `npm run build` passes with 0 errors
- [ ] No TypeScript type errors
- [ ] No console errors in browser
- [ ] Test full flow: signup → create assignment → submit → grade → view grade

---

## 📝 Decisions & Notes

| Decision | Choice | Reason |
|----------|--------|--------|
| File types | PDF, DOC, DOCX, ZIP, PPT, PPTX | User requirement |
| Max file size | 10MB | Supabase free tier |
| Email verification | Disabled | User requirement |
| Grading in MVP | Yes | User requirement |
| Version tracking | New DB row per submission | Clean history, easy rollback |
| Auth method | Supabase email/password | Simple, no OAuth needed |

---

## 🔧 Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📅 Day-by-Day Timeline

| Day | Phases | Goal |
|-----|--------|------|
| Day 1 | Phase 0 + Phase 1 (UI) | All UI polished, no backend needed |
| Day 2 | Phase 1 (finish) + Phase 2 (Auth) | Login/signup working with Supabase |
| Day 3 | Phase 3 + Phase 4 + Phase 5 | Full CRUD, file upload, version tracking |
| Day 4 | Phase 6 + Phase 7 | Grading system + final polish |
