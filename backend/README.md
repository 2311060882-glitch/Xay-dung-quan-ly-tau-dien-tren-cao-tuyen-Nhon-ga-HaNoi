# Backend Metro — bộ khung PHP thuần

## Chạy trên XAMPP
1. Giải nén, chép thư mục `backend` vào thư mục dự án trong `C:\xampp\htdocs`.
2. Bật Apache và MySQL trong XAMPP.
3. Ví dụ dự án là `metro`, mở http://localhost/metro/backend/api/health.php.
4. Sửa `config/database.php`: tên DB, tài khoản, mật khẩu, port theo máy bạn.

## Phạm vi bộ khung
- Có sẵn cấu trúc thư mục và tất cả file API đã trao đổi.
- Helpers đọc JSON, trả JSON, kiểm tra phương thức và kiểm tra session đã có code.
- `api/health.php` chạy được và không cần database.
- Các API nghiệp vụ trả HTTP 501 (chưa triển khai). Chưa có đăng nhập, mua vé hay nạp tiền hoạt động.
- `sql/schema.sql` chỉ là chỗ để thêm script; chưa có câu lệnh tạo bảng.

## Hoàn thiện từng chức năng
Bắt đầu: kết nối DB → danh sách tuyến → đăng ký/đăng nhập → các chức năng vé và ví.
API nhận JSON bằng `read_json()`; kết quả trả bằng `respond()`.
GET dùng query string; POST gửi header Content-Type: application/json.
Dùng session cho đăng nhập; frontend và backend nên chạy cùng nguồn (scheme/host/port).
Không gửi password_hash về frontend. Giá và user_id phải lấy ở server.
Mua vé: kiểm tra số dư, trừ ví, tạo vé, ghi giao dịch trong cùng transaction.
Nạp tiền chỉ giả lập trong bài tập; chưa tích hợp thanh toán thật.
Trước khi triển khai POST dùng session, bổ sung kiểm tra CSRF.
Không đưa mật khẩu database thật lên Git; cấu hình root/mật khẩu rỗng chỉ dành cho máy học tập.
