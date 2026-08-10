import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGIN = 'https://omendezsubarnaba89-alt.github.io';
const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});
const json=(body:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders(origin),'Content-Type':'application/json; charset=utf-8'}});

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get('origin');
  if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders(origin)});
  if(req.method!=='POST')return json({error:'method_not_allowed'},405,origin);
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
  if(!token)return json({error:'missing_token'},401,origin);
  const supabaseUrl=Deno.env.get('SUPABASE_URL')!;const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token);const caller=userData?.user;
  if(userError||!caller)return json({error:'invalid_session'},401,origin);
  const {data:callerRole,error:roleError}=await admin.from('user_roles').select('role,active').eq('user_id',caller.id).maybeSingle();
  if(roleError)return json({error:'role_lookup_failed'},500,origin);
  if(!callerRole?.active||!['admin','super_admin'].includes(callerRole.role))return json({error:'forbidden'},403,origin);
  let body:any={};try{body=await req.json();}catch{return json({error:'invalid_json'},400,origin)}const action=String(body?.action||'');

  if(action==='list_users'){
    const page=Math.max(1,Math.min(1000,Number(body?.page||1)));const perPage=Math.max(1,Math.min(100,Number(body?.per_page||50)));
    const {data:usersPage,error:usersError}=await admin.auth.admin.listUsers({page,perPage});if(usersError)return json({error:'list_users_failed'},500,origin);
    const users=usersPage.users||[];const ids=users.map((u:any)=>u.id);if(!ids.length)return json({users:[],page,per_page:perPage},200,origin);
    const [{data:profiles},{data:roles},{data:learning},{data:officialLessons},{data:officialExams},{data:certificates}]=await Promise.all([
      admin.from('profiles').select('user_id,display_name,created_at').in('user_id',ids),
      admin.from('user_roles').select('user_id,role,active').in('user_id',ids),
      admin.from('user_learning_state').select('user_id,payload,updated_at').in('user_id',ids),
      admin.from('lesson_validations').select('user_id,lesson_key,passed').in('user_id',ids).eq('passed',true),
      admin.from('exam_validations').select('user_id,level,passed').in('user_id',ids).eq('passed',true),
      admin.from('certificates').select('user_id,certificate_code,status').in('user_id',ids)
    ]);
    const profileMap=new Map((profiles||[]).map((x:any)=>[x.user_id,x]));const roleMap=new Map((roles||[]).map((x:any)=>[x.user_id,x]));const learningMap=new Map((learning||[]).map((x:any)=>[x.user_id,x]));const certMap=new Map((certificates||[]).map((x:any)=>[x.user_id,x]));
    const officialLessonCounts=new Map<string,number>();for(const row of officialLessons||[])officialLessonCounts.set(row.user_id,(officialLessonCounts.get(row.user_id)||0)+1);
    const officialExamCounts=new Map<string,number>();for(const row of officialExams||[])officialExamCounts.set(row.user_id,(officialExamCounts.get(row.user_id)||0)+1);
    const countTrue=(obj:any,field:string)=>Object.values(obj||{}).filter((v:any)=>Boolean(v?.[field])).length;
    const result=users.map((u:any)=>{const p:any=profileMap.get(u.id)||{};const r:any=roleMap.get(u.id)||{role:'student',active:true};const l:any=learningMap.get(u.id)||{};const cert:any=certMap.get(u.id)||null;return{
      user_id:u.id,email:u.email||'',display_name:p.display_name||'',role:r.role||'student',active:r.active!==false,created_at:u.created_at,last_sign_in_at:u.last_sign_in_at||null,email_confirmed_at:u.email_confirmed_at||null,learning_updated_at:l.updated_at||null,
      lesson_count:countTrue(l.payload?.course,'completed'),exam_count:countTrue(l.payload?.exams,'passed'),official_lesson_count:officialLessonCounts.get(u.id)||0,official_exam_count:officialExamCounts.get(u.id)||0,certificate_status:cert?.status||null,certificate_code:cert?.certificate_code||null
    };});
    return json({users:result,page,per_page:perPage},200,origin);
  }

  if(action==='get_user_detail'){
    const targetUserId=String(body?.user_id||'');if(!targetUserId)return json({error:'user_id_required'},400,origin);
    const {data:{user:target},error:userError2}=await admin.auth.admin.getUserById(targetUserId);if(userError2||!target)return json({error:'user_not_found'},404,origin);
    const [{data:profile},{data:roleRow},{data:learning},{data:officialLessons},{data:officialExams},{data:certificate}]=await Promise.all([
      admin.from('profiles').select('display_name,created_at').eq('user_id',targetUserId).maybeSingle(),
      admin.from('user_roles').select('role,active,created_at,updated_at').eq('user_id',targetUserId).maybeSingle(),
      admin.from('user_learning_state').select('payload,updated_at').eq('user_id',targetUserId).maybeSingle(),
      admin.from('lesson_validations').select('lesson_key,attempts,best_score,total,passed,passed_at,last_attempt_at').eq('user_id',targetUserId).order('lesson_key'),
      admin.from('exam_validations').select('level,attempts,best_score,best_pct,passed,passed_at,last_attempt_at').eq('user_id',targetUserId).order('level'),
      admin.from('certificates').select('certificate_code,participant_name,average,completion_date,status,issued_at,revoked_at,revocation_reason').eq('user_id',targetUserId).maybeSingle()
    ]);
    return json({user:{user_id:target.id,email:target.email||'',email_confirmed_at:target.email_confirmed_at||null,created_at:target.created_at,last_sign_in_at:target.last_sign_in_at||null,display_name:profile?.display_name||'',role:roleRow?.role||'student',active:roleRow?.active!==false,role_updated_at:roleRow?.updated_at||null,learning_updated_at:learning?.updated_at||null,learning_payload:learning?.payload||{},official_lessons:officialLessons||[],official_exams:officialExams||[],certificate:certificate||null}},200,origin);
  }

  if(action==='set_role'){
    if(callerRole.role!=='super_admin')return json({error:'super_admin_required'},403,origin);
    const targetUserId=String(body?.user_id||'');const requestedRole=String(body?.role||'');const requestedActive=body?.active!==false;
    if(!targetUserId||!['student','admin','super_admin'].includes(requestedRole))return json({error:'invalid_role_change'},400,origin);
    if(targetUserId===caller.id&&(requestedRole!=='super_admin'||!requestedActive))return json({error:'cannot_demote_self'},400,origin);
    const {data:before}=await admin.from('user_roles').select('role,active').eq('user_id',targetUserId).maybeSingle();
    const {error}=await admin.from('user_roles').upsert({user_id:targetUserId,role:requestedRole,active:requestedActive,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)return json({error:'role_update_failed'},500,origin);
    await admin.from('admin_audit_log').insert({actor_user_id:caller.id,target_user_id:targetUserId,action:'set_role',before_state:before||{},after_state:{role:requestedRole,active:requestedActive}});
    return json({ok:true,user_id:targetUserId,role:requestedRole,active:requestedActive},200,origin);
  }

  if(action==='list_audit'){
    if(callerRole.role!=='super_admin')return json({error:'super_admin_required'},403,origin);
    const {data,error}=await admin.from('admin_audit_log').select('id,actor_user_id,target_user_id,action,before_state,after_state,created_at').order('created_at',{ascending:false}).limit(200);if(error)return json({error:'audit_list_failed'},500,origin);
    return json({events:data||[]},200,origin);
  }
  return json({error:'unknown_action'},400,origin);
});
