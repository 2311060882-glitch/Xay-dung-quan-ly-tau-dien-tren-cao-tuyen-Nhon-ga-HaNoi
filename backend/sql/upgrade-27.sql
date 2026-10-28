-- Nang cap tai cho schema hien tai; khong xoa du lieu. Chay truoc code moi.
SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS relatives (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id INT UNSIGNED NOT NULL,
 fullname VARCHAR(100) NOT NULL,
 birth_date DATE NOT NULL,
 relationship VARCHAR(50) NOT NULL,
 deleted_at DATETIME NULL,
 FOREIGN KEY (user_id) REFERENCES users(id),
 UNIQUE KEY uq_relative_owner (id,user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS priority_applications (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id INT UNSIGNED NOT NULL,
 relative_id INT UNSIGNED NULL,
 reason VARCHAR(1000) NOT NULL,
 status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
 rejection_reason VARCHAR(1000) NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 reviewed_at DATETIME NULL,
 reviewed_by INT UNSIGNED NULL,
 FOREIGN KEY (user_id) REFERENCES users(id),
 FOREIGN KEY (relative_id,user_id) REFERENCES relatives(id,user_id),
 FOREIGN KEY (reviewed_by) REFERENCES users(id),
 KEY idx_priority_owner (user_id,relative_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS requires_priority TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS relative_id INT UNSIGNED NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(100) NULL;
-- Khoa ngoai ghep duoc kiem tra o API cho cac cot bo sung de script chay lap lai duoc.
INSERT INTO ticket_types(name,type,price,valid_days,requires_priority)
SELECT 'Vé tháng ưu tiên','MONTHLY',100000,30,1
WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE requires_priority=1);
