# 📄 Product Requirements Document (PRD)
## Assignment Submission Automation System (ASAS)
**Version:** 1.0  
**Date:** April 2026  
**Status:** 🟡 In Development

---

## 1. Overview

The **Assignment Submission Automation System (ASAS)** is a web-based platform designed to streamline the process of submitting, managing, reviewing, and grading academic assignments between students and teachers. The system eliminates paper-based submissions and manual tracking by providing a centralized, digital workflow.

---

## 2. Problem Statement

Academic institutions face several challenges with traditional assignment submission:

- **Disorganized submissions** — Emails, WhatsApp, physical copies create chaos
- **No version tracking** — Students cannot revise or resubmit with history
- **Manual grade tracking** — Teachers struggle to keep grading records organized
- **No deadline enforcement** — Late submissions are hard to track
- **No audit trail** — No record of who submitted what and when

ASAS solves all of these by providing a structured, role-based digital submission platform.

---

## 3. Goals

### Primary Goals
- Provide a clean, minimal interface for students to submit assignments
- Allow teachers to create, manage, and review assignments
- Implement automatic version tracking for every submission
- Enable teachers to grade and provide feedback directly on the platform
- Support file uploads (PDF, DOCX, DOC, ZIP, PPT, PPTX) up to 10MB

### Secondary Goals
- Responsive design for mobile and desktop
- Light mode (default) and dark mode support
- Fast, reliable cloud storage via Supabase
- Secure authentication with role-based access

---

## 4. User Roles

### 👨‍🎓 Student
- Can register and log in with email/password
- Can view all available assignments with deadlines
- Can upload assignment files (multiple allowed formats)
- Can resubmit assignments (triggers new version)
- Can view their own submission history and version log
- Can see submission status (Submitted / Under Review / Graded)
- Can view grades and teacher feedback once graded

### 👩‍🏫 Teacher
- Can register and log in with email/password
- Can create new assignments (title, description, deadline)
- Can delete assignments they created
- Can view all student submissions for their assignments
- Can download any student's submitted file
- Can view full version history per student
- Can assign grades (numeric score) and written feedback
- Can update submission status (Under Review → Graded)

---

## 5. Core Features

| Feature | Student | Teacher |
|---------|---------|---------|
| Authentication (signup/login/logout) | ✅ | ✅ |
| View assignments | ✅ | ✅ |
| Create assignments | ❌ | ✅ |
| Delete assignments | ❌ | ✅ |
| Upload submission | ✅ | ❌ |
| Resubmit (versioning) | ✅ | ❌ |
| View version history | ✅ | ✅ |
| Download submissions | ❌ | ✅ |
| Grade & feedback | ❌ | ✅ |
| View own grade | ✅ | ❌ |
| Dark/light mode | ✅ | ✅ |

---

## 6. Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (New York style) |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Deployment | Vercel (planned) |

---

## 7. Scope

### In Scope (MVP)
- User registration and login (no email verification)
- Role-based dashboards (Student / Teacher)
- Assignment creation and management by teachers
- File upload for students (PDF, DOCX, DOC, ZIP, PPT, PPTX — max 10MB)
- Automatic version tracking per student per assignment
- Grade + feedback by teachers
- Version history view for both roles
- Dark/light mode toggle
- Responsive layout (mobile + desktop)

### Out of Scope (Future)
- Email notifications for deadlines and grades
- Plagiarism detection
- Analytics dashboard
- Peer review system
- Batch download (ZIP all submissions)
- Admin panel

---

## 8. Constraints

- **Deadline:** 4-day development timeline
- **Team:** Solo developer
- **Budget:** Free tier Supabase + Vercel
- **File limit:** 10MB per submission (Supabase free tier)
- **Users:** Academic prototype, not production-scale

---

## 9. Success Metrics

- Student can submit an assignment in under 2 minutes
- Teacher can create an assignment in under 1 minute
- Version history loads in under 1 second
- Zero broken flows on login/logout
- Works on both mobile and desktop browsers
