-- Du lieu DEMO cho database 8 bang vua tao. Khong dung tren database that.
-- Chon database dich truoc khi chay. Tai khoan demo dung mat khau Metro123!
SET NAMES utf8mb4;
SET time_zone = '+07:00';

DELIMITER $$
CREATE PROCEDURE load_metro_demo()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    IF (SELECT COUNT(*) FROM users) + (SELECT COUNT(*) FROM tickets)
        + (SELECT COUNT(*) FROM trips) + (SELECT COUNT(*) FROM journeys)
        + (SELECT COUNT(*) FROM wallet_transactions) > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Demo requires empty users, tickets, trips, journeys and wallet_transactions';
    END IF;

    INSERT INTO `lines` (name, status)
    SELECT 'Nhổn - Ga Hà Nội', 'ACTIVE'
    WHERE NOT EXISTS (SELECT 1 FROM `lines` WHERE name = 'Nhổn - Ga Hà Nội');
    SET @line = (SELECT id FROM `lines` WHERE name = 'Nhổn - Ga Hà Nội' ORDER BY id LIMIT 1);

    INSERT INTO stations (line_id, name, order_index)
    SELECT @line, s.name, s.position
    FROM (
        SELECT 'Nhổn' AS name, 1 AS position
        UNION ALL SELECT 'Minh Khai', 2
        UNION ALL SELECT 'Phú Diễn', 3
        UNION ALL SELECT 'Cầu Diễn', 4
        UNION ALL SELECT 'Lê Đức Thọ', 5
        UNION ALL SELECT 'Đại học Quốc gia', 6
        UNION ALL SELECT 'Chùa Hà', 7
        UNION ALL SELECT 'Cầu Giấy', 8
    ) s
    WHERE NOT EXISTS (
        SELECT 1 FROM stations WHERE line_id = @line AND order_index = s.position
    );
    SET @origin = (SELECT id FROM stations WHERE line_id = @line AND order_index = 1);
    SET @destination = (SELECT id FROM stations WHERE line_id = @line AND order_index = 4);

    -- Tao loai ve rieng neu chua co dung gia/thoi han, khong sua loai ve cu.
    INSERT INTO ticket_types (name, type, price, valid_days)
    SELECT 'Vé lượt', 'SINGLE', 3000, 1
    WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE type = 'SINGLE' AND price = 3000 AND valid_days = 1);
    INSERT INTO ticket_types (name, type, price, valid_days)
    SELECT 'Vé tháng', 'MONTHLY', 200000, 30
    WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE type = 'MONTHLY' AND price = 200000 AND valid_days = 30);
    SET @single = (SELECT id FROM ticket_types WHERE type = 'SINGLE' AND price = 3000 AND valid_days = 1 ORDER BY id LIMIT 1);
    SET @monthly = (SELECT id FROM ticket_types WHERE type = 'MONTHLY' AND price = 200000 AND valid_days = 30 ORDER BY id LIMIT 1);

    SET @password = '$2y$10$lrlb1hVw25HX2QxQCUQ4AOeGCY8PB1X1aUYuwYUp2.2DzytLsPyzO';
    SET @now = NOW();
    SET @purchase = DATE_SUB(@now, INTERVAL 2 DAY);
    SET @yesterday = DATE_SUB(@now, INTERVAL 1 DAY);

    INSERT INTO users (fullname, phone, password_hash, role, wallet_balance)
    VALUES ('Quản trị viên Demo', '0900000001', @password, 'ADMIN', 0);
    SET @admin = LAST_INSERT_ID();
    INSERT INTO users (fullname, phone, password_hash, role, wallet_balance)
    VALUES ('Nguyễn Văn An', '0900000002', @password, 'USER', 782000);
    SET @an = LAST_INSERT_ID();
    INSERT INTO users (fullname, phone, password_hash, role, wallet_balance)
    VALUES ('Trần Thị Bình', '0900000003', @password, 'USER', 491000);
    SET @binh = LAST_INSERT_ID();

    INSERT INTO trips (line_id, trip_code, direction, departure_time, capacity, status)
    VALUES (@line, 'DEMO-COMPLETED', 'OUTBOUND', @yesterday, 100, 'COMPLETED');
    SET @completed = LAST_INSERT_ID();
    INSERT INTO trips (line_id, trip_code, direction, departure_time, capacity, status)
    VALUES (@line, 'DEMO-RUNNING', 'OUTBOUND', DATE_SUB(@now, INTERVAL 5 MINUTE), 100, 'RUNNING');
    SET @running = LAST_INSERT_ID();
    INSERT INTO trips (line_id, trip_code, direction, departure_time, capacity, status)
    VALUES
        (@line, 'DEMO-SCHEDULED', 'INBOUND', DATE_ADD(@now, INTERVAL 30 MINUTE), 100, 'SCHEDULED'),
        (@line, 'DEMO-CANCELLED', 'OUTBOUND', DATE_ADD(@now, INTERVAL 1 HOUR), 100, 'CANCELLED');

    INSERT INTO tickets (user_id, ticket_type_id, line_id, qr_code, purchase_price, purchased_at, valid_from, expires_at)
    VALUES (@an, @monthly, @line, SHA2(CONCAT(UUID(), RAND()), 256), 200000, @purchase, @purchase, DATE_ADD(@purchase, INTERVAL 30 DAY));
    SET @month_ticket = LAST_INSERT_ID();
    INSERT INTO tickets (user_id, ticket_type_id, line_id, qr_code, purchase_price, status, purchased_at, valid_from, expires_at, used_at)
    VALUES (@an, @single, @line, SHA2(CONCAT(UUID(), RAND()), 256), 9000, 'USED', DATE_SUB(@yesterday, INTERVAL 1 HOUR), DATE_SUB(@yesterday, INTERVAL 1 HOUR), DATE_ADD(@yesterday, INTERVAL 23 HOUR), DATE_ADD(@yesterday, INTERVAL 20 MINUTE));
    SET @used_ticket = LAST_INSERT_ID();
    INSERT INTO tickets (user_id, ticket_type_id, line_id, qr_code, purchase_price, purchased_at, valid_from, expires_at)
    VALUES (@an, @single, @line, SHA2(CONCAT(UUID(), RAND()), 256), 9000, @now, @now, DATE_ADD(@now, INTERVAL 1 DAY));
    SET @active_ticket = LAST_INSERT_ID();
    INSERT INTO tickets (user_id, ticket_type_id, line_id, qr_code, purchase_price, purchased_at, valid_from, expires_at)
    VALUES (@binh, @single, @line, SHA2(CONCAT(UUID(), RAND()), 256), 9000, DATE_SUB(@now, INTERVAL 30 MINUTE), DATE_SUB(@now, INTERVAL 30 MINUTE), DATE_ADD(@now, INTERVAL 1 DAY));
    SET @onboard_ticket = LAST_INSERT_ID();

    UPDATE tickets t JOIN ticket_types tt ON tt.id=t.ticket_type_id
    SET t.origin_station_id=@origin, t.destination_station_id=@destination
    WHERE tt.type='SINGLE';

    INSERT INTO ticket_types (name, type, price, valid_days)
    SELECT 'Vé ngày', 'DAILY', 30000, 1
    WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE type='DAILY');

    INSERT INTO journeys (ticket_id, origin_station_id, destination_station_id, checked_in_at, checked_out_at, checked_in_by, checked_out_by)
    VALUES
        (@month_ticket, @origin, @destination, @yesterday, DATE_ADD(@yesterday, INTERVAL 20 MINUTE), @admin, @admin),
        (@used_ticket, @origin, @destination, @yesterday, DATE_ADD(@yesterday, INTERVAL 20 MINUTE), @admin, @admin);
    INSERT INTO journeys (ticket_id, origin_station_id, checked_in_at, checked_in_by)
    VALUES (@onboard_ticket, @origin, DATE_SUB(@now, INTERVAL 4 MINUTE), @admin);

    INSERT INTO wallet_transactions (user_id, ticket_id, type, amount, created_at, idempotency_key)
    VALUES
        (@an, NULL, 'TOPUP', 1000000, DATE_SUB(@purchase, INTERVAL 1 HOUR), 'demo-topup-an'),
        (@an, @month_ticket, 'BUY_TICKET', 200000, @purchase, 'demo-buy-month'),
        (@an, @used_ticket, 'BUY_TICKET', 9000, DATE_SUB(@yesterday, INTERVAL 1 HOUR), 'demo-buy-used'),
        (@an, @active_ticket, 'BUY_TICKET', 9000, @now, 'demo-buy-active'),
        (@binh, NULL, 'TOPUP', 500000, DATE_SUB(@now, INTERVAL 1 HOUR), 'demo-topup-binh'),
        (@binh, @onboard_ticket, 'BUY_TICKET', 9000, DATE_SUB(@now, INTERVAL 30 MINUTE), 'demo-buy-onboard');

    COMMIT;
END$$
DELIMITER ;

CALL load_metro_demo();
DROP PROCEDURE load_metro_demo;

SELECT id, fullname, phone, role, wallet_balance FROM users ORDER BY id;
