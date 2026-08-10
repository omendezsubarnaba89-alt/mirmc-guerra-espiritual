import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGIN = 'https://omendezsubarnaba89-alt.github.io';
const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const json = (body: unknown, status = 200, origin: string | null = null) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
});

const countTrue = (obj: any, field: string) => Object.values(obj || {}).filter((v: any) => Boolean(v?.[field])).length;

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin);

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'missing_token' }, 401, origin);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const caller = userData?.user;
  if (userError || !caller) return json({ error: 'invalid_session' }, 401, origin);

  const { data: callerRole, error: roleError } = await admin.from('user_roles')
    .select('role,active')
    .eq('user_id', caller.id)
    .maybeSingle();

  if (roleError) return json({ error: 'role_lookup_failed' }, 500, origin);
  if (!callerRole?.active || !['admin','super_admin'].includes(callerRole.role)) return json({ error: 'forbidden' }, 403, origin);

  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400, origin); }
  const action = String(body?.action || '');

  if (action === 'list_users') {
    const page = Math.max(1, Math.min(1000, Number(body?.page || 1)));
    const perPage = Math.max(1, Math.min(100, Number(body?.per_page || 50)));
    const { data: usersPage, error: usersError } = await admin.auth.admin.listUsers({ page, perPage });
    if (usersError) return json({ error: 'list_users_failed' }, 500, origin);

    const users = usersPage.users || [];
    const ids = users.map((u: any) => u.id);
    if (!ids.length) return json({ users: [], page, per_page: perPage }, 200, origin);

    const [{ data: profiles }, { data: roles }, { data: learning }] = await Promise.all([
      admin.from('profiles').select('user_id,display_name,created_at').in('user_id', ids),
      admin.from('user_roles').select('user_id,role,active').in('user_id', ids),
      admin.from('user_learning_state').select('user_id,payload,updated_at').in('user_id', ids),
    ]);

    const profileMap = new Map((profiles || []).map((x: any) => [x.user_id, x]));
    const roleMap = new Map((roles || []).map((x: any) => [x.user_id, x]));
    const learningMap = new Map((learning || []).map((x: any) => [x.user_id, x]));

    const result = users.map((u: any) => {
      const p: any = profileMap.get(u.id) || {};
      const r: any = roleMap.get(u.id) || { role: 'student', active: true };
      const l: any = learningMap.get(u.id) || {};
      return {
        user_id: u.id,
        email: u.email || '',
        display_name: p.display_name || '',
        role: r.role || 'student',
        active: r.active !== false,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at || null,
        email_confirmed_at: u.email_confirmed_at || null,
        learning_updated_at: l.updated_at || null,
        lesson_count: countTrue(l.payload?.course, 'completed'),
        exam_count: countTrue(l.payload?.exams, 'passed'),
      };
    });

    return json({ users: result, page, per_page: perPage }, 200, origin);
  }

  if (action === 'get_user_detail') {
    const targetUserId = String(body?.user_id || '').trim();
    if (!targetUserId) return json({ error: 'missing_user_id' }, 400, origin);

    const { data: targetData, error: targetError } = await admin.auth.admin.getUserById(targetUserId);
    const target = targetData?.user;
    if (targetError || !target) return json({ error: 'user_not_found' }, 404, origin);

    const [{ data: profile }, { data: role }, { data: learning }] = await Promise.all([
      admin.from('profiles').select('display_name,created_at,updated_at').eq('user_id', targetUserId).maybeSingle(),
      admin.from('user_roles').select('role,active,created_at,updated_at').eq('user_id', targetUserId).maybeSingle(),
      admin.from('user_learning_state').select('schema_version,payload,created_at,updated_at').eq('user_id', targetUserId).maybeSingle(),
    ]);

    const payload: any = learning?.payload || {};
    return json({
      user: {
        user_id: target.id,
        email: target.email || '',
        display_name: profile?.display_name || '',
        role: role?.role || 'student',
        active: role?.active !== false,
        created_at: target.created_at,
        email_confirmed_at: target.email_confirmed_at || null,
        last_sign_in_at: target.last_sign_in_at || null,
        profile_updated_at: profile?.updated_at || null,
        learning_updated_at: learning?.updated_at || null,
        lesson_count: countTrue(payload.course, 'completed'),
        exam_count: countTrue(payload.exams, 'passed'),
        course: payload.course || {},
        exams: payload.exams || {},
        guard_count: Object.values(payload.guard || {}).filter(Boolean).length,
        certificate_name: payload.certificateName || '',
      }
    }, 200, origin);
  }

  if (action === 'list_audit') {
    if (callerRole.role !== 'super_admin') return json({ error: 'super_admin_required' }, 403, origin);
    const limit = Math.max(1, Math.min(100, Number(body?.limit || 30)));
    const { data: logs, error } = await admin.from('admin_audit_log')
      .select('id,actor_user_id,action,target_user_id,before_state,after_state,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return json({ error: 'audit_lookup_failed' }, 500, origin);

    const ids = Array.from(new Set((logs || []).flatMap((x: any) => [x.actor_user_id, x.target_user_id]).filter(Boolean)));
    const pairs: [string,string][] = [];
    for (const id of ids) {
      const { data } = await admin.auth.admin.getUserById(id as string);
      if (data?.user) pairs.push([id as string, data.user.email || '']);
    }
    const emailMap = new Map(pairs);

    return json({ logs: (logs || []).map((x: any) => ({
      ...x,
      actor_email: emailMap.get(x.actor_user_id) || '',
      target_email: emailMap.get(x.target_user_id) || '',
    })) }, 200, origin);
  }

  if (action === 'set_role') {
    if (callerRole.role !== 'super_admin') return json({ error: 'super_admin_required' }, 403, origin);

    const targetUserId = String(body?.user_id || '');
    const requestedRole = String(body?.role || '');
    const requestedActive = body?.active !== false;
    if (!targetUserId || !['student','admin','super_admin'].includes(requestedRole)) return json({ error: 'invalid_role_change' }, 400, origin);
    if (targetUserId === caller.id && (requestedRole !== 'super_admin' || !requestedActive)) return json({ error: 'cannot_demote_self' }, 400, origin);

    const { data: before } = await admin.from('user_roles').select('role,active').eq('user_id', targetUserId).maybeSingle();
    const nextState = { role: requestedRole, active: requestedActive };

    const { error } = await admin.from('user_roles').upsert({
      user_id: targetUserId,
      role: requestedRole,
      active: requestedActive,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) return json({ error: 'role_update_failed' }, 500, origin);

    await admin.from('admin_audit_log').insert({
      actor_user_id: caller.id,
      action: 'set_role',
      target_user_id: targetUserId,
      before_state: before || null,
      after_state: nextState,
    });

    return json({ ok: true, user_id: targetUserId, role: requestedRole, active: requestedActive }, 200, origin);
  }

  return json({ error: 'unknown_action' }, 400, origin);
});
