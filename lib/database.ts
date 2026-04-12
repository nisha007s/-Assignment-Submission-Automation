import { supabase } from "./supabase";

export interface AssignmentRecord {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  teacher_id: string;
  created_at: string;
  /** Storage path or URL for teacher-uploaded handout (PDF/DOC/DOCX). Omitted if column not migrated yet. */
  file_url?: string | null;
}

export interface StudentSubmissionRecord {
  id: string;
  assignment_id: string;
  assignment_title: string;
  version: number;
  status: "submitted" | "under_review" | "graded";
  created_at: string;
  grade: number | null;
  feedback: string | null;
}

export interface TeacherSubmissionRecord {
  id: string;
  assignment_id: string;
  assignment_title: string;
  student_id: string;
  student_name: string;
  version: number;
  status: "submitted" | "under_review" | "graded";
  created_at: string;
  file_url: string | null;
  file_name: string | null;
  grade: number | null;
  feedback: string | null;
}

export interface SubmissionVersionRecord {
  id: string;
  assignment_id: string;
  student_id: string;
  version: number;
  status: "submitted" | "under_review" | "graded";
  file_name: string;
  file_size: number;
  file_url: string | null;
  version_note: string | null;
  created_at: string;
}

export interface CreateSubmissionInput {
  assignment_id: string;
  student_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  /** Defaults to `1` when omitted. */
  version?: number;
}

export async function createSubmission(data: CreateSubmissionInput): Promise<{ id: string }> {
  const version = data.version ?? 1;

  const payload = {
    assignment_id: data.assignment_id,
    student_id: data.student_id,
    file_url: data.file_url,
    file_name: data.file_name,
    file_size: data.file_size,
    version,
    status: "submitted" as const,
  };

  const urlPreview =
    payload.file_url && payload.file_url.length > 80
      ? `${payload.file_url.slice(0, 80)}…`
      : payload.file_url;
  console.log("[createSubmission] inserting row", { ...payload, file_url: urlPreview });

  const { data: row, error } = await supabase
    .from("submissions")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("[createSubmission] Supabase error", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  console.log("[createSubmission] insert OK", row);
  if (!row?.id) throw new Error("Submission insert returned no id");
  return { id: row.id as string };
}

export async function getAssignments(): Promise<AssignmentRecord[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .order("deadline", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AssignmentRecord[];
}

export async function createAssignment(
  title: string,
  description: string,
  deadline: string,
  file_url?: string | null
): Promise<AssignmentRecord> {
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();

  console.log("[createAssignment] getSession", {
    hasSession: !!session,
    sessionError: sessionErr?.message ?? null,
    accessTokenPresent: !!session?.access_token,
    sessionUserId: session?.user?.id ?? null,
  });

  if (!session?.access_token) {
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
    console.log("[createAssignment] refreshSession", {
      ok: !!refreshed.session,
      refreshError: refreshErr?.message ?? null,
    });
    if (!refreshed.session?.access_token) {
      throw new Error(
        "No active Supabase session (JWT missing). Sign in again. " +
          (refreshErr?.message ?? sessionErr?.message ?? "")
      );
    }
  }

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  console.log("[createAssignment] getUser", {
    userId: user?.id ?? null,
    userError: userErr?.message ?? null,
  });

  if (userErr) throw userErr;
  if (!user?.id) throw new Error("Not authenticated");

  const teacherId = user.id;

  const payload: Record<string, unknown> = {
    title,
    description,
    deadline,
    teacher_id: teacherId,
  };
  if (file_url != null && String(file_url).trim() !== "") {
    payload.file_url = file_url;
  }

  console.log("[createAssignment] insert payload", {
    teacher_id: teacherId,
    deadline,
    hasFileUrl: "file_url" in payload,
  });

  const { data, error } = await supabase.from("assignments").insert(payload).select("*").single();

  if (error) {
    console.error("[createAssignment] Supabase error", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  return data as AssignmentRecord;
}
   

export async function deleteAssignment(assignmentId: string) {
  const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);
  if (error) throw error;
}

export async function getStudentSubmissions(): Promise<StudentSubmissionRecord[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("submissions")
    .select("id, assignment_id, version, status, created_at, grade, feedback, assignments(title)")
    .eq("student_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const latestByAssignment = new Map<string, StudentSubmissionRecord>();
  (data ?? []).forEach((row: any) => {
    const existing = latestByAssignment.get(row.assignment_id);
    if (!existing || row.version > existing.version) {
      latestByAssignment.set(row.assignment_id, {
        id: row.id,
        assignment_id: row.assignment_id,
        assignment_title: row.assignments?.title ?? "Untitled Assignment",
        version: row.version,
        status: row.status,
        created_at: row.created_at,
        grade: row.grade ?? null,
        feedback: row.feedback ?? null,
      });
    }
  });

  return Array.from(latestByAssignment.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getAllSubmissions(): Promise<TeacherSubmissionRecord[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, assignment_id, student_id, version, status, created_at, file_url, file_name, grade, feedback, assignments(title), profiles!submissions_student_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const latestByStudentAssignment = new Map<string, TeacherSubmissionRecord>();
  (data ?? []).forEach((row: any) => {
    const key = `${row.student_id}-${row.assignment_id}`;
    const existing = latestByStudentAssignment.get(key);
    if (!existing || row.version > existing.version) {
      latestByStudentAssignment.set(key, {
        id: row.id,
        assignment_id: row.assignment_id,
        assignment_title: row.assignments?.title ?? "Untitled Assignment",
        student_id: row.student_id,
        student_name: row.profiles?.full_name ?? "Unknown Student",
        version: row.version,
        status: row.status,
        created_at: row.created_at,
        file_url: row.file_url ?? null,
        file_name: row.file_name ?? null,
        grade: row.grade ?? null,
        feedback: row.feedback ?? null,
      });
    }
  });

  return Array.from(latestByStudentAssignment.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function normalizeGrade(grade: number): number {
  const n = Math.round(grade);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new Error("Grade must be a whole number from 0 to 100");
  }
  return n;
}

/**
 * Saves a numeric grade and optional feedback, marks the submission as graded.
 * Does not set `updated_at` here so grading works even if that column was never migrated.
 */
export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string | null
): Promise<void> {
  const id = submissionId?.trim();
  if (!id) throw new Error("Missing submission id");

  const g = normalizeGrade(grade);

  const { data, error } = await supabase
    .from("submissions")
    .update({
      grade: g,
      feedback,
      status: "graded",
    })
    .eq("id", id)
    .select("id");

  if (error) throw error;
  if (!data?.length) {
    throw new Error(
      "No submission was updated. Check that you are logged in as a teacher and Realtime/RLS allows updates."
    );
  }
}

export async function updateStatus(
  submissionId: string,
  status: "submitted" | "under_review" | "graded"
): Promise<void> {
  const id = submissionId?.trim();
  if (!id) throw new Error("Missing submission id");

  const { data, error } = await supabase
    .from("submissions")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) throw error;
  if (!data?.length) {
    throw new Error("No submission was updated.");
  }
}

export async function getVersionHistory(
  assignmentId: string,
  studentId: string
): Promise<SubmissionVersionRecord[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("id, assignment_id, student_id, version, status, file_name, file_size, file_url, version_note, created_at")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .order("version", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SubmissionVersionRecord[];
}

export async function getNextVersionNumber(assignmentId: string, studentId: string): Promise<number> {
  const { data, error } = await supabase
    .from("submissions")
    .select("version")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.version ?? 0) + 1;
}
