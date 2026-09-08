import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const admin = '33333333-3333-4333-8333-333333333333';
const ticket = '44444444-4444-4444-8444-444444444444';
const guest = '55555555-5555-4555-8555-555555555555';

async function database() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
    GRANT USAGE ON SCHEMA auth TO anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
    INSERT INTO auth.users VALUES ('${owner}', 'player@example.com', now()), ('${other}', 'other@example.com', now()),
      ('${admin}', 'cwj120408@gmail.com', now());`);
  let sql = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
  // PGlite has UUID generation built in, but not logical replication.
  sql = sql.replace(/-- BEGIN REALTIME SETUP[\s\S]*?-- END REALTIME SETUP/g, '');
  await db.exec(sql);
  await db.exec(`INSERT INTO public.inquiries(id,user_id,nickname,inquiry_code) VALUES
    ('${ticket}','${owner}','Player','STM-TEST123456789ABCDE'),
    ('${guest}',NULL,'Guest','STM-GUEST123456789ABCD');`);
  return db;
}

async function asUser(db, id, sql) {
  await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '${id}', false);
    SELECT set_config('request.jwt.claims', '{"email":"${id === admin ? 'cwj120408@gmail.com' : 'player@example.com'}"}', false);`);
  try { return await db.query(sql); } finally { await db.exec('RESET ROLE'); }
}

