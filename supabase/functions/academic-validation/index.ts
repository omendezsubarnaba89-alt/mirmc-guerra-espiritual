import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGIN='https://omendezsubarnaba89-alt.github.io';
const cors=(origin:string|null)=>({
  'Access-Control-Allow-Origin':origin===ALLOWED_ORIGIN?origin:ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json; charset=utf-8','Vary':'Origin'
});
const reply=(body:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(body),{status,headers:cors(origin)});

const LESSON_KEYS:Record<string,number[]>={
  '01':[1,2,1],'02':[1,1,1],'03':[1,2,0],'04':[1,0,1],'05':[1,1,1],
  '06':[1,0,1],'07':[0,0,0],'08':[1,1,1],'09':[0,0,0],'10':[0,0,1],
  '11':[0,1,0],'12':[0,0,0],'13':[0,0,0],'14':[0,0,0],'15':[0,0,0]
};
const EXAM_KEYS:Record<number,number[]>={
  1:[1,1,1,0,1,0,1,1,1,1],
  2:[1,0,1,0,1,0,1,0,1,0],
  3:[1,1,0,1,0,1,1,1,1,1]
};
const LEVEL_LESSONS:Record<number,string[]>={1:['01','02','03','04','05'],2:['06','07','08','09','10'],3:['11','12','13','14','15']};

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
  const user=userData?.user;
  if(userError||!user)return reply({error:'invalid_session'},401,origin);

  let body:any={};
  try{body=await req.json();}catch{return reply({error:'invalid_json'},400,origin)}
  const action=String(body?.action||'');

  const lessonPassed=async(key:string)=>{
    const {data}=await admin.from('lesson_validations').select('passed').eq('user_id',user.id).eq('lesson_key',key).maybeSingle();
    return Boolean(data?.passed);
  };
  const examPassed=async(level:number)=>{
    const {data}=await admin.from('exam_validations').select('passed').eq('user_id',user.id).eq('level',level).maybeSingle();
    return Boolean(data?.passed);
  };

  if(action==='status'){
    const [{data:lessons,error:lessonError},{data:exams,error:examError}]=await Promise.all([
      admin.from('lesson_validations').select('lesson_key,attempts,best_score,total,passed,passed_at,last_attempt_at').eq('user_id',user.id).order('lesson_key'),
      admin.from('exam_validations').select('level,attempts,best_score,best_pct,passed,passed_at,last_attempt_at').eq('user_id',user.id).order('level')
    ]);
    if(lessonError||examError)return reply({error:'status_failed'},500,origin);
    return reply({lessons:lessons||[],exams:exams||[]},200,origin);
  }

  if(action==='submit_lesson'){
    const key=String(body?.lesson_key||'');
    const answerKey=LESSON_KEYS[key];
    const answers=Array.isArray(body?.answers)?body.answers.map(Number):[];
    if(!answerKey||answers.length!==answerKey.length||answers.some((x:number)=>!Number.isInteger(x)||x<0||x>3))return reply({error:'invalid_lesson_submission'},400,origin);

    const n=Number(key);
    if(n>1){
      if(n===6 && !(await examPassed(1)))return reply({error:'exam_prerequisite',required_exam:1},409,origin);
      if(n===11 && !(await examPassed(2)))return reply({error:'exam_prerequisite',required_exam:2},409,origin);
      if(n!==6&&n!==11){const previous=String(n-1).padStart(2,'0');if(!(await lessonPassed(previous)))return reply({error:'lesson_prerequisite',required_lesson:previous},409,origin);}
    }

    const score=answers.reduce((sum:number,value:number,index:number)=>sum+(value===answerKey[index]?1:0),0);
    const passed=score>=2; const now=new Date().toISOString();
    const {data:old}=await admin.from('lesson_validations').select('*').eq('user_id',user.id).eq('lesson_key',key).maybeSingle();
    const next={user_id:user.id,lesson_key:key,attempts:Number(old?.attempts||0)+1,best_score:Math.max(Number(old?.best_score||0),score),total:3,passed:Boolean(old?.passed||passed),passed_at:old?.passed_at||(passed?now:null),last_attempt_at:now,updated_at:now};
    const {error}=await admin.from('lesson_validations').upsert(next,{onConflict:'user_id,lesson_key'});
    if(error)return reply({error:'lesson_record_failed'},500,origin);
    return reply({official:true,lesson_key:key,score,total:3,pct:Math.round(score/3*100),passed,next:{attempts:next.attempts,best_score:next.best_score,passed:next.passed,passed_at:next.passed_at}},200,origin);
  }

  if(action==='submit_exam'){
    const level=Number(body?.level||0);const answerKey=EXAM_KEYS[level];const answers=Array.isArray(body?.answers)?body.answers.map(Number):[];
    if(!answerKey||answers.length!==answerKey.length||answers.some((x:number)=>!Number.isInteger(x)||x<0||x>3))return reply({error:'invalid_exam_submission'},400,origin);
    const required=LEVEL_LESSONS[level]||[];
    const {data:records,error:recordsError}=await admin.from('lesson_validations').select('lesson_key,passed').eq('user_id',user.id).in('lesson_key',required);
    if(recordsError)return reply({error:'prerequisite_lookup_failed'},500,origin);
    const passedSet=new Set((records||[]).filter((x:any)=>x.passed).map((x:any)=>x.lesson_key));
    const missing=required.filter(k=>!passedSet.has(k));
    if(missing.length)return reply({error:'lessons_prerequisite',missing_lessons:missing},409,origin);

    const score=answers.reduce((sum:number,value:number,index:number)=>sum+(value===answerKey[index]?1:0),0);
    const pct=Math.round(score/answerKey.length*100);const passed=pct>=80;const now=new Date().toISOString();
    const {data:old}=await admin.from('exam_validations').select('*').eq('user_id',user.id).eq('level',level).maybeSingle();
    const next={user_id:user.id,level,attempts:Number(old?.attempts||0)+1,best_score:Math.max(Number(old?.best_score||0),score),best_pct:Math.max(Number(old?.best_pct||0),pct),passed:Boolean(old?.passed||passed),passed_at:old?.passed_at||(passed?now:null),last_attempt_at:now,updated_at:now};
    const {error}=await admin.from('exam_validations').upsert(next,{onConflict:'user_id,level'});
    if(error)return reply({error:'exam_record_failed'},500,origin);
    return reply({official:true,level,score,total:10,pct,passed,next:{attempts:next.attempts,best_score:next.best_score,best_pct:next.best_pct,passed:next.passed,passed_at:next.passed_at}},200,origin);
  }

  return reply({error:'unknown_action'},400,origin);
});
