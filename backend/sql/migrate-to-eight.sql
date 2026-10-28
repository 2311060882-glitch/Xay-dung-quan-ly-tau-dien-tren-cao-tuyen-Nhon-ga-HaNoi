-- Nang cap tu database 8 bang CU (journeys con trip_id).
-- Nguon metro giu nguyen; dich metro_v2 da tao TRONG bang schema.sql MOI.
-- Dung ghi vao nguon trong luc chuyen, doi chieu truoc khi doi ket noi.
-- Khong dung cho database 11 bang chua chuyen doi.
USE metro_v2;
SET NAMES utf8mb4;
SET time_zone = '+07:00';

DROP TEMPORARY TABLE IF EXISTS ticket_route_mapping;
CREATE TEMPORARY TABLE ticket_route_mapping (
    ticket_id INT UNSIGNED PRIMARY KEY,
    origin_station_id INT UNSIGNED NOT NULL,
    destination_station_id INT UNSIGNED NOT NULL
);
-- Dien chinh xac ch manual cho ve SINGLE chua co lich su dong.
-- Vi du, thay ID thuc te va bo dau --:
-- INSERT INTO ticket_route_mapping VALUES (12, 1, 4), (13, 4, 1);

-- Chi lay tu lich su neu co duy nhat mot cap ga da hoan tat.
INSERT IGNORE INTO ticket_route_mapping
SELECT j.ticket_id, MIN(j.origin_station_id), MIN(j.destination_station_id)
FROM metro.journeys j JOIN metro.tickets t ON t.id=j.ticket_id
JOIN metro.ticket_types tt ON tt.id=t.ticket_type_id
WHERE tt.type='SINGLE' AND j.checked_out_at IS NOT NULL
GROUP BY j.ticket_id
HAVING COUNT(DISTINCT j.origin_station_id, j.destination_station_id)=1;

SELECT t.id AS ticket_needs_route, t.user_id, t.status
FROM metro.tickets t JOIN metro.ticket_types tt ON tt.id=t.ticket_type_id
LEFT JOIN ticket_route_mapping m ON m.ticket_id=t.id
WHERE tt.type='SINGLE' AND m.ticket_id IS NULL;

