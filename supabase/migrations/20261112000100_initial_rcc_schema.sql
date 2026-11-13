-- RCC Portal's initial tenant-aware schema.
-- All business tables are protected by RLS; workflow state changes use RPCs.

create extension if not exists pgcrypto with schema extensions;

create type public.account_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.employee_role as enum (
  'admin', 'senior_engineer', 'inspector', 'report_writer', 'designer', 'drafter'
);
create type public.project_status as enum ('planning', 'active', 'on_hold', 'completed', 'cancelled');
create type public.inspection_status as enum ('scheduled', 'in_progress', 'submitted', 'under_review', 'revision_requested', 'completed', 'cancelled');
create type public.task_type as enum ('inspection', 'report', 'design', 'drafting', 'general');
create type public.task_status as enum ('offered', 'accepted', 'in_progress', 'submitted', 'under_review', 'revision_requested', 'completed', 'declined', 'cancelled');
create type public.report_status as enum ('draft', 'in_progress', 'submitted_for_qa', 'revision_requested', 'qa_approved', 'pending_final_approval', 'approved', 'rejected');
create type public.approval_type as enum ('technical_qa', 'final');
create type public.approval_decision as enum ('approved', 'requested_changes', 'rejected');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.organizations (name, slug)
values ('RCC Portal', 'rcc-portal')
on conflict (slug) do nothing;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  email text not null,
  full_name text not null,
  phone text,
  job_title text,
  professional_details text,
  role public.employee_role,
  status public.account_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email),
  check (status <> 'approved' or role is not null)
);

create table public.role_permissions (
  role public.employee_role not null,
  permission_key text not null,
  primary key (role, permission_key)
);

insert into public.role_permissions (role, permission_key) values
  ('senior_engineer', 'projects.read_assigned'),
  ('senior_engineer', 'inspections.read_assigned'),
  ('senior_engineer', 'reports.read_assigned'),
  ('senior_engineer', 'reports.qa'),
  ('senior_engineer', 'tasks.read_assigned'),
  ('senior_engineer', 'tasks.respond'),
  ('inspector', 'projects.read_assigned'),
  ('inspector', 'inspections.read_assigned'),
  ('inspector', 'inspections.edit_assigned'),
  ('inspector', 'tasks.read_assigned'),
  ('inspector', 'tasks.respond'),
  ('report_writer', 'projects.read_assigned'),
  ('report_writer', 'inspections.read_assigned'),
  ('report_writer', 'reports.read_assigned'),
  ('report_writer', 'reports.edit_assigned'),
  ('report_writer', 'tasks.read_assigned'),
  ('report_writer', 'tasks.respond'),
  ('designer', 'projects.read_assigned'),
  ('designer', 'tasks.read_assigned'),
  ('designer', 'tasks.respond'),
  ('drafter', 'projects.read_assigned'),
  ('drafter', 'tasks.read_assigned'),
  ('drafter', 'tasks.respond');

create table public.permission_overrides (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  permission_key text not null,
  granted boolean not null,
  granted_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id, permission_key)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  company_name text,
  email text,
  phone text,
  contact_person text,
  billing_details jsonb not null default '{}'::jsonb,
  address jsonb not null default '{}'::jsonb,
  internal_notes text,
  created_by uuid not null references public.profiles(user_id),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null,
  reference text not null,
  title text not null,
  property_address jsonb not null default '{}'::jsonb,
  property_type text,
  building_information jsonb not null default '{}'::jsonb,
  category text,
  service_type text,
  description text,
  priority smallint not null default 3 check (priority between 1 and 5),
  status public.project_status not null default 'planning',
  start_date date,
  target_completion_date date,
  internal_notes text,
  created_by uuid not null references public.profiles(user_id),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, reference),
  unique (organization_id, id),
  foreign key (organization_id, client_id) references public.clients(organization_id, id)
);

create table public.project_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  added_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete cascade
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  assigned_inspector_id uuid references public.profiles(user_id),
  inspection_type text not null,
  status public.inspection_status not null default 'scheduled',
  scheduled_at timestamptz,
  started_at timestamptz,
  inspected_at timestamptz,
  instructions text,
  building_details jsonb not null default '{}'::jsonb,
  inspected_areas jsonb not null default '[]'::jsonb,
  environmental_conditions jsonb not null default '{}'::jsonb,
  summary text,
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles(user_id),
  reviewed_at timestamptz,
  created_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete cascade
);

