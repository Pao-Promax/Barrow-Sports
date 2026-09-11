-- Run after the migration. All fixtures and stock changes roll back.
begin;
do $$
declare e uuid; b uuid; reviewer uuid; student uuid:=gen_random_uuid(); qty integer; blocked boolean;
begin
 select id into reviewer from auth.users where raw_app_meta_data->>'role'='admin' limit 1;
 if reviewer is null then raise exception 'Requires one real admin'; end if;
 insert into equipment(name,category,total_quantity,available_quantity,damaged_quantity) values('transaction-test','other',5,5,0) returning id into e;
 b:=create_equipment_borrow(e,student,'return-test@cru.ac.th','test',2,2,now()+interval '2 hours');
 assert (select available_quantity from equipment where id=e)=3,'borrow must subtract stock';
 blocked:=false;
 begin perform submit_equipment_return(b,gen_random_uuid(),'other@cru.ac.th','test-proof','',0); exception when others then blocked:=true; end;
 assert blocked,'other user cannot submit';
 perform submit_equipment_return(b,student,'return-test@cru.ac.th','test-proof','',1);
 assert (select available_quantity from equipment where id=e)=3,'pending must not restore stock';
 blocked:=false;
 begin perform review_equipment_return(b,student,true,0,''); exception when others then blocked:=true; end;
 assert blocked,'student cannot review';
 perform review_equipment_return(b,reviewer,false,0,'missing equipment');
 assert (select status from borrow_requests where id=b)='active','rejection reopens loan';
 assert (select available_quantity from equipment where id=e)=3,'rejection leaves stock unchanged';
 perform submit_equipment_return(b,student,'return-test@cru.ac.th','test-proof','',1);
 blocked:=false;
 begin perform review_equipment_return(b,reviewer,true,3,''); exception when others then blocked:=true; end;
 assert blocked,'invalid damage rejected';
 perform review_equipment_return(b,reviewer,true,1,'checked in person');
 assert (select available_quantity from equipment where id=e)=4,'only usable stock restored';
 assert (select damaged_quantity from equipment where id=e)=1,'damaged stock separated';
 assert (select verified_by from borrow_requests where id=b)=reviewer,'reviewer recorded';
 blocked:=false;
 begin perform review_equipment_return(b,reviewer,true,0,''); exception when others then blocked:=true; end;
 assert blocked,'duplicate receipt blocked';
 assert (select available_quantity from equipment where id=e)=4,'duplicate leaves stock unchanged';
 assert not has_function_privilege('authenticated','public.review_equipment_return(uuid,uuid,boolean,integer,text)','execute'),'RPC not public';
 assert not has_table_privilege('authenticated','public.borrow_requests','update'),'direct bypass denied';
 assert not has_table_privilege('anon','public.equipment','update'),'stock bypass denied';
end $$;
rollback;
