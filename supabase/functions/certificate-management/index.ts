import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGIN='https://omendezsubarnaba89-alt.github.io';
const cors=(origin:string|null)=>({
  'Access-Control-Allow-Origin':origin===ALLOWED_ORIGIN?origin:ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json; charset=utf-8','Vary':'Origin'
});
const reply=(body:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(body),{status,headers:cors(origin)});
const normalizeName=(value:unknown)=>String(value||'').replace(/\s+/g,' ').trim().slice(0,80);
const newCode=()=>`MIRMC-GE-${crypto.randomUUID().replace(/-/g,'').slice(0,16).toUpperCase()}`;

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get('origin');
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors(origin)});
  if(req.method!=='POST')return reply({error:'method_not_allowed'},405,origin);
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
  if(!token)return reply({error:'missing_token'},401,origin);

  const url=Deno.env.get('SUPABASE_URL')!;
  const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token);
  const caller=userData?.user;
  if(userError||!caller)return reply({error:'invalid_session'},401,origin);

  let body:any={};try{body=await req.json();}catch{return reply({error:'invalid_json'},400,origin)}
  const action=String(body?.action||'');
  const {data:role}=await admin.from('user_roles').select('role,active').eq('user_id',caller.id).maybeSingle();
  const isStaff=Boolean(role?.active&&['admin','super_admin'].includes(role.role));
  const isSuper=Boolean(role?.active&&role.role==='super_admin');
  const publicFields='id,certificate_code,user_id,participant_name,average,lessons_completed,exams_passed,completion_date,status,issued_at,revoked_at,revocation_reason,updated_at';

  if(action==='mine'){
    const {data,error}=await admin.from('certificates').select(publicFields).eq('user_id',caller.id).maybeSingle();
    if(error)return reply({error:'certificate_lookup_failed'},500,origin);
    return reply({certificate:data||null},200,origin);
  }

  if(action==='eligibility'){
    const [{data:lessons},{data:exams}]=await Promise.all([
      admin.from('lesson_validations').select('lesson_key,passed,passed_at').eq('user_id',caller.id).eq('passed',true),
      admin.from('exam_validations').select('level,best_pct,passed,passed_at').eq('user_id',caller.id).eq('passed',true)
    ]);
    const lessonKeys=new Set((lessons||[]).map((x:any)=>x.lesson_key));
    const examLevels=new Set((exams||[]).map((x:any)=>Number(x.level)));
    const eligible=lessonKeys.size===15&&[1,2,3].every(x=>examLevels.has(x));
    return reply({eligible,lesson_count:lessonKeys.size,exam_count:examLevels.size,missing_lessons:Array.from({length:15},(_,i)=>String(i+1).padStart(2,'0')).filter(x=>!lessonKeys.has(x)),missing_exams:[1,2,3].filter(x=>!examLevels.has(x))},200,origin);
  }

  if(action==='issue'){
    const {data:existing,error:existingError}=await admin.from('certificates').select(publicFields).eq('user_id',caller.id).maybeSingle();
    if(existingError)return reply({error:'certificate_lookup_failed'},500,origin);
    if(existing)return reply({certificate:existing,existing:true},200,origin);

    const [{data:lessons,error:lessonError},{data:exams,error:examError},{data:profile}]=await Promise.all([
      admin.from('lesson_validations').select('lesson_key,best_score,passed,passed_at').eq('user_id',caller.id).eq('passed',true).order('lesson_key'),
      admin.from('exam_validations').select('level,best_score,best_pct,passed,passed_at').eq('user_id',caller.id).eq('passed',true).order('level'),
      admin.from('profiles').select('display_name').eq('user_id',caller.id).maybeSingle()
    ]);
    if(lessonError||examError)return reply({error:'academic_lookup_failed'},500,origin);
    const lessonKeys=new Set((lessons||[]).map((x:any)=>x.lesson_key));
    const examLevels=new Set((exams||[]).map((x:any)=>Number(x.level)));
    if(lessonKeys.size!==15||![1,2,3].every(x=>examLevels.has(x)))return reply({error:'not_eligible',lesson_count:lessonKeys.size,exam_count:examLevels.size},409,origin);

    const name=normalizeName(body?.participant_name)||normalizeName(profile?.display_name);
    if(name.length<2)return reply({error:'name_required'},400,origin);
    const pcts=(exams||[]).map((x:any)=>Number(x.best_pct||0));
    const average=Math.round(pcts.reduce((a:number,b:number)=>a+b,0)/Math.max(pcts.length,1));
    const dates=[...(lessons||[]).map((x:any)=>x.passed_at),...(exams||[]).map((x:any)=>x.passed_at)].filter(Boolean).map((x:any)=>new Date(x).getTime()).filter(Number.isFinite);
    const completionDate=new Date(Math.max(...dates)).toISOString().slice(0,10);
    const snapshot={lessons:(lessons||[]).map((x:any)=>({lesson_key:x.lesson_key,best_score:x.best_score,passed_at:x.passed_at})),exams:(exams||[]).map((x:any)=>({level:x.level,best_score:x.best_score,best_pct:x.best_pct,passed_at:x.passed_at}))};

    let certificate:any=null;let insertError:any=null;
    for(let i=0;i<4&&!certificate;i++){
      const code=newCode();
      const result=await admin.from('certificates').insert({certificate_code:code,user_id:caller.id,participant_name:name,average,lessons_completed:15,exams_passed:3,completion_date:completionDate,status:'active',academic_snapshot:snapshot}).select(publicFields).single();
      certificate=result.data;insertError=result.error;
      if(insertError?.code!=='23505')break;
    }
    if(insertError||!certificate)return reply({error:'certificate_issue_failed'},500,origin);
    await admin.from('certificate_audit_log').insert({certificate_id:certificate.id,actor_user_id:caller.id,action:'issue',details:{average,completion_date:completionDate}});
    return reply({certificate,existing:false},200,origin);
  }

  if(action==='admin_list'){
    if(!isStaff)return reply({error:'forbidden'},403,origin);
    const {data,error}=await admin.from('certificates').select(publicFields).order('issued_at',{ascending:false}).limit(500);
    if(error)return reply({error:'certificate_list_failed'},500,origin);
    return reply({certificates:data||[]},200,origin);
  }

  if(action==='revoke'||action==='reinstate'){
    if(!isSuper)return reply({error:'super_admin_required'},403,origin);
    const id=String(body?.certificate_id||'');if(!id)return reply({error:'certificate_id_required'},400,origin);
    const {data:old,error:oldError}=await admin.from('certificates').select(publicFields).eq('id',id).maybeSingle();
    if(oldError||!old)return reply({error:'certificate_not_found'},404,origin);
    const now=new Date().toISOString();
    const patch=action==='revoke'?{status:'revoked',revoked_at:now,revoked_by:caller.id,revocation_reason:normalizeName(body?.reason).slice(0,200)||'Revocado por administración',updated_at:now}:{status:'active',revoked_at:null,revoked_by:null,revocation_reason:null,updated_at:now};
    const {data,error}=await admin.from('certificates').update(patch).eq('id',id).select(publicFields).single();
    if(error)return reply({error:'certificate_update_failed'},500,origin);
    await admin.from('certificate_audit_log').insert({certificate_id:id,actor_user_id:caller.id,action,details:{previous_status:old.status,reason:action==='revoke'?patch.revocation_reason:null}});
    return reply({certificate:data},200,origin);
  }

  return reply({error:'unknown_action'},400,origin);
});
