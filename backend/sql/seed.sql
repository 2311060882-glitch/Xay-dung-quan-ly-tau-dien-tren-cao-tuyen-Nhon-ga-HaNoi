-- Du lieu mau cho database moi. Chay lap lai khong them trung.
SET NAMES utf8mb4;
INSERT INTO `lines` (name,status)
SELECT 'Nhổn - Ga Hà Nội','ACTIVE' WHERE NOT EXISTS (SELECT 1 FROM `lines` WHERE name='Nhổn - Ga Hà Nội');
SET @line_id=(SELECT id FROM `lines` WHERE name='Nhổn - Ga Hà Nội' ORDER BY id LIMIT 1);
INSERT INTO ticket_types (name,type,price,valid_days)
SELECT 'Vé lượt','SINGLE',3000,1 WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='Vé lượt' AND type='SINGLE');
INSERT INTO ticket_types (name,type,price,valid_days)
SELECT 'Vé tháng','MONTHLY',200000,30 WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='Vé tháng' AND type='MONTHLY');
INSERT INTO stations (line_id,name,order_index) SELECT @line_id,'Nhổn',1 WHERE NOT EXISTS (SELECT 1 FROM stations WHERE line_id=@line_id AND order_index=1);
INSERT INTO stations (line_id,name,order_index) SELECT @line_id,'Minh Khai',2 WHERE NOT EXISTS (SELECT 1 FROM stations WHERE line_id=@line_id AND order_index=2);
INSERT INTO stations (line_id,name,order_index) SELECT @line_id,'Phú Diễn',3 WHERE NOT EXISTS (SELECT 1 FROM stations WHERE line_id=@line_id AND order_index=3);
INSERT INTO stations (line_id,name,order_index) SELECT @line_id,'Cầu Diễn',4 WHERE NOT EXISTS (SELECT 1 FROM stations WHERE line_id=@line_id AND order_index=4);
INSERT INTO stations (line_id,name,order_index) SELECT @line_id,'Lê Đức Thọ',5 WHERE NOT EXISTS (SELECT 1 FROM stations WHERE line_id=@line_id AND order_index=5);
INSERT INTO stations (line_id,name,order_index) SELECT @line_id,'Đại học Quốc gia',6 WHERE NOT EXISTS (SELECT 1 FROM stations WHERE line_id=@line_id AND order_index=6);
INSERT INTO stations (line_id,name,order_index) SELECT @line_id,'Chùa Hà',7 WHERE NOT EXISTS (SELECT 1 FROM stations WHERE line_id=@line_id AND order_index=7);
INSERT INTO stations (line_id,name,order_index) SELECT @line_id,'Cầu Giấy',8 WHERE NOT EXISTS (SELECT 1 FROM stations WHERE line_id=@line_id AND order_index=8);

INSERT INTO ticket_types (name,type,price,valid_days)
SELECT 'Vé ngày','DAILY',30000,1 WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE type='DAILY');