create table public.inspection_observations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  inspection_id uuid not null,
  area text not null,
  element text,
  observation text not null,
  defect_type text,
  severity text check (severity in ('low', 'moderate', 'high', 'critical')),
  measurements jsonb not null default '{}'::jsonb,
  recommendations text,
  sort_order integer not null default 0,
  created_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, inspection_id) references public.inspections(organization_id, id) on delete cascade
);

create table public.inspection_photos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  inspection_id uuid not null,
  observation_id uuid references public.inspection_observations(id) on delete set null,
  storage_path text not null unique,
  caption text,
  captured_at timestamptz,
  latitude double precision,
  longitude double precision,
  uploaded_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  foreign key (organization_id, inspection_id) references public.inspections(organization_id, id) on delete cascade
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  inspection_id uuid,
  type public.task_type not null,
  title text not null,
  description text,
  assigned_to uuid references public.profiles(user_id),
  assigned_by uuid not null references public.profiles(user_id),
  status public.task_status not null default 'offered',
  priority smallint not null default 3 check (priority between 1 and 5),
  due_at timestamptz,
  response_note text,
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete cascade,
  foreign key (organization_id, inspection_id) references public.inspections(organization_id, id) on delete set null (inspection_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  inspection_id uuid,
  task_id uuid not null unique,
  report_writer_id uuid references public.profiles(user_id),
  title text not null,
  content jsonb not null default '{}'::jsonb,
  status public.report_status not null default 'draft',
  current_version integer not null default 1 check (current_version > 0),
  submitted_for_qa_at timestamptz,
  approved_at timestamptz,
  created_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete cascade,
  foreign key (organization_id, task_id) references public.tasks(organization_id, id) on delete cascade,
  foreign key (organization_id, inspection_id) references public.inspections(organization_id, id) on delete set null (inspection_id)
);

create table public.report_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  report_id uuid not null,
  version_number integer not null check (version_number > 0),
  title text not null,
  content jsonb not null,
  created_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  unique (report_id, version_number),
  foreign key (organization_id, report_id) references public.reports(organization_id, id) on delete cascade
);

create table public.report_approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  report_id uuid not null,
  reviewer_id uuid not null references public.profiles(user_id),
  approval_type public.approval_type not null,
  decision public.approval_decision not null,
  comments text,
  created_at timestamptz not null default now(),
  foreign key (organization_id, report_id) references public.reports(organization_id, id) on delete cascade
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid,
  inspection_id uuid,
  task_id uuid,
  report_id uuid,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  uploaded_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  check (num_nonnulls(project_id, inspection_id, task_id, report_id) = 1),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete cascade,
  foreign key (organization_id, inspection_id) references public.inspections(organization_id, id) on delete cascade,
  foreign key (organization_id, task_id) references public.tasks(organization_id, id) on delete cascade,
  foreign key (organization_id, report_id) references public.reports(organization_id, id) on delete cascade
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(user_id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  document_type text not null check (document_type in ('inspection_report', 'design', 'drafting')),
  schema jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index profiles_org_status_idx on public.profiles (organization_id, status, role);
create index clients_org_name_idx on public.clients (organization_id, name) where archived_at is null;
create index projects_org_status_idx on public.projects (organization_id, status, target_completion_date) where archived_at is null;
create index project_members_user_idx on public.project_members (user_id, project_id);
create index inspections_assignee_status_idx on public.inspections (assigned_inspector_id, status, scheduled_at);
create index observations_inspection_idx on public.inspection_observations (inspection_id, sort_order);
create index photos_inspection_idx on public.inspection_photos (inspection_id, created_at);
create index tasks_assignee_status_due_idx on public.tasks (assigned_to, status, due_at);
create index tasks_project_idx on public.tasks (project_id, created_at desc);
create index reports_writer_status_idx on public.reports (report_writer_id, status, updated_at desc);
create index report_approvals_report_idx on public.report_approvals (report_id, created_at desc);
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;
create index activity_logs_org_time_idx on public.activity_logs (organization_id, created_at desc);

create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'organizations', 'profiles', 'clients', 'projects', 'inspections',
    'inspection_observations', 'tasks', 'reports', 'document_templates'
  ] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end;
$$;

create function public.current_organization_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select p.organization_id
  from public.profiles p
  where p.user_id = (select auth.uid())
    and p.status = 'approved'
  limit 1;
$$;

