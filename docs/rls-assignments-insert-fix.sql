-- ============================================================
-- Fix: "new row violates row-level security policy" on assignments INSERT
-- Run in Supabase → SQL Editor
-- ============================================================
--
-- Common causes:
-- 1) Policy used FOR INSERT ... USING (...) — for INSERT, Postgres uses WITH CHECK,
--    not USING. Supabase UI sometimes creates the wrong form.
-- 2) Policy only checks profiles.role but not teacher_id = auth.uid(), so a
--    mismatched teacher_id fails a strict policy — or the opposite: only
--    teacher_id = auth.uid() without confirming role = teacher.
-- 3) Session missing: insert runs without JWT → auth.uid() IS NULL → any check fails.
--
-- This policy is aligned with lib/database.ts createAssignment(), which sets
-- teacher_id = auth.getUser().id for the signed-in teacher.
-- ============================================================

DROP POLICY IF EXISTS "assignments_insert" ON public.assignments;

CREATE POLICY "assignments_insert" ON public.assignments
FOR INSERT
TO authenticated
WITH CHECK (
  teacher_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'teacher'
  )
);
