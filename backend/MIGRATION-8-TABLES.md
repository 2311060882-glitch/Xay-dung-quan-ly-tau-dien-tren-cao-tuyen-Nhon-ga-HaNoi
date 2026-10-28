# Database 8 bảng — quét cổng ga

Giữ users, lines, stations, ticket_types, tickets, trips, journeys, wallet_transactions.
MariaDB 10.2.1+, PHP 8.2+. Đã kiểm thử trên MariaDB 10.4.32.

## Tạo mới hoặc tạo lại

- Database trống: chọn database đích, chạy sql/schema.sql rồi sql/seed.sql.
- Tạo lại metro từ đầu: sql/metro.sql xóa các bảng cũ và tạo 8 bảng mới. File này **xóa dữ liệu**, chỉ dùng khi muốn reset.
- Demo: chọn database mới có các bảng giao dịch rỗng, chạy sql/seed-demo.sql. Ba tài khoản 0900000001 (ADMIN), 0900000002, 0900000003 dùng mật khẩu Metro123!.
- Không chạy schema.sql đè lên cấu trúc cũ để nâng cấp: CREATE TABLE IF NOT EXISTS không sửa bảng đã có.
- Kết nối mặc định metro, port 3306. METRO_DB_NAME và METRO_DB_PORT có thể đổi đích.

## Chuyển từ bản 8 bảng cũ có journeys.trip_id

1. Backup nguồn metro và cấu hình. Dừng ghi vào nguồn trong lúc chép và đối chiếu.
2. Tạo database metro_v2 trống. Chọn metro_v2, chạy schema.sql mới; chưa chạy seed hoặc demo.
3. Đọc sql/migrate-to-eight.sql. Script lấy metro làm nguồn, metro_v2 làm đích; không sửa/xóa nguồn.
4. Điền ticket_route_mapping trong script cho vé SINGLE chưa có chặng. Script tự lấy ga từ lịch sử đã đóng nếu chỉ có đúng một cặp ga; không đoán ga đến cho vé chưa đi. Danh sách ticket_needs_route cho biết vé cần bổ sung. Sau khi điền, chạy lại toàn bộ script.
5. Script dừng nếu thiếu/sai ga, ga khác tuyến hoặc ga vào của lượt đang mở không khớp chặng được khai báo. Đích phải rỗng; lỗi trong phần copy rollback toàn bộ.
6. Giữ nguyên ID, QR, thời gian, người xác nhận, giá đã mua, số dư, giao dịch và khóa idempotency. Bỏ liên kết chuyến ở đích; database nguồn vẫn giữ trip_id để đối chiếu.
7. Kiểm tra số dòng 8 bảng, tổng số dư, tiền giao dịch theo type, doanh thu và lượt chưa ra. Lưu ý: price của loại SINGLE giờ là **giá mỗi chặng**; rà lại giá cấu hình trước khi mở bán, không thay purchase_price lịch sử.
8. Nếu cần dữ liệu loại DAILY mới, thêm riêng vào ticket_types sau khi copy. Không thay đổi type của loại vé đã bán.
9. Tắt event metro_automatic_trips cũ nếu có trước khi chuyển kết nối; PHP tự đồng bộ lịch mẫu, không cần event.
10. Chuyển METRO_DB_NAME sang metro_v2 sau khi đối chiếu. Giữ nguyên nguồn để phục hồi.

Script này dành cho bản 8 bảng ngay trước thay đổi, không tự gộp database 11 bảng cũ. Không chạy trên nguồn 11 bảng khi chưa đối chiếu riêng ba loại lịch sử; tránh nhân đôi lượt đi hoặc mất dữ liệu.

## Quy tắc

tickets.origin_station_id/destination_station_id là chặng đã mua; nullable cho vé ngày/tháng, bắt buộc với SINGLE ở API. Có khóa ngoại và CHECK hai trường cùng null hoặc cùng có dữ liệu và khác nhau.
journeys.origin_station_id/destination_station_id là ga quét thực tế. Giữ các cột checked_in/out hiện tại và các ràng buộc thời gian, ba trường ra ga đầy đủ hoặc cùng null. Không có trip_id. active_ticket_id là cột kỹ thuật unique ngăn hai lượt mở cùng vé.
API suy ra status IN_PROGRESS/COMPLETED từ checked_out_at; không cần thêm cột trạng thái.
Vé tháng/ngày áp dụng trong tuyến của vé. Vé hết hạn sau check-in vẫn được check-out.
trips chỉ phục vụ lịch; không đo chỗ trống hay chặn cổng theo capacity.

## Kiểm tra

node backend/tests/eight-tables.cjs tạo database fixture, hai PHP server và session tạm riêng, rồi dọn các fixture của chính bài test.
Có thể dùng METRO_DB_PORT để chạy trên MySQL kiểm thử riêng. Không dùng database ứng dụng làm fixture.
Bài test kiểm tra giá chặng, mua/nạp gửi lại, tranh quét cùng vé, hết hạn khi đang đi, vé ngày/tháng, quyền/CSRF, lịch sử, doanh thu, SQL constraints, demo và migration.
Frontend: npm.cmd run build, npm.cmd run lint; node tests/api-session.cjs, node tests/qr-camera.cjs, node tests/admin-access.cjs.