create function public.is_organization_admin(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid())
      and p.organization_id = target_organization_id
      and p.status = 'approved'
      and p.role = 'admin'
  );
$$;

create function public.has_permission(target_organization_id uuid, requested_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_organization_admin(target_organization_id)
    or coalesce(
      (select override.granted
       from public.permission_overrides override
       where override.organization_id = target_organization_id
         and override.user_id = (select auth.uid())
         and override.permission_key = requested_permission),
      exists (
        select 1
        from public.profiles p
        join public.role_permissions rp on rp.role = p.role
        where p.user_id = (select auth.uid())
          and p.organization_id = target_organization_id
          and p.status = 'approved'
          and rp.permission_key = requested_permission
      ),
      false
    );
$$;

create function public.can_access_project(target_project_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects project
    where project.id = target_project_id
      and project.organization_id = (select public.current_organization_id())
      and (
        public.is_organization_admin(project.organization_id)
        or exists (
          select 1 from public.project_members member
          where member.project_id = project.id
            and member.user_id = (select auth.uid())
            and member.organization_id = project.organization_id
        )
      )
  );
$$;

create function public.can_access_inspection(target_inspection_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.inspections inspection
    where inspection.id = target_inspection_id
      and inspection.organization_id = (select public.current_organization_id())
      and (
        public.is_organization_admin(inspection.organization_id)
        or inspection.assigned_inspector_id = (select auth.uid())
        or public.can_access_project(inspection.project_id)
      )
  );
$$;

create function public.can_access_task(target_task_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tasks task
    where task.id = target_task_id
      and task.organization_id = (select public.current_organization_id())
      and (
        public.is_organization_admin(task.organization_id)
        or task.assigned_to = (select auth.uid())
        or task.assigned_by = (select auth.uid())
      )
  );
$$;

create function public.can_access_report(target_report_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.reports report
    where report.id = target_report_id
      and report.organization_id = (select public.current_organization_id())
      and (
        public.is_organization_admin(report.organization_id)
        or (
          report.report_writer_id = (select auth.uid())
          and public.can_access_task(report.task_id)
          and public.has_permission(report.organization_id, 'reports.edit_assigned')
        )
        or (
          public.can_access_task(report.task_id)
          and public.has_permission(report.organization_id, 'reports.read_assigned')
        )
        or (
          public.can_access_project(report.project_id)
          and (
            public.has_permission(report.organization_id, 'reports.qa')
            or public.has_permission(report.organization_id, 'reports.approve_final')
          )
        )
      )
  );
$$;

create function public.create_profile_for_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_organization_id uuid;
begin
  select organization.id into target_organization_id
  from public.organizations organization
  where organization.slug = 'rcc-portal'
  limit 1;

  if target_organization_id is null then
    raise exception 'RCC Portal organization is not initialized';
  end if;

  insert into public.profiles (
    user_id, organization_id, email, full_name, phone, job_title,
    professional_details, role, status
  ) values (
    new.id,
    target_organization_id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'New employee'),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'job_title'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'professional_details'), ''),
    null,
    'pending'
  );
  return new;
end;
$$;

create function public.audit_business_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare row_data jsonb;
        target_organization_id uuid;
        target_entity_id uuid;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  target_organization_id := nullif(row_data ->> 'organization_id', '')::uuid;
  target_entity_id := coalesce(
    nullif(row_data ->> 'id', '')::uuid,
    nullif(row_data ->> 'user_id', '')::uuid
  );
  if target_organization_id is not null then
    insert into public.activity_logs (
      organization_id, actor_id, action, entity_type, entity_id, metadata
    ) values (
      target_organization_id,
      (select auth.uid()),
      lower(tg_table_name) || '.' || lower(tg_op),
      tg_table_name,
      target_entity_id,
      '{}'::jsonb
    );
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_auth_user();

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles', 'clients', 'projects', 'inspections', 'inspection_observations',
    'inspection_photos', 'tasks', 'reports', 'report_versions', 'report_approvals',
    'attachments', 'notifications', 'document_templates'
  ] loop
    execute format(
      'create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.audit_business_change()',
      table_name, table_name
    );
  end loop;
end;
$$;

revoke all on function public.audit_business_change() from public, anon, authenticated;

