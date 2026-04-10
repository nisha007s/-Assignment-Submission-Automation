import { supabase } from "./supabase";

export interface AssignmentRecord {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  teacher_id: string;
  created_at: string;
}

export interface StudentSubmissionRecord {
  id: string;
  assignment_id: string;
  assignment_title: string;
  version: number;
  status: "submitted" | "under_review" | "graded";
  created_at: string;
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
}

export interface SubmissionVersionRecord {
  id: string;
  assignment_id: string;
  student_id: string;
  version: number;
  status: "submitted" | "under_review" | "graded";
  file_name: string;
  file_size: number;
  version_note: string | null;
  created_at: string;
}

export async function getAssignments(): Promise<AssignmentRecord[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .order("deadline", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AssignmentRecord[];
}

export async function createAssignment(title: string, description: string, deadline: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      title,
      description,
      deadline,
      teacher_id: userData.user.id,
    })
    .select("*")
    .single();

  if (error) throw error;
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
    .select("id, assignment_id, version, status, created_at, assignments(title)")
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
    .select("id, assignment_id, student_id, version, status, created_at, assignments(title), profiles!submissions_student_id_fkey(full_name)")
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
      });
    }
  });

  return Array.from(latestByStudentAssignment.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getVersionHistory(
  assignmentId: string,
  studentId: string
): Promise<SubmissionVersionRecord[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("id, assignment_id, student_id, version, status, file_name, file_size, version_note, created_at")
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
