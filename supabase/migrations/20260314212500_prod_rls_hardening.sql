-- Prod readiness: RLS hardening by role

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role from public.profiles p where p.id = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin'::public.user_role, false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin'::public.user_role,'dentist'::public.user_role,'secretary'::public.user_role,'assistant'::public.user_role), false);
$$;

-- remove permissive baseline policies where present
DROP POLICY IF EXISTS "patients_staff_rw" ON public.patients;
DROP POLICY IF EXISTS "appointments_staff_rw" ON public.appointments;
DROP POLICY IF EXISTS "online_appointments_staff_rw" ON public.online_appointments;
DROP POLICY IF EXISTS "clinical_procedures_staff_rw" ON public.clinical_procedures;
DROP POLICY IF EXISTS "invoices_staff_rw" ON public.invoices;
DROP POLICY IF EXISTS "payments_staff_rw" ON public.payments;
DROP POLICY IF EXISTS "notes_staff_rw" ON public.notes;
DROP POLICY IF EXISTS "waiting_room_staff_rw" ON public.waiting_room_visits;
DROP POLICY IF EXISTS "message_logs_staff_rw" ON public.message_logs;
DROP POLICY IF EXISTS "documents_staff_rw" ON public.documents;
DROP POLICY IF EXISTS "treatment_plans_staff_rw" ON public.treatment_plans;
DROP POLICY IF EXISTS "treatment_plan_items_staff_rw" ON public.treatment_plan_items;
DROP POLICY IF EXISTS "inventory_products_staff_rw" ON public.inventory_products;
DROP POLICY IF EXISTS "inventory_purchases_staff_rw" ON public.inventory_purchases;
DROP POLICY IF EXISTS "prostheses_staff_rw" ON public.prostheses;
DROP POLICY IF EXISTS "medical_certificates_staff_rw" ON public.medical_certificates;

-- staff read/write, admin delete-only behavior for sensitive finance ops can be tightened later
CREATE POLICY "patients_staff_select" ON public.patients FOR SELECT USING (public.is_staff());
CREATE POLICY "patients_staff_write" ON public.patients FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "patients_staff_update" ON public.patients FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "patients_admin_delete" ON public.patients FOR DELETE USING (public.is_admin());

CREATE POLICY "appointments_staff_select" ON public.appointments FOR SELECT USING (public.is_staff());
CREATE POLICY "appointments_staff_write" ON public.appointments FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "appointments_staff_update" ON public.appointments FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "appointments_admin_delete" ON public.appointments FOR DELETE USING (public.is_admin());

CREATE POLICY "online_appointments_staff_all" ON public.online_appointments FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "clinical_procedures_staff_all" ON public.clinical_procedures FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "invoices_staff_all" ON public.invoices FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "payments_staff_all" ON public.payments FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "waiting_room_staff_all" ON public.waiting_room_visits FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "message_logs_staff_all" ON public.message_logs FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "documents_staff_all" ON public.documents FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "treatment_plans_staff_all" ON public.treatment_plans FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "treatment_plan_items_staff_all" ON public.treatment_plan_items FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "inventory_products_staff_all" ON public.inventory_products FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "inventory_purchases_staff_all" ON public.inventory_purchases FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "prostheses_staff_all" ON public.prostheses FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "medical_certificates_staff_all" ON public.medical_certificates FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