create function public.review_employee_registration(
  target_user_id uuid,
  decision public.account_status,
  assigned_role public.employee_role default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare target_organization_id uuid := public.current_organization_id();
begin
  if target_organization_id is null or not public.is_organization_admin(target_organization_id) then
    raise exception 'Administrator permission required' using errcode = '42501';
  end if;
  if decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;
  if decision = 'approved' and (assigned_role is null or assigned_role = 'admin') then
    raise exception 'Assign a non-admin employee role during approval';
  end if;

  update public.profiles
  set status = decision,
      role = case when decision = 'approved' then assigned_role else null end
  where user_id = target_user_id
    and organization_id = target_organization_id
    and status = 'pending';

  if not found then
    raise exception 'Pending registration not found';
  end if;
end;
$$;

create function public.set_permission_override(
  target_user_id uuid,
  requested_permission text,
  should_grant boolean
)
returns void language plpgsql security definer set search_path = '' as $$
declare target_organization_id uuid := public.current_organization_id();
begin
  if target_organization_id is null or not public.is_organization_admin(target_organization_id) then
    raise exception 'Administrator permission required' using errcode = '42501';
  end if;
  if requested_permission not in (
    'reports.approve_final', 'employees.approve', 'employees.manage_permissions',
    'projects.manage', 'clients.manage', 'settings.manage'
  ) then
    raise exception 'Unknown or non-overridable permission';
  end if;
  if not exists (
    select 1 from public.profiles
    where user_id = target_user_id
      and organization_id = target_organization_id
      and status = 'approved'
  ) then
    raise exception 'Employee is not approved in this organization';
  end if;

  insert into public.permission_overrides (
    organization_id, user_id, permission_key, granted, granted_by
  ) values (
    target_organization_id, target_user_id, requested_permission, should_grant, auth.uid()
  ) on conflict (organization_id, user_id, permission_key)
  do update set granted = excluded.granted, granted_by = excluded.granted_by, created_at = now();
end;
$$;

create function public.respond_to_task(target_task_id uuid, response public.task_status, reason text default null)
returns public.task_status language plpgsql security definer set search_path = '' as $$
declare resulting_status public.task_status;
begin
  if response not in ('accepted', 'declined') then
    raise exception 'Response must be accepted or declined';
  end if;
  update public.tasks
  set status = response,
      response_note = nullif(trim(reason), ''),
      started_at = case when response = 'accepted' then coalesce(started_at, now()) else started_at end
  where id = target_task_id
    and assigned_to = auth.uid()
    and status = 'offered'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.organization_id = tasks.organization_id
        and p.status = 'approved'
        and public.has_permission(p.organization_id, 'tasks.respond')
    )
  returning status into resulting_status;
  if resulting_status is null then
    raise exception 'Task is not available to this employee';
  end if;
  return resulting_status;
end;
$$;

