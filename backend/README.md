# Backend Hà Nội Metro

PHP thuần 8.2+, mysqli, MariaDB của XAMPP; session và CSRF. Hướng dẫn chạy, bảng kiểm 27 mục và kết quả kiểm thử: [BAN_GIAO.md](../BAN_GIAO.md).

Database mới, trống: tạo `metro`, chạy `sql/schema.sql`, `sql/seed.sql`, rồi `sql/upgrade-27.sql`.
Database hiện tại theo schema trong dự án: chỉ chạy `sql/upgrade-27.sql`. Script thêm hai bảng và các cột cần thiết, giữ dữ liệu cũ; chạy lặp lại được trên MariaDB.

Không dùng `sql/metro.sql` để nâng cấp: đây là script reset cũ có xóa dữ liệu. `migrate-to-eight.sql` và `MIGRATION-8-TABLES.md` là tài liệu chuyển phiên bản cũ, không phải bước nâng cấp 27 chức năng.

Cấu hình `config/database.php`: hỗ trợ `METRO_DB_NAME`, `METRO_DB_PORT`, `METRO_DB_USER`, `METRO_DB_PASSWORD`. Mặc định `metro`, `127.0.0.1:3306`, `root`, mật khẩu trống.

Vé mới giá cố định từ `ticket_types.price`; thời hạn từ `valid_days`. Có thể mua cho người thân; vé ưu tiên cần hồ sơ APPROVED của đúng người sử dụng. Trừ ví, tạo vé và ghi giao dịch trong một transaction; khóa Idempotency-Key ngăn ghi trùng.

Vé lượt cũ có ga đi/đến vẫn giữ điều kiện ga đã mua. Vé mới không chọn hai ga, chỉ kiểm tra cùng tuyến; vé lượt thành USED sau khi ra, vé tháng dùng nhiều lượt. Khách đã vào được ra khi vé hết hạn trong lúc đi. Quét cổng không có trip_id.

Kiểm thử: `node backend/tests/features-27.cjs` từ thư mục gốc. Script tự khởi tạo MariaDB riêng tại cổng 13317 và PHP 18981/18982, giữ fixture trong thư mục tạm, không đọc/ghi database ứng dụng. Yêu cầu XAMPP ở `C:/xampp`, Node có fetch; các cổng kiểm thử phải trống. Bộ test `eight-tables.cjs` là test phiên bản trước, không áp dụng cho nghiệp vụ hiện tại.
