 # Assignment Submission Automation

Smart Academic Workflow System — IILM University, Gurugram

Automates the complete lifecycle of assignments — from creation and distribution to submission, grading, and feedback — with secure role-based dashboards for students and teachers.

---

## Stack

Next.js · React 18 · TypeScript · Tailwind CSS · shadcn/ui
Supabase (PostgreSQL · Auth · Storage)
Vercel (Deployment)

---

## 📊 Project Status

| Substep | Description                                          | Status |
| ------- | ---------------------------------------------------- | ------ |
| 1.1     | Project setup (Next.js + Tailwind + UI)              | ✅ Done |
| 1.2     | Authentication (Supabase Auth)                       | ✅ Done |
| 1.3     | Database schema (profiles, assignments, submissions) | ✅ Done |
| 1.4     | Teacher dashboard (create + manage assignments)      | ✅ Done |
| 1.5     | Student dashboard (view + submit assignments)        | ✅ Done |
| 1.6     | File upload (Supabase Storage)                       | ✅ Done |
| 1.7     | Grading system                                       | ✅ Done |
| 1.8     | UI polish + error handling                           | ✅ Done |
| 1.9     | Deployment (Vercel)                                  | ✅ Done |

---

## ⚙️ Prerequisites

| Tool             | Version | Notes        |
| ---------------- | ------- | ------------ |
| Node.js          | 18+     | nodejs.org   |
| Git              | Any     | git-scm.com  |
| Supabase Account | —       | supabase.com |

---

## 🛠 Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd assignment-submission-automation
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

### 4. Run Development Server

```bash
npm run dev
```

Open:
👉 http://localhost:3000

---

## 🗄 Database (Supabase)

### Tables

* `profiles` → user info (role: student/teacher)
* `assignments` → created by teachers
* `submissions` → uploaded by students

### Storage Buckets

* `assignments` → teacher uploaded files
* `submissions` → student uploaded files

---

## 🔐 Security (RLS)

* Teachers → create/delete assignments
* Students → upload submissions
* Authenticated users → read assignments
* File access controlled via policies

---

## 📁 Project Structure

```
assignment-submission-automation/
├── app/                        # Next.js pages (App Router)
├── components/                # UI components
│   ├── teacher-dashboard.tsx
│   ├── student-dashboard.tsx
│   ├── upload-modal.tsx
│   └── grade-modal.tsx
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── database.ts            # DB queries
│   └── storage.ts             # File upload logic
├── docs/                      # SQL + implementation notes
├── public/                    # Static assets
├── styles/                    # Tailwind config
├── .env.local                 # Environment variables (ignored)
└── package.json
```

---

## 🚀 Deployment

Frontend is deployed on Vercel.

### Steps

1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Click Deploy

---

## 🧪 Testing Flow

1. Signup as Teacher
2. Create assignment + upload file
3. Login as Student
4. Download assignment
5. Upload submission
6. Teacher grades submission
7. Student views result

---

## ✨ Features

### 👨‍🏫 Teacher

* Create assignments
* Upload files
* View submissions
* Grade students

### 👩‍🎓 Student

* View assignments
* Download files
* Submit work
* Resubmit before deadline

---

## ⚠️ Development Notes

* Never commit `.env.local`
* RLS must be enabled in Supabase
* Ensure correct policies for:

  * assignments
  * submissions
  * storage

---

## 📌 Future Improvements

* Email notifications
* Deadline reminders
* Admin panel
* Plagiarism detection

---

## 👩‍💻 Author

Nisha Sehrawat
B.Tech CSE — IILM University

---

## 🏁 Conclusion

This project demonstrates a complete production-ready full-stack application with authentication, database design, file handling, and deployment.
