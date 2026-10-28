// Integration checks use fixture databases only; never read/write the application DB.
const assert = require('node:assert/strict');
const {spawn, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const db = 'metro_gate_fixture_' + Date.now();
const legacyDb = db + '_legacy', migrationDb = db + '_migration', demoDb = db + '_demo';
const dbPort = process.env.METRO_DB_PORT || '3306';
const php = 'C:/xampp/php/php.exe';
const mysql = 'C:/xampp/mysql/bin/mysql.exe';
const mysqlArgs = ['-h', '127.0.0.1', '-P', dbPort, '-u', 'root', '--default-character-set=utf8mb4', '-N', '-B'];
const sessionDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metro-gate-sessions-'));
const schema = fs.readFileSync(path.join(root, 'sql/schema.sql'), 'utf8');
const servers = [], created = [];
function runSql(input, database) {
    return spawnSync(mysql, [...mysqlArgs, ...(database ? [database] : [])], {input, encoding: 'utf8', windowsHide: true});
}
function sql(input, database = db) {
    const result = runSql(input, database);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
}
function create(database) {
    assert.match(database, /^metro_gate_fixture_[0-9]+(?:_(?:legacy|migration|demo))?$/);
    sql('CREATE DATABASE ' + database + ' CHARACTER SET utf8mb4;', undefined);
    created.push(database);
}
function invalidSql(input, expected) {
    const result = runSql(input, db);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, expected);
}
function client(port) {
    let cookie = '', csrf = '';
    return async (route, method = 'GET', body, expected = 200, key = crypto.randomUUID(), csrfEnabled = true) => {
        const response = await fetch('http://127.0.0.1:' + port + '/api/v1' + route, {
            method, headers: {'Content-Type': 'application/json', Cookie: cookie,
                'X-CSRF-Token': csrfEnabled ? csrf : '', 'Idempotency-Key': key},
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        if (response.headers.getSetCookie().length) cookie = response.headers.getSetCookie().at(-1).split(';')[0];
        const text = await response.text();
        let json;
        try { json = JSON.parse(text); } catch { throw Error(route + ': ' + text); }
        assert.equal(response.status, expected, route + ': ' + text);
        if (json.data?.csrf_token) csrf = json.data.csrf_token;
        return json.data;
    };
}
(async () => {
    try {
        // No default DB here: CREATE DATABASE must work before the fixture exists.
        const result = runSql('CREATE DATABASE ' + db + ' CHARACTER SET utf8mb4;');
        assert.equal(result.status, 0, result.stderr);
        created.push(db);
        sql(schema); sql(schema);
        const seed = fs.readFileSync(path.join(root, 'sql/seed.sql'), 'utf8');
        sql(seed); sql(seed);
        assert.equal(sql('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE();'), '8');
        assert.equal(sql("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='journeys' AND column_name='trip_id';"), '0');
        assert.equal(sql('SELECT COUNT(*) FROM ticket_types;'), '3');
        const hash = spawnSync(php, ['-r', "echo password_hash('Fixture123!', PASSWORD_BCRYPT);"], {encoding: 'utf8'}).stdout;
        sql("INSERT INTO users (fullname,phone,password_hash,role) VALUES ('Admin','0900000001','" + hash + "','ADMIN'),('User','0900000002','" + hash + "','USER'),('Other','0900000003','" + hash + "','USER');");
        // Gapped order values still represent seven physical segments, not seventy.
        sql('UPDATE stations SET order_index=order_index*10;');
        for (const port of [18981, 18982]) {
            const server = spawn(php, ['-d', 'session.save_path=' + sessionDir, '-S', '127.0.0.1:' + port, path.join(__dirname, 'router.php')],
                {cwd: root, env: {...process.env, METRO_DB_NAME: db, METRO_DB_PORT: dbPort}, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true});
            server.stderr.on('data', data => { if (String(data).includes('Fatal error')) process.stderr.write(data); });
            servers.push(server);
        }
        for (let n = 0; n < 50; n++) {
            try { await fetch('http://127.0.0.1:18981/api/v1/lines'); await fetch('http://127.0.0.1:18982/api/v1/lines'); break; }
            catch { await new Promise(resolve => setTimeout(resolve, 100)); }
        }
        const admin = client(18981), admin2 = client(18982), user = client(18981), user2 = client(18982), other = client(18982);
        for (const [c, phone] of [[admin,'0900000001'],[admin2,'0900000001'],[user,'0900000002'],[user2,'0900000002'],[other,'0900000003']])
            await c('/auth/login', 'POST', {phone, password: 'Fixture123!'});
        await user('/admin/tickets', 'GET', undefined, 403);
        await admin('/admin/tickets/check-in', 'POST', {}, 403, undefined, false);
        await user('/wallet/top-up', 'POST', {amount: 1000000}, 201, 'topup-one');
        await user('/wallet/top-up', 'POST', {amount: 1000000}, 201, 'topup-one');
        assert.equal(Number((await user('/wallet')).wallet_balance), 1000000);
        await user('/wallet/top-up', 'POST', {amount: 1}, 409, 'topup-one');
        await other('/wallet/top-up', 'POST', {amount: 1000000}, 201);
        const line = (await user('/lines'))[0];
        const stations = await user('/lines/' + line.id + '/stations');
        const types = await user('/ticket-types');
        const single = types.find(t => t.type === 'SINGLE'), monthly = types.find(t => t.type === 'MONTHLY'), daily = types.find(t => t.type === 'DAILY');
        const payload = {line_id: line.id, ticket_type_id: single.id, origin_station_id: stations[0].id, destination_station_id: stations[3].id};
        await user('/tickets/buy', 'POST', {line_id: line.id, ticket_type_id: single.id}, 400);
        await user('/tickets/buy', 'POST', {...payload, destination_station_id: stations[0].id}, 400);
        sql("INSERT INTO `lines` (name) VALUES ('Other line');");
        const otherLine = sql('SELECT MAX(id) FROM `lines`;');
        sql("INSERT INTO stations(line_id,name,order_index) VALUES (" + otherLine + ",'Other station',1);");
        const otherStation = Number(sql('SELECT MAX(id) FROM stations;'));
        await user('/tickets/buy', 'POST', {...payload, destination_station_id: otherStation}, 400);
        // Payload price is untrusted; concurrent retries debit once.
        const purchases = await Promise.all([
            user('/tickets/buy', 'POST', {...payload, price: 1}, 201, 'buy-one'),
            user2('/tickets/buy', 'POST', {...payload, price: 1}, 201, 'buy-one')
        ]);
        const buy = purchases[0];
        assert.equal(purchases[1].ticket_id, buy.ticket_id);
        assert.equal(Number(buy.purchase_price), Number(single.price) * 3);
        assert.equal(Number((await user('/wallet')).wallet_balance), 1000000 - Number(single.price) * 3);
        await user('/tickets/buy', 'POST', {...payload, destination_station_id: stations[2].id}, 409, 'buy-one');
        const second = await other('/tickets/buy', 'POST', payload, 201);
        const reverse = await user('/tickets/buy', 'POST', {...payload, origin_station_id: stations[7].id, destination_station_id: stations[0].id}, 201);
        assert.equal(Number(reverse.purchase_price), Number(single.price) * 7);
        await user('/tickets/buy', 'POST', {...payload, ticket_type_id: monthly.id}, 400);
        const month = await user('/tickets/buy', 'POST', {line_id: line.id, ticket_type_id: monthly.id, origin_station_id: null, destination_station_id: null}, 201);
        const day = await user('/tickets/buy', 'POST', {line_id: line.id, ticket_type_id: daily.id}, 201);
        assert.equal(month.origin_station_id, null);
        assert.equal(day.destination_station_id, null);
        await other('/tickets/' + buy.ticket_id, 'GET', undefined, 404);
        const detail = await user('/tickets/' + buy.ticket_id);
        assert.equal(Number(detail.origin_station_id), Number(stations[0].id));
        assert.ok(detail.origin_station_name);
        const scan = (ticket, station = stations[0]) => ({qr_code: ticket.qr_code, station_id: station.id});
        await admin('/admin/tickets/check-in', 'POST', scan(buy, stations[1]), 400);
        await admin('/admin/tickets/check-in', 'POST', {qr_code: buy.qr_code, station_id: otherStation}, 400);
        await admin('/admin/tickets/check-out', 'POST', scan(buy, stations[3]), 409);
        await admin('/admin/tickets/validate-qr', 'POST', {...scan(buy), action: 'CHECK_IN'});
        assert.equal(sql('SELECT COUNT(*) FROM journeys;'), '0');
        // No trip exists yet; gates must work independently.
        assert.equal(sql('SELECT COUNT(*) FROM trips;'), '0');
        const scans = await Promise.allSettled([
            admin('/admin/tickets/check-in', 'POST', scan(buy), 201),
            admin2('/admin/tickets/check-in', 'POST', scan(buy), 201)
        ]);
        assert.equal(scans.filter(r => r.status === 'fulfilled').length, 1);
        const failure = scans.find(r => r.status === 'rejected');
        assert.equal(failure.reason.actual, 409);
        const open = (await user('/me/journeys')).items[0];
        assert.equal(open.status, 'IN_PROGRESS');
        assert.equal(open.destination_station_id, null);
        assert.equal(open.checked_out_at, null);
        assert.equal(open.checked_out_by, null);
        assert.ok(!('trip_id' in open));
        // A different ticket enters without being limited by a train capacity.
        await admin('/admin/tickets/check-in', 'POST', scan(second), 201);
        await admin('/admin/tickets/check-out', 'POST', scan(buy, stations[2]), 400);
        sql('UPDATE tickets SET expires_at=DATE_SUB(NOW(),INTERVAL 1 SECOND),valid_from=DATE_SUB(NOW(),INTERVAL 2 DAY) WHERE id=' + buy.ticket_id);
        assert.equal((await user('/tickets/active-qr')).id, buy.ticket_id, 'Expired ticket in station still has exit QR');
        await admin('/admin/tickets/validate-qr', 'POST', {...scan(buy, stations[3]), action: 'CHECK_OUT'});
        const exits = await Promise.allSettled([
            admin('/admin/tickets/check-out', 'POST', scan(buy, stations[3])),
            admin2('/admin/tickets/check-out', 'POST', scan(buy, stations[3]))
        ]);
        assert.equal(exits.filter(r => r.status === 'fulfilled').length, 1);
        assert.equal(exits.find(r => r.status === 'rejected').reason.actual, 409);
        assert.equal(sql('SELECT status FROM tickets WHERE id=' + buy.ticket_id), 'USED');
        await admin('/admin/tickets/check-in', 'POST', scan(buy), 409);
        await admin('/admin/tickets/check-out', 'POST', scan(second, stations[3]));
        await admin('/admin/tickets/check-in', 'POST', scan(reverse, stations[7]), 201);
        await admin('/admin/tickets/check-out', 'POST', scan(reverse, stations[0]));
        const before = await admin('/admin/reports/ticket-sales');
        for (const ticket of [month, day]) {
            for (let n = 0; n < 2; n++) {
                await admin('/admin/tickets/check-in', 'POST', scan(ticket, stations[7]), 201);
                await admin('/admin/tickets/check-out', 'POST', scan(ticket, stations[7]), 400);
                await admin('/admin/tickets/check-out', 'POST', scan(ticket, stations[n]));
            }
            assert.equal(sql('SELECT status FROM tickets WHERE id=' + ticket.ticket_id), 'ACTIVE');
        }
        assert.deepEqual((await admin('/admin/reports/ticket-sales')).summary, before.summary);
        assert.ok((await user('/me/journeys')).items.every(j => Number(j.user_id) === 2));
        assert.equal((await admin('/admin/tickets/' + month.ticket_id)).journeys.items.length, 2);
        const future = '2099-01-01 10:00:00';
        const trip = await admin('/admin/trips', 'POST', {line_id: line.id, trip_code: 'TEST', direction: 'OUTBOUND', departure_time: future, capacity: 1}, 201);
        await admin('/admin/trips/' + trip.id, 'PATCH', {capacity: 2});
        await admin('/admin/trips/' + trip.id + '/status', 'PATCH', {status: 'RUNNING'});
        await admin('/admin/tickets/check-in', 'POST', scan(month), 201);
        await admin('/admin/trips/' + trip.id + '/status', 'PATCH', {status: 'COMPLETED'});
        await admin('/admin/tickets/check-out', 'POST', scan(month, stations[1]));
        for (const suffix of ['occupancy', 'journeys']) await admin('/admin/trips/' + trip.id + '/' + suffix, 'GET', undefined, 404);
        const schedule = await user('/trips?line_id=' + line.id + '&per_page=100');
        const auto = schedule.items.find(t => t.trip_code.startsWith('AUTO-'));
        assert.ok(auto);
        assert.ok(schedule.items.every(t => !('onboard' in t) && !('available_seats' in t)));
        assert.ok(!('occupancy' in (await user('/trips/' + trip.id))));
        sql('UPDATE trips SET departure_time=DATE_SUB(NOW(),INTERVAL 30 MINUTE) WHERE id=' + auto.id);
        await user('/trips?line_id=' + line.id);
        assert.equal(sql('SELECT status FROM trips WHERE id=' + auto.id), 'COMPLETED');
        for (const query of ['page=0','per_page=101','date=2026-02-30','direction[]=OUTBOUND']) await user('/trips?' + query, 'GET', undefined, 400);
        for (const group of ['day','line','ticket_type']) await admin('/admin/reports/ticket-sales?group_by=' + group);
        await admin('/admin/reports/ticket-sales?group_by=bad', 'GET', undefined, 400);
        // DB constraints also hold when bypassing PHP.
        invalidSql("INSERT INTO wallet_transactions(user_id,ticket_id,type,amount,idempotency_key) VALUES (1," + buy.ticket_id + ",'BUY_TICKET',1,'bad-owner');", /foreign key constraint/i);
        invalidSql("INSERT INTO wallet_transactions(user_id,type,amount,idempotency_key) VALUES (2,'BUY_TIKET',1,'bad-type');", /Data truncated|CONSTRAINT/i);
        invalidSql('INSERT INTO journeys(ticket_id,origin_station_id,checked_in_by) VALUES (' + month.ticket_id + ',' + stations[0].id + ',1),(' + month.ticket_id + ',' + stations[0].id + ',1);', /Duplicate entry/);
        invalidSql('INSERT INTO journeys(ticket_id,origin_station_id,destination_station_id,checked_in_by) VALUES (' + month.ticket_id + ',' + stations[0].id + ',' + stations[1].id + ',1);', /chk_journeys_checkout_complete/);
        await user('/me', 'PUT', {fullname: 'Updated user', phone: '0900000002'});
        await user('/me/change-password', 'POST', {current_password: 'wrong', new_password: 'Changed123!'}, 400);
        await user('/me/change-password', 'POST', {current_password: 'Fixture123!', new_password: 'Changed123!'});
        await user('/auth/logout', 'POST', {});
        await user('/wallet', 'GET', undefined, 401);

        // Build a copy of the previous eight-table schema, retaining old trip links.
        const unused = await other('/tickets/buy', 'POST', payload, 201);
        assert.ok(unused.ticket_id);
        await admin('/admin/tickets/check-in', 'POST', scan(month), 201);
        create(legacyDb); create(migrationDb);
        sql(schema, legacyDb); sql(schema, migrationDb);
        const fields = {
            users: 'id,fullname,phone,password_hash,wallet_balance,created_at,role',
            lines: 'id,name,status', stations: 'id,line_id,name,order_index',
            ticket_types: 'id,name,type,price,valid_days',
            tickets: 'id,user_id,ticket_type_id,line_id,qr_code,purchase_price,status,purchased_at,valid_from,expires_at,used_at',
            trips: 'id,line_id,trip_code,direction,departure_time,capacity,status,created_at',
            journeys: 'id,ticket_id,origin_station_id,destination_station_id,checked_in_at,checked_out_at,checked_in_by,checked_out_by',
            wallet_transactions: 'id,user_id,ticket_id,type,amount,created_at,idempotency_key'
        };
        for (const [table, cols] of Object.entries(fields)) sql('INSERT INTO ' + legacyDb + '.`' + table + '` (' + cols + ') SELECT ' + cols + ' FROM `' + table + '`;');
        sql('ALTER TABLE tickets DROP FOREIGN KEY fk_ticket_origin, DROP FOREIGN KEY fk_ticket_destination, DROP CONSTRAINT chk_ticket_route, DROP COLUMN origin_station_id, DROP COLUMN destination_station_id;', legacyDb);
        sql('ALTER TABLE journeys ADD trip_id INT UNSIGNED NOT NULL DEFAULT ' + trip.id + ', ADD FOREIGN KEY (trip_id) REFERENCES trips(id);', legacyDb);
        const migrationText = fs.readFileSync(path.join(root, 'sql/migrate-to-eight.sql'), 'utf8')
            .replace(/\bmetro_v2\b/g, migrationDb).replace(/\bmetro\b/g, legacyDb);
        // Add an unused single ticket: migration cannot guess its purchased route.
        const stopped = runSql(migrationText);
        assert.notEqual(stopped.status, 0);
        assert.match(stopped.stderr, /ticket_route_mapping/);
        assert.equal(sql('SELECT COUNT(*) FROM users;', migrationDb), '0');
        const routes = sql("SELECT GROUP_CONCAT(CONCAT('(',id,',',origin_station_id,',',destination_station_id,')') SEPARATOR ',') FROM tickets WHERE origin_station_id IS NOT NULL;");
        const mapped = migrationText.replace('-- INSERT INTO ticket_route_mapping VALUES (12, 1, 4), (13, 4, 1);', 'INSERT INTO ticket_route_mapping VALUES ' + routes + ';');
        sql(mapped, migrationDb);
        for (const table of Object.keys(fields)) assert.equal(sql('SELECT COUNT(*) FROM `' + table + '`;', migrationDb), sql('SELECT COUNT(*) FROM `' + table + '`;', legacyDb));
        assert.equal(sql('SELECT SUM(wallet_balance) FROM users;', migrationDb), sql('SELECT SUM(wallet_balance) FROM users;', legacyDb));
        assert.equal(sql('SELECT COUNT(*) FROM journeys WHERE checked_out_at IS NULL;', migrationDb), '1');
        assert.equal(sql("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='" + legacyDb + "' AND table_name='journeys' AND column_name='trip_id';"), '1');
        assert.equal(sql("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='" + migrationDb + "' AND table_name='journeys' AND column_name='trip_id';"), '0');

        create(demoDb); sql(schema, demoDb);
        const demo = fs.readFileSync(path.join(root, 'sql/seed-demo.sql'), 'utf8');
        sql(demo, demoDb);
        assert.equal(sql('SELECT COUNT(*) FROM users;', demoDb), '3');
        assert.equal(sql('SELECT COUNT(*) FROM journeys;', demoDb), '3');
        assert.equal(sql("SELECT COUNT(*) FROM users u WHERE wallet_balance <> COALESCE((SELECT SUM(CASE WHEN type='BUY_TICKET' THEN -amount ELSE amount END) FROM wallet_transactions w WHERE w.user_id=u.id),0);", demoDb), '0');
        const repeat = runSql(demo, demoDb);
        assert.notEqual(repeat.status, 0);
        assert.match(repeat.stderr, /Demo requires empty/);
        assert.equal(sql('SELECT COUNT(*) FROM users;', demoDb), '3');
        const reset = fs.readFileSync(path.join(root, 'sql/metro.sql'), 'utf8');
        assert.ok(reset.endsWith(schema), 'Reset script and schema must match');
        sql(reset.replace(/\bmetro\b/g, demoDb), demoDb);
        assert.equal(sql('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE();', demoDb), '8');
        assert.equal(sql('SELECT COUNT(*) FROM users;', demoDb), '0');
        console.log('PASS: eight tables; gate-only scans; route fares/validation; concurrent idempotency and scans; expired exit QR; daily/monthly reuse; roles/CSRF/ownership; schedules without occupancy; DB constraints; migration preserves source and money; demo ledger.');
    } finally {
        for (const server of servers) server.kill();
        await Promise.all(servers.map(s => s.exitCode !== null ? Promise.resolve() : new Promise(resolve => s.once('exit', resolve))));
        for (const database of created.reverse()) {
            assert.match(database, /^metro_gate_fixture_[0-9]+(?:_(?:legacy|migration|demo))?$/);
            const result = runSql('DROP DATABASE IF EXISTS ' + database);
            assert.equal(result.status, 0, result.stderr);
        }
        assert.equal(path.dirname(sessionDir), path.resolve(os.tmpdir()));
        fs.rmSync(sessionDir, {recursive: true});
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
