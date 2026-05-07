-- PostgreSQL schema for Sales Prospecting SaaS MVP

create extension if not exists pgcrypto;

create type prospect_status as enum (
  'NEW',
  'CONTACTED',
  'FOLLOW_UP',
  'MEETING_BOOKED',
  'QUALIFIED',
  'LOST',
  'WON'
);

create type activity_type as enum (
  'CALL',
  'EMAIL',
  'LINKEDIN',
  'MEETING',
  'NOTE'
);

create type task_state as enum (
  'TODO',
  'DONE',
  'CANCELED'
);

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'sales_rep',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  website text,
  industry text,
  company_size text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  job_title text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  owner_user_id uuid not null references users(id) on delete restrict,
  status prospect_status not null default 'NEW',
  source text,
  priority smallint not null default 3 check (priority between 1 and 5),
  value_estimate numeric(12,2),
  next_action_at timestamptz,
  last_contacted_at timestamptz,
  first_meeting_at timestamptz,
  lost_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  prospect_id uuid not null references prospects(id) on delete cascade,
  user_id uuid not null references users(id) on delete restrict,
  type activity_type not null,
  subject text,
  body text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  prospect_id uuid not null references prospects(id) on delete cascade,
  owner_user_id uuid not null references users(id) on delete restrict,
  title text not null,
  details text,
  due_at timestamptz not null,
  state task_state not null default 'TODO',
  automated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  done_at timestamptz
);

create index if not exists idx_users_tenant on users (tenant_id);
create index if not exists idx_companies_tenant on companies (tenant_id);
create index if not exists idx_contacts_tenant_company on contacts (tenant_id, company_id);
create index if not exists idx_prospects_tenant_status on prospects (tenant_id, status);
create index if not exists idx_prospects_owner_next_action on prospects (tenant_id, owner_user_id, next_action_at);
create index if not exists idx_tasks_owner_due_state on tasks (tenant_id, owner_user_id, due_at, state);
create index if not exists idx_activities_prospect_occurred on activities (prospect_id, occurred_at desc);

-- Trigger helper for updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tenants_updated_at on tenants;
create trigger trg_tenants_updated_at
before update on tenants
for each row execute procedure set_updated_at();

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row execute procedure set_updated_at();

drop trigger if exists trg_companies_updated_at on companies;
create trigger trg_companies_updated_at
before update on companies
for each row execute procedure set_updated_at();

drop trigger if exists trg_contacts_updated_at on contacts;
create trigger trg_contacts_updated_at
before update on contacts
for each row execute procedure set_updated_at();

drop trigger if exists trg_prospects_updated_at on prospects;
create trigger trg_prospects_updated_at
before update on prospects
for each row execute procedure set_updated_at();

drop trigger if exists trg_tasks_updated_at on tasks;
create trigger trg_tasks_updated_at
before update on tasks
for each row execute procedure set_updated_at();