test('database enforces authorization even when the browser is bypassed', async (t) => {
  const db = await database();
  t.after(() => db.close());
  await t.test('ordinary users cannot publish reports', async () => {
    await assert.rejects(() => asUser(db, owner, "INSERT INTO reports(slug,content) VALUES ('forged','fake')"));
  });
  await t.test('notification functions cannot be called through the public database API', async () => {
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      try {
        for (const name of ['claim_inquiry_telegram_alert','claim_inquiry_message_telegram_alert']) {
          await assert.rejects(() => db.query(`SELECT public.${name}('${ticket}')`));
        }
        for (const name of ['mark_inquiry_telegram_alert_sent','release_inquiry_telegram_alert','mark_inquiry_message_telegram_alert_sent','release_inquiry_message_telegram_alert']) {
          await assert.rejects(() => db.query(`SELECT public.${name}('${ticket}','${guest}')`));
        }
      } finally { await db.exec('RESET ROLE'); }
    }
  });
  await t.test('owners cannot impersonate an administrator', async () => {
    await assert.rejects(() => asUser(db, owner, `INSERT INTO inquiry_messages(inquiry_id,sender,message) VALUES ('${ticket}','admin','forged')`));
  });
  await t.test('owners cannot detach a private inquiry from their account', async () => {
    await assert.rejects(() => asUser(db, owner, `UPDATE inquiries SET user_id=NULL WHERE id='${ticket}'`));
  });
  await t.test('owners cannot choose notification claim or creation timestamps', async () => {
    await assert.rejects(() => asUser(db, owner, `UPDATE inquiries SET telegram_alert_sent_at=NULL, created_at=now() WHERE id='${ticket}'`));
  });
  await t.test('another member cannot read or message this inquiry', async () => {
    assert.equal((await asUser(db, other, `SELECT id FROM inquiries WHERE id='${ticket}'`)).rows.length, 0);
    await assert.rejects(() => asUser(db, other, `INSERT INTO inquiry_messages(inquiry_id,sender,message) VALUES ('${ticket}','user','intrusion')`));
  });
  await t.test('member and admin messages still work', async () => {
    await asUser(db, owner, `INSERT INTO inquiry_messages(inquiry_id,sender,message) VALUES ('${ticket}','user','hello')`);
    await asUser(db, admin, `INSERT INTO inquiry_messages(inquiry_id,sender,message) VALUES ('${ticket}','admin','reply')`);
    await asUser(db, admin, "INSERT INTO reports(slug,content) VALUES ('news-test','Public report')");
  });
  await t.test('unconfirmed admin email is denied', async () => {
    await db.exec(`UPDATE auth.users SET email_confirmed_at=NULL WHERE id='${admin}'`);
    assert.equal((await asUser(db, admin, 'SELECT public.is_support_admin() AS allowed')).rows[0].allowed, false);
    await db.exec(`UPDATE auth.users SET email_confirmed_at=now() WHERE id='${admin}'`);
  });
  await t.test('oversized guest messages cannot reach storage', async () => {
    await db.exec('SET ROLE anon');
    try {
      await assert.rejects(() => db.query(`SELECT send_guest_inquiry_message('STM-GUEST123456789ABCD', repeat('x',12001))`));
    } finally { await db.exec('RESET ROLE'); }
  });
  await t.test('join nickname command injection fails in the database', async () => {
    await db.exec('SET ROLE anon');
    try {
      await assert.rejects(() => db.query(`INSERT INTO join_requests(edition,minecraft_nickname,inviter_name,contact,rules_agreed,privacy_agreed)
        VALUES ('bedrock',E'Steve\\nop attacker','friend','contact',true,true)`));
    } finally { await db.exec('RESET ROLE'); }
  });
  await t.test('guest code access preserves messages without leaking internal fields', async () => {
    await db.exec("SET ROLE anon; SELECT set_config('request.headers','{\"x-forwarded-for\":\"192.0.2.10\"}',false)");
    try {
      const created = (await db.query("SELECT create_guest_inquiry('Guest','기타','도움','질문') AS item")).rows[0].item;
      assert.equal(created.user_id,null);
      assert.ok(created.inquiry_code.startsWith('STM-'));
      assert.equal('telegram_alert_claim_token' in created,false);
      assert.equal('guest_ip' in created,false);
      assert.equal((await db.query('SELECT * FROM get_guest_inquiry_messages($1)',[created.inquiry_code])).rows.length,1);
      const sent = (await db.query('SELECT send_guest_inquiry_message($1,$2) AS item',[created.inquiry_code,'follow up'])).rows[0].item;
      assert.equal(sent.sender,'user');
      assert.equal('telegram_alert_claim_token' in sent,false);
      assert.equal((await db.query("SELECT get_guest_inquiry('STM-TEST123456789ABCDE') AS item")).rows[0].item,null);
    } finally { await db.exec('RESET ROLE'); }
  });
  await t.test('member creation is atomic and enforces the three-per-hour quota', async () => {
    const create = "SELECT create_member_inquiry('Player','기타','content','purpose') AS item";
    await asUser(db,other,create); await asUser(db,other,create); await asUser(db,other,create);
    await assert.rejects(()=>asUser(db,other,create),error=>error.code==='P0001');
    const counts = (await db.query(`SELECT count(*)::int AS n FROM inquiries i JOIN inquiry_messages m ON m.inquiry_id=i.id WHERE i.user_id='${other}'`)).rows[0].n;
    assert.equal(counts,3);
    await assert.rejects(()=>asUser(db,other,`INSERT INTO inquiries(user_id,nickname,inquiry_code) VALUES ('${other}','bypass','STM-BYPASS123456789AB')`));
  });
  await t.test('rate limits use a rolling interval across clock boundaries', async () => {
    await db.exec("INSERT INTO private.request_events(key,created_at) SELECT md5('probe:actor'),now()-interval '30 minutes' FROM generate_series(1,3)");
    await assert.rejects(()=>db.query("SELECT private.consume_limit('probe','actor',3,3600)"),error=>error.code==='P0001');
  });
  await t.test('the security migration can be applied again without losing inquiries', async () => {
    const before = (await db.query('SELECT count(*) AS n FROM inquiries')).rows[0].n;
    await db.exec(await readFile(new URL('../database/migrations/20260907_security_hardening.sql',import.meta.url),'utf8'));
    assert.equal((await db.query('SELECT count(*) AS n FROM inquiries')).rows[0].n,before);
    await assert.rejects(()=>asUser(db,owner,"INSERT INTO reports(slug,content) VALUES ('still-denied','fake')"));
  });
});