create function public.submit_inspection(target_inspection_id uuid, inspection_summary text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.inspections
  set status = 'submitted',
      summary = coalesce(inspection_summary, summary),
      submitted_at = now()
  where id = target_inspection_id
    and assigned_inspector_id = auth.uid()
    and status in ('scheduled', 'in_progress')
    and public.has_permission(organization_id, 'inspections.edit_assigned');
  if not found then
    raise exception 'Inspection is not available to this inspector';
  end if;
end;
$$;

create function public.save_report_draft(target_report_id uuid, report_title text, report_content jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare next_version integer;
begin
  update public.reports
  set title = report_title,
      content = report_content,
      status = case when status = 'revision_requested' then 'in_progress'::public.report_status else status end,
      current_version = current_version + 1
  where id = target_report_id
    and report_writer_id = auth.uid()
    and status in ('draft', 'in_progress', 'revision_requested')
    and public.has_permission(organization_id, 'reports.edit_assigned')
  returning current_version into next_version;
  if next_version is null then
    raise exception 'Report is not available to this report writer';
  end if;
  insert into public.report_versions (organization_id, report_id, version_number, title, content, created_by)
  select organization_id, id, next_version, title, content, auth.uid()
  from public.reports where id = target_report_id;
  return next_version;
end;
$$;

create function public.submit_report_for_qa(target_report_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.reports
  set status = 'submitted_for_qa', submitted_for_qa_at = now()
  where id = target_report_id
    and report_writer_id = auth.uid()
    and status in ('draft', 'in_progress')
    and public.has_permission(organization_id, 'reports.edit_assigned');
  if not found then
    raise exception 'Report is not available to submit';
  end if;
end;
$$;

create function public.review_report(
  target_report_id uuid,
  review_type public.approval_type,
  review_decision public.approval_decision,
  review_comments text default null
)
returns public.report_status language plpgsql security definer set search_path = '' as $$
declare current_report public.reports%rowtype;
        resulting_status public.report_status;
begin
  select * into current_report from public.reports where id = target_report_id for update;
  if not found then
    raise exception 'Report not found';
  end if;
  if current_report.report_writer_id = auth.uid() then
    raise exception 'Report authors cannot review their own reports' using errcode = '42501';
  end if;
  if review_type = 'technical_qa' then
    if review_decision = 'rejected' then
      raise exception 'Technical QA can approve or request changes, not issue final rejection';
    end if;
    if not public.has_permission(current_report.organization_id, 'reports.qa')
      or current_report.status <> 'submitted_for_qa' then
      raise exception 'Technical QA permission required for a submitted report' using errcode = '42501';
    end if;
    resulting_status := case review_decision
      when 'approved' then 'pending_final_approval'::public.report_status
      else 'revision_requested'::public.report_status
    end;
  else
    if not public.has_permission(current_report.organization_id, 'reports.approve_final')
      or current_report.status <> 'pending_final_approval' then
      raise exception 'Final approval permission required' using errcode = '42501';
    end if;
    resulting_status := case review_decision
      when 'approved' then 'approved'::public.report_status
      when 'rejected' then 'rejected'::public.report_status
      else 'revision_requested'::public.report_status
    end;
  end if;

  if not public.can_access_project(current_report.project_id) then
    raise exception 'Reviewer is not assigned to this project' using errcode = '42501';
  end if;

  insert into public.report_approvals (
    organization_id, report_id, reviewer_id, approval_type, decision, comments
  ) values (
    current_report.organization_id, current_report.id, auth.uid(), review_type, review_decision, review_comments
  );

  update public.reports
  set status = resulting_status,
      approved_at = case when resulting_status = 'approved' then now() else null end
  where id = target_report_id;
  return resulting_status;
end;
$$;

create function public.can_access_storage_object(object_name text, expected_kind text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare organization_part text := split_part(object_name, '/', 1);
        record_part text := split_part(object_name, '/', 2);
begin
  if organization_part !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    or record_part !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  if expected_kind = 'inspection' then
    return exists (
      select 1 from public.inspections inspection
      where inspection.organization_id = organization_part::uuid
        and inspection.id = record_part::uuid
        and public.can_access_inspection(inspection.id)
    );
  elsif expected_kind = 'report' then
    return exists (
      select 1 from public.reports report
      where report.organization_id = organization_part::uuid
        and report.id = record_part::uuid
        and public.can_access_report(report.id)
    );
  elsif expected_kind = 'task' then
    return exists (
      select 1 from public.tasks task
      where task.organization_id = organization_part::uuid
        and task.id = record_part::uuid
        and public.can_access_task(task.id)
    );
  end if;
  return false;
end;
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.permission_overrides enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.inspections enable row level security;
alter table public.inspection_observations enable row level security;
alter table public.inspection_photos enable row level security;
alter table public.tasks enable row level security;
alter table public.reports enable row level security;
alter table public.report_versions enable row level security;
alter table public.report_approvals enable row level security;
alter table public.attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;
alter table public.document_templates enable row level security;

grant select on public.organizations, public.profiles, public.role_permissions,
  public.permission_overrides, public.clients, public.projects, public.project_members,
  public.inspections, public.inspection_observations, public.inspection_photos,
  public.tasks, public.reports, public.report_versions, public.report_approvals,
  public.attachments, public.notifications, public.activity_logs, public.document_templates
to authenticated;

grant insert, update, delete on public.clients, public.projects, public.project_members,
  public.inspections, public.inspection_observations, public.inspection_photos,
  public.tasks, public.reports, public.report_versions, public.attachments,
  public.notifications, public.document_templates to authenticated;
revoke update, delete, insert on public.organizations, public.profiles,
  public.role_permissions, public.permission_overrides, public.report_approvals,
  public.activity_logs from authenticated;
revoke update on public.inspections, public.tasks, public.reports from authenticated;
grant update (started_at, inspected_at, environmental_conditions, summary)
  on public.inspections to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy organizations_read_member on public.organizations for select to authenticated
  using (id = (select public.current_organization_id()));
create policy profiles_read_self_or_admin on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_organization_admin(organization_id)));
create policy roles_read_authenticated on public.role_permissions for select to authenticated
  using (true);
create policy permission_overrides_read_self_or_admin on public.permission_overrides for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_organization_admin(organization_id)));

