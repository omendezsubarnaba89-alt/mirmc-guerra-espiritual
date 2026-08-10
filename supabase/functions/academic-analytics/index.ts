import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGIN='https://omendezsubarnaba89-alt.github.io';
const cors=(origin:string|null)=>({
  'Access-Control-Allow-Origin':origin===ALLOWED_ORIGIN?origin:ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json; charset=utf-8','Vary':'Origin'
});
const reply=(body:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(body),{status,headers:cors(origin)});
const DAYS=14;
const LESSONS=Array.from({length:15},(_,i)=>String(i+1).padStart(2,'0'));

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get('origin');
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors(origin)});
  if(req.method!=='POST')return reply({error:'method_not_allowed'},405,origin);
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
  if(!token)return reply({error:'missing_token'},401,origin);
  const url=Deno.env.get('SUPABASE_URL')!;const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token);const caller=userData?.user;
  if(userError||!caller)return reply({error:'invalid_session'},401,origin);
  const {data:role,error:roleError}=await admin.from('user_roles').select('role,active').eq('user_id',caller.id).maybeSingle();
  if(roleError)return reply({error:'role_lookup_failed'},500,origin);
  if(!role?.active||!['admin','super_admin'].includes(role.role))return reply({error:'forbidden'},403,origin);

  const since7=new Date(Date.now()-7*86400000).toISOString();
  const since30=new Date(Date.now()-30*86400000).toISOString();
  const since14=new Date(Date.now()-(DAYS-1)*86400000);since14.setUTCHours(0,0,0,0);

  const [usersResult,rolesResult,lessonsResult,examsResult,attemptsResult,certsResult,sync7Result,sync30Result]=await Promise.all([
    admin.auth.admin.listUsers({page:1,perPage:1000}),
    admin.from('user_roles').select('user_id,role,active'),
    admin.from('lesson_validations').select('user_id,lesson_key,passed,passed_at,last_attempt_at'),
    admin.from('exam_validations').select('user_id,level,passed,best_pct,passed_at,last_attempt_at'),
    admin.from('exam_attempt_log').select('user_id,level,score,pct,passed,submitted_at').gte('submitted_at',since14.toISOString()),
    admin.from('certificates').select('status,average,issued_at,revoked_at'),
    admin.from('user_learning_state').select('user_id,updated_at').gte('updated_at',since7),
    admin.from('user_learning_state').select('user_id,updated_at').gte('updated_at',since30)
  ]);

  if(usersResult.error)return reply({error:'users_failed'},500,origin);
  const queryError=[rolesResult.error,lessonsResult.error,examsResult.error,attemptsResult.error,certsResult.error,sync7Result.error,sync30Result.error].find(Boolean);
  if(queryError)return reply({error:'analytics_query_failed'},500,origin);

  const users=usersResult.data.users||[];const roles=rolesResult.data||[];const lessons=lessonsResult.data||[];const exams=examsResult.data||[];const attempts=attemptsResult.data||[];const certs=certsResult.data||[];
  const activeRoleUsers=new Set(roles.filter((x:any)=>x.active!==false).map((x:any)=>x.user_id));
  const staff=roles.filter((x:any)=>x.active!==false&&['admin','super_admin'].includes(x.role)).length;
  const confirmed=users.filter((u:any)=>u.email_confirmed_at).length;
  const activeUsers=users.filter((u:any)=>activeRoleUsers.has(u.id)).length;

  const lessonCounts=Object.fromEntries(LESSONS.map(k=>[k,0]));
  for(const row of lessons)if(row.passed&&lessonCounts[row.lesson_key]!==undefined)lessonCounts[row.lesson_key]++;

  const examLevels=[1,2,3].map(level=>{
    const passedRows=exams.filter((x:any)=>Number(x.level)===level&&x.passed);
    const allAttempts=attempts.filter((x:any)=>Number(x.level)===level);
    const passedAttempts=allAttempts.filter((x:any)=>x.passed).length;
    const averageBest=passedRows.length?Math.round(passedRows.reduce((s:number,x:any)=>s+Number(x.best_pct||0),0)/passedRows.length):0;
    return {level,passed_users:passedRows.length,attempts_14d:allAttempts.length,passed_attempts_14d:passedAttempts,average_best_pct:averageBest};
  });

  const activeCertificates=certs.filter((x:any)=>x.status==='active');
  const revokedCertificates=certs.filter((x:any)=>x.status==='revoked');
  const certificateAverage=activeCertificates.length?Math.round(activeCertificates.reduce((s:number,x:any)=>s+Number(x.average||0),0)/activeCertificates.length):0;

  const activity=[] as any[];
  for(let offset=0;offset<DAYS;offset++){
    const start=new Date(since14.getTime()+offset*86400000);const end=new Date(start.getTime()+86400000);const key=start.toISOString().slice(0,10);
    const lessonPasses=lessons.filter((x:any)=>x.passed_at&&new Date(x.passed_at)>=start&&new Date(x.passed_at)<end).length;
    const examAttempts=attempts.filter((x:any)=>new Date(x.submitted_at)>=start&&new Date(x.submitted_at)<end).length;
    const certIssues=certs.filter((x:any)=>x.issued_at&&new Date(x.issued_at)>=start&&new Date(x.issued_at)<end).length;
    activity.push({date:key,lesson_passes:lessonPasses,exam_attempts:examAttempts,certificates_issued:certIssues});
  }

  const officialStudents=new Set(lessons.filter((x:any)=>x.passed).map((x:any)=>x.user_id));
  const completionUsers=new Set(exams.filter((x:any)=>Number(x.level)===3&&x.passed).map((x:any)=>x.user_id));

  return reply({
    generated_at:new Date().toISOString(),
    privacy:'aggregated_only',
    users:{total:users.length,confirmed,active:activeUsers,staff,with_official_activity:officialStudents.size,completed_route:completionUsers.size},
    lesson_funnel:LESSONS.map(key=>({lesson_key:key,passed_users:Number(lessonCounts[key]||0)})),
    exams:examLevels,
    certificates:{total:certs.length,active:activeCertificates.length,revoked:revokedCertificates.length,average:certificateAverage},
    activity:{days:activity,synced_users_7d:new Set((sync7Result.data||[]).map((x:any)=>x.user_id)).size,synced_users_30d:new Set((sync30Result.data||[]).map((x:any)=>x.user_id)).size}
  },200,origin);
});