DROP PROCEDURE IF EXISTS migrate_metro_eight;
DELIMITER $$
CREATE PROCEDURE migrate_metro_eight()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
    IF (SELECT COUNT(*) FROM users)+(SELECT COUNT(*) FROM `lines`)+
       (SELECT COUNT(*) FROM stations)+(SELECT COUNT(*) FROM trips)+
       (SELECT COUNT(*) FROM ticket_types)+(SELECT COUNT(*) FROM tickets)+
       (SELECT COUNT(*) FROM journeys)+(SELECT COUNT(*) FROM wallet_transactions)>0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Destination must be empty';
    END IF;
    IF EXISTS (
        SELECT 1 FROM metro.tickets t JOIN metro.ticket_types tt ON tt.id=t.ticket_type_id
        LEFT JOIN ticket_route_mapping m ON m.ticket_id=t.id
        LEFT JOIN metro.stations a ON a.id=m.origin_station_id
        LEFT JOIN metro.stations b ON b.id=m.destination_station_id
        WHERE tt.type='SINGLE' AND (m.ticket_id IS NULL OR a.id IS NULL OR b.id IS NULL
            OR a.line_id<>t.line_id OR b.line_id<>t.line_id OR a.id=b.id)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fill valid ticket_route_mapping for every SINGLE ticket before migration';
    END IF;
    IF EXISTS (
        SELECT 1 FROM metro.journeys j JOIN metro.tickets t ON t.id=j.ticket_id
        JOIN metro.stations a ON a.id=j.origin_station_id
        LEFT JOIN metro.stations b ON b.id=j.destination_station_id
        WHERE a.line_id<>t.line_id OR b.line_id<>t.line_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Journey stations must belong to ticket line';
    END IF;
    IF EXISTS (
        SELECT 1 FROM metro.journeys j JOIN metro.tickets t ON t.id=j.ticket_id
        JOIN metro.ticket_types tt ON tt.id=t.ticket_type_id
        JOIN ticket_route_mapping m ON m.ticket_id=t.id
        WHERE j.checked_out_at IS NULL AND tt.type='SINGLE' AND j.origin_station_id<>m.origin_station_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Open SINGLE entry must match mapped origin';
    END IF;

    INSERT INTO users (id,fullname,phone,password_hash,wallet_balance,created_at,role)
        SELECT id,fullname,phone,password_hash,wallet_balance,created_at,role FROM metro.users;
    INSERT INTO `lines` (id,name,status) SELECT id,name,status FROM metro.`lines`;
    INSERT INTO stations (id,line_id,name,order_index)
        SELECT id,line_id,name,order_index FROM metro.stations;
    INSERT INTO ticket_types (id,name,type,price,valid_days)
        SELECT id,name,type,price,valid_days FROM metro.ticket_types;
    INSERT INTO trips (id,line_id,trip_code,direction,departure_time,capacity,status,created_at)
        SELECT id,line_id,trip_code,direction,departure_time,capacity,status,created_at FROM metro.trips;
    INSERT INTO tickets (id,user_id,ticket_type_id,line_id,origin_station_id,destination_station_id,
        qr_code,purchase_price,status,purchased_at,valid_from,expires_at,used_at)
        SELECT t.id,t.user_id,t.ticket_type_id,t.line_id,
            IF(tt.type='SINGLE',m.origin_station_id,NULL),
            IF(tt.type='SINGLE',m.destination_station_id,NULL),
            t.qr_code,t.purchase_price,t.status,t.purchased_at,t.valid_from,t.expires_at,t.used_at
        FROM metro.tickets t JOIN metro.ticket_types tt ON tt.id=t.ticket_type_id
        LEFT JOIN ticket_route_mapping m ON m.ticket_id=t.id;
    INSERT INTO journeys (id,ticket_id,origin_station_id,destination_station_id,checked_in_at,checked_out_at,checked_in_by,checked_out_by)
        SELECT id,ticket_id,origin_station_id,destination_station_id,checked_in_at,checked_out_at,checked_in_by,checked_out_by
        FROM metro.journeys;
    INSERT INTO wallet_transactions (id,user_id,ticket_id,type,amount,created_at,idempotency_key)
        SELECT id,user_id,ticket_id,type,amount,created_at,idempotency_key FROM metro.wallet_transactions;
    COMMIT;
END$$
DELIMITER ;
CALL migrate_metro_eight();
DROP PROCEDURE migrate_metro_eight;
DROP TEMPORARY TABLE ticket_route_mapping;

SELECT 'users' AS table_name,(SELECT COUNT(*) FROM metro.users) AS old_count,COUNT(*) AS new_count FROM users
UNION ALL SELECT 'lines',(SELECT COUNT(*) FROM metro.`lines`),COUNT(*) FROM `lines`
UNION ALL SELECT 'stations',(SELECT COUNT(*) FROM metro.stations),COUNT(*) FROM stations
UNION ALL SELECT 'trips',(SELECT COUNT(*) FROM metro.trips),COUNT(*) FROM trips
UNION ALL SELECT 'ticket_types',(SELECT COUNT(*) FROM metro.ticket_types),COUNT(*) FROM ticket_types
UNION ALL SELECT 'tickets',(SELECT COUNT(*) FROM metro.tickets),COUNT(*) FROM tickets
UNION ALL SELECT 'journeys',(SELECT COUNT(*) FROM metro.journeys),COUNT(*) FROM journeys
UNION ALL SELECT 'wallet_transactions',(SELECT COUNT(*) FROM metro.wallet_transactions),COUNT(*) FROM wallet_transactions;
SELECT (SELECT SUM(wallet_balance) FROM metro.users) AS old_balance,SUM(wallet_balance) AS new_balance FROM users;
SELECT type,SUM(amount) AS total FROM wallet_transactions GROUP BY type;
SELECT SUM(purchase_price) AS ticket_revenue FROM tickets;