create policy clients_read_authorized on public.clients for select to authenticated
  using (
    (select public.is_organization_admin(organization_id))
    or exists (
      select 1 from public.projects project
      where project.client_id = clients.id and (select public.can_access_project(project.id))
    )
  );
create policy clients_admin_manage on public.clients for all to authenticated
  using ((select public.is_organization_admin(organization_id)))
  with check ((select public.is_organization_admin(organization_id)));

create policy projects_read_assigned on public.projects for select to authenticated
  using ((select public.can_access_project(id)));
create policy projects_admin_manage on public.projects for all to authenticated
  using ((select public.is_organization_admin(organization_id)))
  with check ((select public.is_organization_admin(organization_id)));

create policy project_members_read on public.project_members for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_organization_admin(organization_id)));
create policy project_members_admin_manage on public.project_members for all to authenticated
  using ((select public.is_organization_admin(organization_id)))
  with check ((select public.is_organization_admin(organization_id)));

create policy inspections_read_assigned on public.inspections for select to authenticated
  using ((select public.can_access_inspection(id)));
create policy inspections_admin_manage on public.inspections for all to authenticated
  using ((select public.is_organization_admin(organization_id)))
  with check ((select public.is_organization_admin(organization_id)));
create policy inspections_assignee_update on public.inspections for update to authenticated
  using (
    assigned_inspector_id = (select auth.uid())
    and status in ('scheduled', 'in_progress')
    and (select public.has_permission(organization_id, 'inspections.edit_assigned'))
  )
  with check (
    assigned_inspector_id = (select auth.uid())
    and status in ('scheduled', 'in_progress', 'submitted')
    and (select public.has_permission(organization_id, 'inspections.edit_assigned'))
  );

create policy observations_read_inspection on public.inspection_observations for select to authenticated
  using ((select public.can_access_inspection(inspection_id)));
create policy observations_assignee_write on public.inspection_observations for all to authenticated
  using (
    (select public.can_access_inspection(inspection_id))
    and (select public.has_permission(organization_id, 'inspections.edit_assigned'))
  )
  with check (
    (select public.can_access_inspection(inspection_id))
    and (select public.has_permission(organization_id, 'inspections.edit_assigned'))
  );

create policy photos_read_inspection on public.inspection_photos for select to authenticated
  using ((select public.can_access_inspection(inspection_id)));
create policy photos_assignee_write on public.inspection_photos for all to authenticated
  using (
    uploaded_by = (select auth.uid())
    and (select public.can_access_inspection(inspection_id))
    and (select public.has_permission(organization_id, 'inspections.edit_assigned'))
  )
  with check (
    uploaded_by = (select auth.uid())
    and (select public.can_access_inspection(inspection_id))
    and (select public.has_permission(organization_id, 'inspections.edit_assigned'))
  );

create policy tasks_read_assigned on public.tasks for select to authenticated
  using ((select public.can_access_task(id)));
create policy tasks_admin_manage on public.tasks for all to authenticated
  using ((select public.is_organization_admin(organization_id)))
  with check ((select public.is_organization_admin(organization_id)));

create policy reports_read_authorized on public.reports for select to authenticated
  using ((select public.can_access_report(id)));
create policy reports_admin_manage on public.reports for all to authenticated
  using ((select public.is_organization_admin(organization_id)))
  with check ((select public.is_organization_admin(organization_id)));
create policy reports_writer_update on public.reports for update to authenticated
  using (
    report_writer_id = (select auth.uid())
    and status in ('draft', 'in_progress', 'revision_requested')
    and (select public.has_permission(organization_id, 'reports.edit_assigned'))
  )
  with check (
    report_writer_id = (select auth.uid())
    and status in ('draft', 'in_progress', 'revision_requested')
    and (select public.has_permission(organization_id, 'reports.edit_assigned'))
  );

create policy report_versions_read_report on public.report_versions for select to authenticated
  using ((select public.can_access_report(report_id)));
create policy report_versions_append_writer on public.report_versions for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (select public.has_permission(organization_id, 'reports.edit_assigned'))
    and (select public.can_access_report(report_id))
  );

create policy approvals_read_reviewer on public.report_approvals for select to authenticated
  using (
    reviewer_id = (select auth.uid())
    or (select public.is_organization_admin(organization_id))
    or exists (
      select 1
      from public.reports report
      where report.id = report_id
        and public.can_access_project(report.project_id)
        and (
          public.has_permission(organization_id, 'reports.qa')
          or public.has_permission(organization_id, 'reports.approve_final')
        )
    )
  );

