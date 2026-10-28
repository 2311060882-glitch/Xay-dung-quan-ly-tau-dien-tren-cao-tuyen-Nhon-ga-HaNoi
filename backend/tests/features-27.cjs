// MariaDB rieng tren cong 13317; khong doc/ghi DB ung dung, khong xoa fixture.
const assert = require('node:assert/strict');
const {spawn,spawnSync} = require('node:child_process');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const root = path.resolve(__dirname,'..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(),'metro-27-tests-'));
const db = 'metro_gate_fixture_' + Date.now();
const php = 'C:/xampp/php/php.exe', mysql = 'C:/xampp/mysql/bin/mysql.exe';
const processes = [];
function sql(input, database = db) {
    const r = spawnSync(mysql,['--no-defaults','-h','127.0.0.1','-P','13317','-u','root','--default-character-set=utf8mb4','-N','-B',...(database ? [database] : [])],{input,encoding:'utf8',windowsHide:true});
    assert.equal(r.status,0,r.stderr);return r.stdout.trim();
}
function start(exe,args,options={}) {
    const p = spawn(exe,args,{windowsHide:true,stdio:['ignore','ignore','pipe'],...options});
    p.stderr.on('data',d => {if (/Fatal error/.test(String(d))) process.stderr.write(d);});
    processes.push(p);return p;
}
function client(port=18981) {
    let cookie='',csrf='';
    return async (route,method='GET',body,status=200,key=crypto.randomUUID(),withCsrf=true) => {
        const r = await fetch('http://127.0.0.1:'+port+'/api/v1'+route,{method,headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':withCsrf?csrf:'','Idempotency-Key':key},body:body===undefined?undefined:JSON.stringify(body)});
        if (r.headers.getSetCookie().length) cookie=r.headers.getSetCookie().at(-1).split(';')[0];
        const text=await r.text();assert.equal(r.status,status,route+': '+text);
        const data=JSON.parse(text).data;if(data?.csrf_token)csrf=data.csrf_token;return data;
    };
}
(async()=>{
 try {
    const init=spawnSync('C:/xampp/mysql/bin/mysql_install_db.exe',['--datadir='+dir,'--port=13317','--silent'],{encoding:'utf8',windowsHide:true});
    assert.equal(init.status,0,init.stderr);
    start('C:/xampp/mysql/bin/mysqld.exe',['--defaults-file='+path.join(dir,'my.ini'),'--console','--bind-address=127.0.0.1']);
    let ready=false;
    for(let i=0;i<100;i++){
        const r=spawnSync(mysql,['--no-defaults','-h','127.0.0.1','-P','13317','-u','root','-e','SELECT 1'],{windowsHide:true});
        if(r.status===0){ready=true;break;}await new Promise(r=>setTimeout(r,100));
    }
    assert.ok(ready,'MariaDB fixture did not start');
    sql('CREATE DATABASE '+db+' CHARACTER SET utf8mb4;',null);
    sql(fs.readFileSync(path.join(root,'sql/schema.sql'),'utf8'));
    sql(fs.readFileSync(path.join(root,'sql/seed.sql'),'utf8'));
    const migration=fs.readFileSync(path.join(root,'sql/upgrade-27.sql'),'utf8');
    sql(migration);sql(migration);
    for(const port of [18981,18982]) start(php,['-d','session.save_path='+dir,'-S','127.0.0.1:'+port,path.join(__dirname,'router.php')],{cwd:root,env:{...process.env,METRO_DB_NAME:db,METRO_DB_PORT:'13317'}});
    for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:18981/api/v1/lines');await fetch('http://127.0.0.1:18982/api/v1/lines');break;}catch{await new Promise(r=>setTimeout(r,100));}}
    const user=client(),other=client(18982),admin=client(),admin2=client(18982),user2=client(18982);
    for(const [c,phone] of [[admin,'0900000001'],[user,'0900000002'],[other,'0900000003']]){
        await c('/auth/register','POST',{fullname:'Fixture '+phone,phone,password:'Fixture123!'},201);
        await c('/auth/register','POST',{fullname:'Duplicate',phone,password:'Fixture123!'},409);
    }
    sql("UPDATE users SET role='ADMIN' WHERE phone='0900000001'");
    for(const [c,phone] of [[admin,'0900000001'],[admin2,'0900000001'],[user,'0900000002'],[user2,'0900000002'],[other,'0900000003']])await c('/auth/login','POST',{phone,password:'Fixture123!'});
    for(const route of ['/admin/lines','/admin/priority','/admin/tickets','/admin/journeys','/admin/reports/traffic','/admin/reports/ticket-sales','/admin/trips'])await user(route,'GET',undefined,403);
    await user('/relatives','POST',{},403,undefined,false);
    const relative=await user('/relatives','POST',{fullname:'Child',birth_date:'2010-01-01',relationship:'Con'},201);
    await other('/relatives','PUT',{id:relative.id,fullname:'Stolen',birth_date:'2010-01-01',relationship:'Con'},404);
    await other('/priority','POST',{relative_id:relative.id,reason:'Student'},404);
    await user('/relatives','PUT',{id:relative.id,fullname:'Updated child',birth_date:'2010-01-01',relationship:'Con'});
    const application=await user('/priority','POST',{relative_id:relative.id,reason:'Student'},201);
    await user('/priority','POST',{relative_id:relative.id,reason:'Duplicate'},409);
    const line=(await user('/lines'))[0],types=await user('/ticket-types'),stations=await user('/lines/'+line.id+'/stations');
    const single=types.find(t=>t.type==='SINGLE'),monthly=types.find(t=>t.type==='MONTHLY'&&!t.requires_priority),priority=types.find(t=>t.requires_priority);
    const payload={line_id:line.id,ticket_type_id:single.id};
    await user('/tickets/buy','POST',payload,409);
    for(const amount of [0,-1,1.5,5000001])await user('/wallet/top-up','POST',{amount},400);
    await user('/wallet/top-up','POST',{amount:1000000},201,'topup-once');
    await user('/wallet/top-up','POST',{amount:1000000},201,'topup-once');
    assert.equal(Number((await user('/wallet')).wallet_balance),1000000);
    await user('/tickets/buy','POST',{...payload,ticket_type_id:priority.id,relative_id:relative.id},403);
    await admin('/admin/priority','PATCH',{id:application.id,status:'APPROVED'});
    await admin('/admin/priority','PATCH',{id:application.id,status:'REJECTED',rejection_reason:'Already reviewed'},409);
    const discounted=await user('/tickets/buy','POST',{...payload,ticket_type_id:priority.id,relative_id:relative.id},201);
    assert.equal((await user('/tickets/'+discounted.ticket_id)).passenger_name,'Updated child');
    const self=await user('/priority','POST',{reason:'Self request'},201);
    await admin('/admin/priority','PATCH',{id:self.id,status:'REJECTED'},400);
    await admin('/admin/priority','PATCH',{id:self.id,status:'REJECTED',rejection_reason:'Missing information'});
    assert.ok((await user('/priority')).some(p=>p.status==='REJECTED'));
    await user('/tickets/buy','POST',{...payload,ticket_type_id:priority.id},403);
    const buys=await Promise.all([user('/tickets/buy','POST',payload,201,'buy-once'),user2('/tickets/buy','POST',payload,201,'buy-once')]);
    assert.equal(buys[0].ticket_id,buys[1].ticket_id);assert.equal(Number(buys[0].purchase_price),Number(single.price));
    const ticket=buys[0],scan=(station)=>({qr_code:ticket.qr_code,station_id:station.id});
    await admin('/admin/tickets/validate-qr','POST',{...scan(stations[0]),action:'CHECK_IN'});
    assert.equal(sql('SELECT COUNT(*) FROM journeys'),'0');
    const ins=await Promise.allSettled([admin('/admin/tickets/check-in','POST',scan(stations[0]),201),admin2('/admin/tickets/check-in','POST',scan(stations[0]),201)]);
    assert.equal(ins.filter(x=>x.status==='fulfilled').length,1);
    await admin('/admin/tickets/check-out','POST',scan(stations[1]));
    await admin('/admin/tickets/check-out','POST',scan(stations[1]),409);
    await admin('/admin/tickets/check-in','POST',scan(stations[0]),409);
    await other('/tickets/'+ticket.ticket_id,'GET',undefined,404);
    const month=await user('/tickets/buy','POST',{...payload,ticket_type_id:monthly.id},201);
    for(let i=0;i<2;i++){
        await admin('/admin/tickets/check-in','POST',{qr_code:month.qr_code,station_id:stations[0].id},201);
        await admin('/admin/tickets/check-out','POST',{qr_code:month.qr_code,station_id:stations[1].id});
    }
    assert.equal((await user('/tickets/'+month.ticket_id)).status,'ACTIVE');
    const traffic=await admin('/admin/reports/traffic');
    assert.equal(Number(traffic.find(s=>Number(s.id)===stations[0].id).entries),3);
    assert.equal(Number(traffic.find(s=>Number(s.id)===stations[1].id).exits),3);
    assert.equal((await admin('/admin/journeys')).items.length,3);
    assert.equal((await admin('/admin/tickets/'+month.ticket_id)).journeys.items.length,2);
    const report=await admin('/admin/reports/ticket-sales');
    assert.equal(Number(report.summary.revenue),Number(sql('SELECT SUM(purchase_price) FROM tickets')));
    assert.equal(Number(report.summary.tickets_sold),3);
    assert.equal(Number((await user('/wallet')).wallet_balance),1000000-Number(report.summary.revenue));
    assert.equal(Number(sql("SELECT COUNT(*) FROM wallet_transactions WHERE type='BUY_TICKET'")),3);
    // Nang cap lap lai tren du lieu da co van giu ve, tien va luot di.
    sql(migration);
    assert.deepEqual((await admin('/admin/reports/ticket-sales')).summary,report.summary);
    const wrongLine=await admin('/admin/lines','POST',{name:'Wrong line',status:'ACTIVE'},201);
    const wrongStation=await admin('/admin/stations','POST',{line_id:wrongLine.id,name:'Wrong station',order_index:1},201);
    await admin('/admin/tickets/check-in','POST',{qr_code:month.qr_code,station_id:wrongStation.id},400);
    await admin('/admin/tickets/check-in','POST',{qr_code:month.qr_code,station_id:stations[0].id},201);
    sql('UPDATE tickets SET valid_from=DATE_SUB(NOW(),INTERVAL 2 DAY),expires_at=DATE_SUB(NOW(),INTERVAL 1 SECOND) WHERE id='+month.ticket_id);
    assert.equal((await user('/tickets/active-qr')).id,month.ticket_id);
    await admin('/admin/tickets/check-out','POST',{qr_code:month.qr_code,station_id:stations[1].id});
    await admin('/admin/tickets/check-in','POST',{qr_code:month.qr_code,station_id:stations[0].id},409);
    assert.equal((await admin('/admin/tickets?search=Updated%20child')).pagination.total,1);
    await user('/relatives','DELETE',{id:relative.id});assert.equal((await user('/relatives')).length,0);
    assert.equal((await user('/tickets/'+discounted.ticket_id)).passenger_name,'Updated child');
    await user('/tickets/buy','POST',{...payload,relative_id:relative.id},404);
    const newLine=await admin('/admin/lines','POST',{name:'Test line',status:'ACTIVE'},201);
    const newStation=await admin('/admin/stations','POST',{line_id:newLine.id,name:'A',order_index:1},201);
    await admin('/admin/stations','POST',{line_id:newLine.id,name:'Duplicate',order_index:1},409);
    await admin('/admin/stations','PUT',{id:newStation.id,line_id:newLine.id,name:'Changed',order_index:2});
    await admin('/admin/lines','PUT',{id:newLine.id,name:'Stopped line',status:'INACTIVE'});
    await user('/tickets/buy','POST',{...payload,line_id:newLine.id},400);
    const trip=await admin('/admin/trips','POST',{line_id:line.id,trip_code:'TEST-27',direction:'OUTBOUND',departure_time:'2099-01-01 10:00:00',capacity:100},201);
    await admin('/admin/trips/'+trip.id+'/status','PATCH',{status:'COMPLETED'},409);
    await admin('/admin/trips/'+trip.id+'/status','PATCH',{status:'RUNNING'});
    await admin('/admin/trips/'+trip.id+'/status','PATCH',{status:'COMPLETED'});
    assert.ok((await user('/trips')).items.length);
    await user('/me','PUT',{fullname:'Updated user',phone:'0900000002'});
    await user('/me/change-password','POST',{current_password:'Wrong123!',new_password:'Changed123!'},400);
    await user('/me/change-password','POST',{current_password:'Fixture123!',new_password:'Changed123!'});
    await user('/auth/logout','POST',{});await user('/wallet','GET',undefined,401);
    await user('/auth/login','POST',{phone:'0900000002',password:'Changed123!'});
    console.log('PASS: registration/session/password/logout; roles/CSRF/ownership; relatives; priority pending/approve/reject; flat fare; money/idempotency; concurrent scan; monthly reuse; sales/traffic; catalog/trips; upgrade twice.');
 } finally {
    for(const p of processes.reverse())p.kill();
    console.log('Fixture retained (no data deleted): '+dir+' / '+db);
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
