# Hợp đồng API Hà Nội Metro

Phiên bản 27 chức năng, quét QR tại cổng ga. Chạy SQL nâng cấp theo BAN_GIAO.md. Base URL:

```text
http://localhost/Xay-dung-quan-ly-tau-dien-tren-cao-tuyen-Nhon-ga-HaNoi/backend/api/v1
```

Gửi JSON, Content-Type: application/json. Xác thực bằng cookie PHPSESSID. Sau đăng nhập hoặc GET /me, gửi data.csrf_token trong header X-CSRF-Token cho POST/PUT/PATCH cần đăng nhập.
Phản hồi: {status,message,data}; lỗi có error, lỗi form có errors. HTTP 400 dữ liệu sai, 401 chưa đăng nhập, 403 quyền/CSRF, 404 không tìm thấy, 405 sai method, 409 xung đột, 415 sai Content-Type, 500 lỗi máy chủ.
Tiền là chuỗi DECIMAL; ngày YYYY-MM-DD, giờ YYYY-MM-DD HH:mm:ss, múi giờ UTC+7.

## Tài khoản và danh mục

| Method | URL | Quyền | Dữ liệu |
|---|---|---|---|
| POST | /auth/register | Công khai | fullname, phone, password; tạo USER |
| POST | /auth/login | Công khai | phone, password; trả role, csrf_token |
| POST | /auth/logout | Đăng nhập | Hủy session |
| GET | /me | Đăng nhập | Hồ sơ, role, csrf_token |
| PUT | /me | Đăng nhập | fullname, phone |
| POST | /me/change-password | Đăng nhập | current_password, new_password |
| GET | /lines | Công khai | Danh sách tuyến |
| GET | /lines/{id}/stations | Công khai | Ga theo order_index |
| GET | /ticket-types | Công khai | SINGLE, DAILY, MONTHLY; price, valid_days |

## Mua vé và ví

POST /tickets/buy nhận line_id, ticket_type_id và header Idempotency-Key (1–64 ký tự A-Z, a-z, 0-9, :, _, -).

Vé mới chỉ chọn tuyến và loại vé, không chọn ga đi/đến. Có thể truyền relative_id của người thân thuộc tài khoản, hoặc null cho bản thân:

```json
{"line_id":1,"ticket_type_id":1,"relative_id":null}
```

Giá cố định từ ticket_types.price, thời hạn valid_days từ lúc mua. Loại vé requires_priority=true cần hồ sơ APPROVED cho đúng người sử dụng. Lưu purchase_price và passenger_name lúc mua, không tin giá từ client.
Phản hồi 201 có ticket_id, qr_code, purchase_price, thời hạn, wallet_balance. Gửi lại cùng Idempotency-Key và cùng tuyến/loại/người sử dụng trả vé cũ, không trừ thêm tiền. Đổi nội dung với khóa cũ trả 409.

| Method | URL | Quyền | Kết quả |
|---|---|---|---|
| GET | /tickets | Đăng nhập | Vé của mình |
| GET | /tickets/{id} | Đăng nhập | Vé của mình; người khác 404 |
| GET | /tickets/active-qr | Đăng nhập | Ưu tiên vé có lượt chưa ra ga, sau đó vé mới nhất còn dùng được; hoặc null |
| GET | /wallet | Đăng nhập | wallet_balance |
| POST | /wallet/top-up | Đăng nhập | amount nguyên 1..5000000, Idempotency-Key; nạp giả lập |
| GET | /wallet/transactions | Đăng nhập | Lịch sử giao dịch |

Trên phản hồi vé, origin_station_id/destination_station_id là **chặng đã mua**, không phải lượt quét. entry_station_id/entry_station_name là ga vào thực tế của lượt đang mở, has_open_journey cho biết có lượt đang mở. Vé mua mới có chặng mua null; các trường ga mua chỉ dành cho vé cũ. Vé trả thêm passenger_name và relative_id.

wallet_transactions.type giữ ENUM TOPUP/BUY_TICKET/REFUND. Nếu gặp Data truncated, kiểm tra SHOW COLUMNS FROM wallet_transactions LIKE 'type'; database đang chạy phải khớp schema. Không tắt strict mode hoặc nới kiểu để che lỗi.

## Quét cổng (ADMIN + CSRF)

| Method | URL | JSON |
|---|---|---|
| POST | /admin/tickets/validate-qr | qr_code, station_id, action=CHECK_IN/CHECK_OUT |
| POST | /admin/tickets/check-in | qr_code, station_id |
| POST | /admin/tickets/check-out | qr_code, station_id |

Không có trip_id, không kiểm tra trạng thái chuyến hoặc capacity. Nhân viên chọn ga đặt cổng trên giao diện. Admin xác nhận lấy từ session.

Check-in kiểm tra vé ACTIVE, trong thời hạn, ga cùng tuyến và chưa có lượt mở. Vé SINGLE cũ có origin phải vào đúng ga đã mua; vé mới chỉ kiểm tra cùng tuyến.
Check-out tìm lượt đang mở, kiểm tra ga cùng tuyến và khác ga vào; SINGLE cũ có destination phải ra đúng ga đã mua. Vé đã vào hợp lệ vẫn ra được khi hết hạn.
SINGLE thành USED khi ra ga; DAILY/MONTHLY dùng nhiều lượt trong thời hạn. Mỗi vé tối đa một lượt đang mở, bảo vệ bằng khóa vé và unique active_ticket_id.
validate-qr chỉ kiểm tra và rollback; check-in/out kiểm tra lại trước khi ghi.

