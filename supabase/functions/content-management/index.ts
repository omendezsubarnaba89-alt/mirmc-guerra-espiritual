import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGIN = 'https://omendezsubarnaba89-alt.github.io';
const headers = (origin:string|null) => ({
  'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Content-Type':'application/json; charset=utf-8',
  'Vary':'Origin'
});
const reply=(body:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(body),{status,headers:headers(origin)});
const validKey=(type:string,key:string)=> type==='lesson' ? /^\d{2}$/.test(key) : /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key);

Deno.serve(async (req:Request)=>{
  const origin=req.headers.get('origin');
  if(req.method==='OPTIONS') return new Response('ok',{headers:headers(origin)});
  if(req.method!=='POST') return reply({error:'method_not_allowed'},405,origin);
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
  if(!token) return reply({error:'missing_token'},401,origin);

  const url=Deno.env.get('SUPABASE_URL')!;
  const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token);
  const caller=userData?.user;
  if(userError||!caller) return reply({error:'invalid_session'},401,origin);
  const {data:role,error:roleError}=await admin.from('user_roles').select('role,active').eq('user_id',caller.id).maybeSingle();
  if(roleError) return reply({error:'role_lookup_failed'},500,origin);
  if(!role?.active||!['admin','super_admin'].includes(role.role)) return reply({error:'forbidden'},403,origin);

  let body:any={};
  try{body=await req.json();}catch{return reply({error:'invalid_json'},400,origin)}
  const action=String(body?.action||'');
  const audit=async(actionName:string,type:string,key:string,details:any={})=>{
    await admin.from('content_audit_log').insert({actor_user_id:caller.id,action:actionName,content_type:type,content_key:key,details});
  };
  const nextVersion=async(type:string,key:string)=>{
    const {data}=await admin.from('content_versions').select('version').eq('content_type',type).eq('content_key',key).order('version',{ascending:false}).limit(1).maybeSingle();
    return Number(data?.version||0)+1;
  };

  if(action==='list_items'){
    const {data,error}=await admin.from('content_items').select('content_type,content_key,draft_payload,published_payload,position,archived,current_version,created_at,updated_at,published_at').order('content_type').order('position').order('content_key');
    if(error) return reply({error:'list_failed'},500,origin);
    return reply({items:data||[]},200,origin);
  }

  if(action==='get_item'){
    const type=String(body?.content_type||''); const key=String(body?.content_key||'');
    if(!['lesson','resource'].includes(type)||!validKey(type,key)) return reply({error:'invalid_key'},400,origin);
    const {data,error}=await admin.from('content_items').select('*').eq('content_type',type).eq('content_key',key).maybeSingle();
    if(error) return reply({error:'get_failed'},500,origin);
    return reply({item:data||null},200,origin);
  }

  if(action==='save_draft'){
    const type=String(body?.content_type||''); const key=String(body?.content_key||'');
    const payload=body?.payload; const position=Math.max(0,Math.min(9999,Number(body?.position||0)));
    if(!['lesson','resource'].includes(type)||!validKey(type,key)||!payload||typeof payload!=='object'||Array.isArray(payload)) return reply({error:'invalid_content'},400,origin);
    const encoded=JSON.stringify(payload); if(encoded.length>120000) return reply({error:'content_too_large'},413,origin);
    const {data:existing}=await admin.from('content_items').select('created_by').eq('content_type',type).eq('content_key',key).maybeSingle();
    const {error}=await admin.from('content_items').upsert({content_type:type,content_key:key,draft_payload:payload,position,archived:false,updated_by:caller.id,created_by:existing?.created_by||caller.id},{onConflict:'content_type,content_key'});
    if(error) return reply({error:'save_failed'},500,origin);
    await audit('save_draft',type,key,{position});
    return reply({ok:true},200,origin);
  }

  if(action==='list_versions'){
    const type=String(body?.content_type||''); const key=String(body?.content_key||'');
    if(!['lesson','resource'].includes(type)||!validKey(type,key)) return reply({error:'invalid_key'},400,origin);
    const {data,error}=await admin.from('content_versions').select('id,content_type,content_key,version,payload,published_by,published_at').eq('content_type',type).eq('content_key',key).order('version',{ascending:false}).limit(100);
    if(error) return reply({error:'versions_failed'},500,origin);
    return reply({versions:data||[]},200,origin);
  }

  if(action==='rollback'){
    if(role.role!=='super_admin') return reply({error:'super_admin_required'},403,origin);
    const type=String(body?.content_type||''); const key=String(body?.content_key||''); const version=Number(body?.version||0);
    if(!['lesson','resource'].includes(type)||!validKey(type,key)||!Number.isInteger(version)||version<1) return reply({error:'invalid_version'},400,origin);
    const {data:snapshot,error:snapshotError}=await admin.from('content_versions').select('payload,version').eq('content_type',type).eq('content_key',key).eq('version',version).maybeSingle();
    if(snapshotError||!snapshot) return reply({error:'version_not_found'},404,origin);
    const newVersion=await nextVersion(type,key);
    const now=new Date().toISOString();
    const {error:versionError}=await admin.from('content_versions').insert({content_type:type,content_key:key,version:newVersion,payload:snapshot.payload,published_by:caller.id,published_at:now});
    if(versionError) return reply({error:'version_create_failed'},500,origin);
    const {error:updateError}=await admin.from('content_items').update({draft_payload:snapshot.payload,published_payload:snapshot.payload,current_version:newVersion,published_at:now,archived:false,updated_by:caller.id}).eq('content_type',type).eq('content_key',key);
    if(updateError) return reply({error:'rollback_failed'},500,origin);
    await audit('rollback',type,key,{from_version:version,new_version:newVersion});
    return reply({ok:true,version:newVersion},200,origin);
  }

  if(['publish','unpublish','archive','restore'].includes(action)){
    if(role.role!=='super_admin') return reply({error:'super_admin_required'},403,origin);
    const type=String(body?.content_type||''); const key=String(body?.content_key||'');
    if(!['lesson','resource'].includes(type)||!validKey(type,key)) return reply({error:'invalid_key'},400,origin);
    const {data:item,error:getError}=await admin.from('content_items').select('*').eq('content_type',type).eq('content_key',key).maybeSingle();
    if(getError||!item) return reply({error:'item_not_found'},404,origin);
    let patch:any={updated_by:caller.id}; let version:number|null=null;
    if(action==='publish'){
      if(!item.draft_payload) return reply({error:'draft_required'},400,origin);
      version=await nextVersion(type,key); const now=new Date().toISOString();
      const {error:versionError}=await admin.from('content_versions').insert({content_type:type,content_key:key,version,payload:item.draft_payload,published_by:caller.id,published_at:now});
      if(versionError) return reply({error:'version_create_failed'},500,origin);
      patch={...patch,published_payload:item.draft_payload,published_at:now,current_version:version,archived:false};
    } else if(action==='unpublish') patch={...patch,published_payload:null,published_at:null};
    else if(action==='archive') patch={...patch,archived:true,published_payload:null,published_at:null};
    else if(action==='restore') patch={...patch,archived:false};
    const {error}=await admin.from('content_items').update(patch).eq('content_type',type).eq('content_key',key);
    if(error) return reply({error:'state_change_failed'},500,origin);
    await audit(action,type,key,version?{version}:{});
    return reply({ok:true,version},200,origin);
  }

  if(action==='audit'){
    if(role.role!=='super_admin') return reply({error:'super_admin_required'},403,origin);
    const {data,error}=await admin.from('content_audit_log').select('id,actor_user_id,action,content_type,content_key,details,created_at').order('created_at',{ascending:false}).limit(200);
    if(error) return reply({error:'audit_failed'},500,origin);
    return reply({events:data||[]},200,origin);
  }

  return reply({error:'unknown_action'},400,origin);
});
