-- Server-only transactions: never restore stock on a student's photo submission.
alter table public.borrow_requests add column if not exists return_submitted_at timestamptz;
alter table public.borrow_requests add column if not exists reported_damaged integer not null default 0;
alter table public.borrow_requests add column if not exists verified_damaged integer;
alter table public.borrow_requests add column if not exists review_note text;
alter table public.borrow_requests add column if not exists reviewed_at timestamptz;

create or replace function public.submit_equipment_return(p_id uuid, p_user uuid, p_email text, p_proof text, p_note text, p_damaged integer)
returns void language plpgsql security definer set search_path = public as $$
declare b borrow_requests;
begin
 select * into b from borrow_requests where id=p_id for update;
 if not found or not coalesce((b.user_id=p_user or (b.user_id is null and lower(b.user_email)=lower(p_email))),false)
    or b.status not in ('active','overdue') or p_damaged is null or p_damaged<0 or p_damaged>b.quantity or coalesce(p_proof,'')='' then
   raise exception 'Invalid return';
 end if;
 update borrow_requests set status='pending_verification', return_submitted_at=now(), return_proof_url=p_proof,
   return_note=p_note, reported_damaged=p_damaged where id=p_id;
end $$;

create or replace function public.review_equipment_return(p_id uuid, p_reviewer uuid, p_accept boolean, p_damaged integer, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare b borrow_requests;
begin
 if not exists(select 1 from auth.users where id=p_reviewer and raw_app_meta_data->>'role'='admin') then raise exception 'Admin required'; end if;
 select * into b from borrow_requests where id=p_id for update;
 if not found or b.status<>'pending_verification' or p_accept is null or p_damaged is null or p_damaged<0 or p_damaged>b.quantity then raise exception 'Invalid review'; end if;
 if p_accept then
   update equipment set available_quantity=available_quantity+b.quantity-p_damaged,
     damaged_quantity=damaged_quantity+p_damaged,
     status=case when status='maintenance' then status when available_quantity+b.quantity-p_damaged>0 then 'available' else 'out_of_stock' end,
     updated_at=now() where id=b.equipment_id;
   if not found then raise exception 'Equipment missing'; end if;
 else
   if coalesce(trim(p_note),'')='' then raise exception 'Reason required'; end if;
 end if;
 update borrow_requests set status=case when p_accept then 'returned' else 'active' end,
   returned_at=case when p_accept then now() else null end, verified_by=p_reviewer,
   reviewed_at=now(), review_note=p_note, verified_damaged=case when p_accept then p_damaged else null end where id=p_id;
end $$;

-- Borrowing shares the same equipment row lock as receipt, so concurrent actions cannot overwrite stock.
create or replace function public.create_equipment_borrow(p_equipment uuid, p_user uuid, p_email text, p_name text, p_quantity integer, p_hours numeric, p_due timestamptz)
returns uuid language plpgsql security definer set search_path = public as $$
declare e equipment; result uuid;
begin
 select * into e from equipment where id=p_equipment for update;
 if not found or p_quantity is null or p_quantity<1 or e.available_quantity<p_quantity or e.status='maintenance' then raise exception 'Insufficient stock'; end if;
 insert into borrow_requests(user_id,user_email,user_name,equipment_id,equipment_name,quantity,duration_hours,due_at,status)
 values(p_user,p_email,p_name,e.id,e.name,p_quantity,p_hours,p_due,'active') returning id into result;
 update equipment set available_quantity=available_quantity-p_quantity, status=case when available_quantity-p_quantity=0 then 'out_of_stock' else 'available' end where id=e.id;
 return result;
end $$;

revoke all on function public.submit_equipment_return(uuid,uuid,text,text,text,integer) from public,anon,authenticated;
revoke all on function public.review_equipment_return(uuid,uuid,boolean,integer,text) from public,anon,authenticated;
revoke all on function public.create_equipment_borrow(uuid,uuid,text,text,integer,numeric,timestamptz) from public,anon,authenticated;
grant execute on function public.submit_equipment_return(uuid,uuid,text,text,text,integer) to service_role;
grant execute on function public.review_equipment_return(uuid,uuid,boolean,integer,text) to service_role;
grant execute on function public.create_equipment_borrow(uuid,uuid,text,text,integer,numeric,timestamptz) to service_role;
-- Prevent bypassing the review API through the public database client.
revoke insert,update,delete on public.borrow_requests from anon,authenticated;
revoke insert,update,delete on public.equipment from anon,authenticated;
revoke select on public.borrow_requests from anon,authenticated;