journeys giữ tên cột origin_station_id, destination_station_id, checked_in_at, checked_out_at, checked_in_by, checked_out_by cho ga/thời gian/nhân viên thực tế.
Ba trường ra ga đều null khi đang đi; khi kết thúc cả ba phải có dữ liệu. API suy ra status=IN_PROGRESS/COMPLETED từ checked_out_at, không lưu thêm trạng thái trùng lặp trong bảng.
Kết quả ghi có action, station_name, journey. Check-in trả 201; check-out 200.

## Quản trị vé và báo cáo

| Method | URL | Dữ liệu / bộ lọc |
|---|---|---|
| GET | /admin/tickets | search (mã/tên/SĐT), from, to, line_id, ticket_type_id, status; phân trang |
| GET | /admin/tickets/{id} | Vé, chủ vé, lịch sử quét cổng |
| GET | /admin/reports/ticket-sales | from, to, line_id, ticket_type_id, group_by=day/line/ticket_type |
| GET | /me/journeys | Lượt quét của người đang đăng nhập; phân trang |

Doanh thu từ tickets.purchase_price; không cộng tiền nạp ví và không nhân theo số lượt đi.

## Lịch chạy tàu

| Method | URL | Quyền / dữ liệu |
|---|---|---|
| GET | /trips | Công khai; date, line_id, direction, status; phân trang |
| GET | /trips/{id} | Công khai; lịch khởi hành, chiều, sức chứa danh định, trạng thái |
| POST | /admin/trips | ADMIN; line_id, trip_code, direction, departure_time, capacity mặc định 100 |
| GET | /admin/trips | ADMIN; bộ lọc như /trips |
| GET | /admin/trips/{id} | ADMIN |
| PATCH | /admin/trips/{id} | ADMIN; departure_time, capacity, chỉ sửa chuyến SCHEDULED chưa khởi hành |
| PATCH | /admin/trips/{id}/status | ADMIN; SCHEDULED → RUNNING/CANCELLED; RUNNING → COMPLETED |

Các API occupancy và journeys theo chuyến đã gỡ, trả 404. Không trả onboard, available_seats hoặc occupancy; capacity chỉ là sức chứa danh định.
Lịch mẫu tự đồng bộ khi mở danh sách, mỗi 15 phút cho hai chiều. Trạng thái chuyến tự động hoàn tất sau 15 phút là mô phỏng, không phải theo dõi tàu thực tế; không có dữ liệu giờ đến từng ga.

Các danh sách mới trả {items,pagination:{page,per_page,total,total_pages}}. page mặc định 1; per_page mặc định 20, tối đa 100.
GET /tickets giữ phản hồi dạng mảng. Database mới: schema.sql → seed.sql → upgrade-27.sql. Database hiện tại: xem BAN_GIAO.md.

## Người thân và ưu tiên

Tất cả thao tác ghi bên dưới cần session và CSRF, gồm cả DELETE.

| Method | URL | Quyền / dữ liệu |
|---|---|---|
| GET | /relatives | Người thân chưa xóa của tài khoản, mảng |
| POST | /relatives | fullname, birth_date YYYY-MM-DD, relationship |
| PUT | /relatives | id và đầy đủ các trường trên; chỉ chủ sở hữu |
| DELETE | /relatives | JSON {id}; xóa mềm giữ vé/hồ sơ cũ |
| GET | /priority | Hồ sơ của tài khoản, mảng; passenger_name, status, rejection_reason |
| POST | /priority | relative_id hoặc null, reason tối đa 1000 ký tự; không gửi trùng khi PENDING/APPROVED |
| GET | /admin/priority | ADMIN; status mặc định PENDING, phân trang |
| PATCH | /admin/priority | ADMIN; id, status=APPROVED/REJECTED; REJECTED cần rejection_reason; chỉ xử lý PENDING |

## Tuyến, ga và lưu lượng

| Method | URL | Quyền / dữ liệu |
|---|---|---|
| GET | /admin/lines | ADMIN; tất cả tuyến, mảng |
| POST | /admin/lines | ADMIN; name, status=ACTIVE/INACTIVE |
| PUT | /admin/lines | ADMIN; id, name, status |
| POST | /admin/stations | ADMIN; line_id, name, order_index nguyên dương |
| PUT | /admin/stations | ADMIN; id, line_id không đổi, name, order_index; trùng vị trí trả 409 |
| GET | /admin/journeys | ADMIN; phân trang, mới nhất theo lần vào/ra cuối |
| GET | /admin/reports/traffic | ADMIN; from, to (bao gồm ngày cuối), station_id tùy chọn; mảng id/name/line_name/entries/exits |

Không có API xóa tuyến/ga để giữ tham chiếu lịch sử. Dừng tuyến bằng INACTIVE. Lịch sử quét trên giao diện polling 7 giây.