create policy attachments_read_authorized on public.attachments for select to authenticated
  using (
    (project_id is not null and (select public.can_access_project(project_id)))
    or (inspection_id is not null and (select public.can_access_inspection(inspection_id)))
    or (task_id is not null and (select public.can_access_task(task_id)))
    or (report_id is not null and (select public.can_access_report(report_id)))
  );
create policy attachments_owner_insert on public.attachments for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and (
      (project_id is not null and (select public.can_access_project(project_id)))
      or (inspection_id is not null and (select public.can_access_inspection(inspection_id)))
      or (task_id is not null and (select public.can_access_task(task_id)))
      or (report_id is not null and (select public.can_access_report(report_id)))
    )
  );

create policy notifications_read_own on public.notifications for select to authenticated
  using (user_id = (select auth.uid()) and organization_id = (select public.current_organization_id()));
create policy notifications_mark_own on public.notifications for update to authenticated
  using (user_id = (select auth.uid()) and organization_id = (select public.current_organization_id()))
  with check (user_id = (select auth.uid()) and organization_id = (select public.current_organization_id()));

create policy activity_logs_admin_read on public.activity_logs for select to authenticated
  using ((select public.is_organization_admin(organization_id)));

create policy document_templates_read_member on public.document_templates for select to authenticated
  using (organization_id = (select public.current_organization_id()));
create policy document_templates_admin_manage on public.document_templates for all to authenticated
  using ((select public.is_organization_admin(organization_id)))
  with check ((select public.is_organization_admin(organization_id)));

grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.is_organization_admin(uuid) to authenticated;
grant execute on function public.has_permission(uuid, text) to authenticated;
grant execute on function public.can_access_project(uuid) to authenticated;
grant execute on function public.can_access_inspection(uuid) to authenticated;
grant execute on function public.can_access_task(uuid) to authenticated;
grant execute on function public.can_access_report(uuid) to authenticated;
grant execute on function public.review_employee_registration(uuid, public.account_status, public.employee_role) to authenticated;
grant execute on function public.set_permission_override(uuid, text, boolean) to authenticated;
grant execute on function public.respond_to_task(uuid, public.task_status, text) to authenticated;
grant execute on function public.submit_inspection(uuid, text) to authenticated;
grant execute on function public.save_report_draft(uuid, text, jsonb) to authenticated;
grant execute on function public.submit_report_for_qa(uuid) to authenticated;
grant execute on function public.review_report(uuid, public.approval_type, public.approval_decision, text) to authenticated;

-- Private Storage buckets. Object names must be organization-id/record-id/file-name.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('inspection-evidence', 'inspection-evidence', false, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('report-documents', 'report-documents', false, 104857600, array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']),
  ('project-deliverables', 'project-deliverables', false, 104857600, array['application/pdf', 'image/jpeg', 'image/png', 'application/acad', 'application/dwg', 'application/octet-stream'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy inspection_evidence_select on storage.objects for select to authenticated
  using (bucket_id = 'inspection-evidence' and (select public.can_access_storage_object(name, 'inspection')));
create policy inspection_evidence_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'inspection-evidence'
    and (storage.foldername(name))[1] = (select public.current_organization_id())::text
    and (select public.can_access_storage_object(name, 'inspection'))
    and (select public.has_permission((select public.current_organization_id()), 'inspections.edit_assigned'))
  );
create policy report_documents_select on storage.objects for select to authenticated
  using (bucket_id = 'report-documents' and (select public.can_access_storage_object(name, 'report')));
create policy report_documents_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'report-documents'
    and (storage.foldername(name))[1] = (select public.current_organization_id())::text
    and (select public.can_access_storage_object(name, 'report'))
    and (select public.has_permission((select public.current_organization_id()), 'reports.edit_assigned'))
  );
create policy project_deliverables_select on storage.objects for select to authenticated
  using (bucket_id = 'project-deliverables' and (select public.can_access_storage_object(name, 'task')));
create policy project_deliverables_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-deliverables'
    and (storage.foldername(name))[1] = (select public.current_organization_id())::text
    and (select public.can_access_storage_object(name, 'task'))
  );

-- All app users are read-only for generated audit history; trusted workflow
-- functions and database triggers can append rows as they are added.
