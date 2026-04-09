# ✨ Features List
## Assignment Submission Automation System (ASAS)

---

## 🟢 MVP Features (Must Ship in 4 Days)

### 🔐 Authentication
- [ ] Student signup (email, password, full name, role)
- [ ] Teacher signup (email, password, full name, role)
- [ ] Login with email + password
- [ ] Role-based redirect after login (Student → Student Dashboard, Teacher → Teacher Dashboard)
- [ ] Logout from any dashboard
- [ ] Session persistence (stay logged in on refresh)
- [ ] No email verification required

### 📋 Assignment Management (Teacher)
- [ ] Create assignment with title, description, and deadline
- [ ] View list of all created assignments with deadline status
- [ ] Delete an assignment (and its submissions)
- [ ] Assignment status indicator (Active / Expired based on deadline)

### 📤 Assignment Submission (Student)
- [ ] View all available assignments with deadline and description
- [ ] Upload file for an assignment (PDF, DOCX, DOC, ZIP, PPT, PPTX — max 10MB)
- [ ] Drag-and-drop file upload OR click to browse
- [ ] File type validation with user-friendly error message
- [ ] File size validation (max 10MB)
- [ ] Resubmit to increment version automatically (v1 → v2 → v3...)
- [ ] Add optional version note with each upload
- [ ] Upload progress indicator

### 📊 Student Dashboard
- [ ] Stats cards: Total Assignments | Submitted | Pending | Under Review
- [ ] Assignment cards with title, description, deadline, and Upload button
- [ ] My Submissions table (Assignment, Version, Date, Status columns)
- [ ] View grade and teacher feedback per submission
- [ ] Click to view version history for each submission
- [ ] Search/filter assignments by title

### 🖥️ Teacher Dashboard
- [ ] Stats cards: Total Submissions | Pending Review | Graded
- [ ] Student submissions table (Student, Assignment, Version, Date, Action)
- [ ] Download any student's latest submission file
- [ ] View full version history per student per assignment
- [ ] Download any specific version from history
- [ ] Grade submission (numeric score 0–100)
- [ ] Leave written feedback per submission
- [ ] Update submission status: Submitted → Under Review → Graded

### 🕐 Version History
- [ ] Timeline view showing all versions of a submission
- [ ] Each version shows: version number, filename, file size, upload date, version note
- [ ] Download button for each version (teacher only)
- [ ] Highlight latest version
- [ ] Student can see their own version history

### 💾 File Storage
- [ ] Files uploaded to Supabase Storage
- [ ] Organized path: `{assignment_id}/{student_id}/v{version}/{filename}`
- [ ] Secure download URLs for teachers
- [ ] Students cannot access other students' files

### 🎨 UI/UX
- [ ] Light mode (default) with orange + black theme
- [ ] Dark mode toggle (persists in localStorage)
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Loading skeletons for data-fetching states
- [ ] Toast notifications for all user actions
- [ ] Smooth entrance animations on cards
- [ ] Floating action menu in dashboards
- [ ] Empty state illustrations when no data

---

## 🔵 Optional / Future Features (Post-MVP)

### 📧 Notifications
- [ ] Email notification to student when assignment is graded
- [ ] Email reminder 24 hours before deadline
- [ ] In-app notification bell with unread count

### 📊 Analytics
- [ ] Teacher analytics: submission rate, on-time vs late
- [ ] Student analytics: grade history chart
- [ ] Class-wide grade distribution bell curve

### 🔍 Academic Integrity
- [ ] Basic plagiarism check (compare against previous submissions)
- [ ] Similarity score display for teachers
- [ ] Flag suspicious submissions

### 📦 Bulk Operations
- [ ] Teacher: Download all submissions for an assignment as ZIP
- [ ] Teacher: Bulk grade update via CSV import
- [ ] Teacher: Export grades to Excel/CSV

### 💬 Communication
- [ ] Teacher can leave inline comments on submissions
- [ ] Student can reply to teacher feedback
- [ ] Assignment announcement broadcasts (grade released, new assignment)

### 👑 Admin Panel
- [ ] Admin role with full system visibility
- [ ] User management (deactivate accounts)
- [ ] System-wide analytics

### 🔗 Integrations
- [ ] Google Drive import for students
- [ ] LMS integration (Moodle, Canvas)
- [ ] GitHub repository link as submission

---

## Feature Priority Matrix

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| Auth (login/signup) | 🔴 Critical | Low | ⬜ Pending |
| Assignment CRUD | 🔴 Critical | Low | ⬜ Pending |
| File Upload | 🔴 Critical | Medium | ⬜ Pending |
| Version Tracking | 🔴 Critical | Medium | ⬜ Pending |
| Grading + Feedback | 🔴 Critical | Medium | ⬜ Pending |
| Stats Cards | 🟡 Important | Low | ⬜ Pending |
| Version History UI | 🟡 Important | Medium | ⬜ Pending |
| Dark Mode | 🟡 Important | Low | ✅ Done |
| Email Notifications | 🟢 Nice to Have | High | ⬜ Future |
| Plagiarism Check | 🟢 Nice to Have | Very High | ⬜ Future |
| Analytics | 🟢 Nice to Have | High | ⬜ Future |
