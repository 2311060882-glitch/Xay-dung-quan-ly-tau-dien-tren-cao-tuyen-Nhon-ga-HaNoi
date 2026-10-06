
### 🌲 SƠ ĐỒ CÂY CÁC LUỒNG CHỨC NĂNG (MINDMAP STRUCTURE)

HỆ THỐNG METRO APP
├── 1. MÀN HÌNH TRANG CHỦ (HOME)
│   ├── 1.1. Quản lý Ví điện tử / Liên kết ngân hàng
│   ├── 1.2. Mua vé tàu (Vé lượt / Vé tháng)
│   ├── 1.3. Đăng ký vé ưu tiên
│   ├── 1.4. Định danh hộ
│   └── 1.5. Tiện ích mở rộng (Thuê xe TNGo / Liên thông Be-Metro)
│
├── 2. NÚT QR TRUNG TÂM (CORE - NÚT NỔI GIỮA BOTTOM BAR)
│   ├── 2.1. Quét / Hiển thị QR vé nhanh
│   └── 2.2. Xem chi tiết vé & chuyến đi đang kích hoạt
│
├── 3. MÀN HÌNH VÉ CỦA TÔI
│   ├── 3.1. Phân loại vé (Vé của tôi / Vé mua hộ)
│   ├── 3.2. Xem chi tiết thẻ vé & Mã QR
│   ├── 3.3. Xem Lịch sử mua & sử dụng vé
│   └── 3.4. Nút "Cập nhật danh sách vé" (Refresh)
│
├── 4. MÀN HÌNH TÌM GA TÀU
│   ├── 4.1. Chọn Tuyến tàu (Cát Linh - Hà Đông / Nhổn - Ga HN)
│   └── 4.2. Hiển thị sơ đồ tuyến ga (Timeline dạng dọc)
│
└── 5. MÀN HÌNH CÁ NHÂN (PROFILE KHÁCH HÀNG)
    ├── 5.1. Thông tin cá nhân (Avatar, Họ tên, SĐT)
    ├── 5.2. Phương thức thanh toán (Ví thanh toán / Liên kết ngân hàng)
    ├── 5.3. Quản lý Đăng ký vé ưu tiên (Theo dõi các đơn đăng ký)
    ├── 5.4. Định danh hộ (Quản lý thông tin người thân đi cùng)
    ├── 5.5. Cài đặt bảo mật & Trợ giúp (Đổi mật khẩu / Hỗ trợ)
    └── 5.6. Gỡ định danh / Đăng xuất (Gỡ tài khoản trên thiết bị)
### 📝 CHI TIẾT CÁC BRANCH TRONG SƠ ĐỒ CÂY

#### 1. Màn hình Trang chủ (Home)


 **1.1. Quản lý Ví điện tử:** Hiển thị số dư/trạng thái "Liên kết ngân hàng". Cho phép nạp tiền hoặc liên kết thẻ ngân hàng.


 **1.2. Mua vé tàu:**

 *Mua vé lượt:* Chọn ga đi -> Chọn ga đến -> Thanh toán -> Sinh vé.
 *Mua vé tháng:* Chọn tuyến (VD: Nhổn - Ga Hà Nội) -> Chọn loại vé (Thường/Ưu đãi) -> Thanh toán -> Kích hoạt hạn dùng (VD: 30 ngày).




 **1.3. Đăng ký vé ưu tiên:** Tải lên giấy tờ chứng minh (Thẻ sinh viên, CCCD người cao tuổi...) -> Gửi yêu cầu chờ Admin duyệt.


 **1.4. Định danh hộ:** Nhập thông tin người thân (con cái, cha mẹ) để đăng ký mua vé tháng/ưu đãi hộ.


 **1.5. Tiện ích liên thông:** UI tích hợp Thuê xe đạp TNGo hoặc Đặt chuyến liên thông Be – Metro – Be (Có thể làm giao diện tĩnh/mockup).



#### 2. Nút QR Trung tâm (Nút tròn nổi ở giữa Navigation)



 **2.1. Hiển thị QR vé nhanh:**
 Bấm nút QR -> Hệ thống tự động kiểm tra vé đang `ACTIVE` gần nhất của user.


* Nếu có vé hợp lệ -> Render mã QR hình vuông kèm hiệu ứng làm sáng màn hình để đưa qua cổng kiểm soát ga.




 **2.2. Xem chi tiết vé & Chuyến:** Hiển thị ngay bên dưới mã QR: Mã tài khoản/vé (VD: TK7658364), Họ tên người đi, Tuyến áp dụng, Loại vé, Thời hạn còn lại (VD: Còn 27 ngày).



#### 3. Màn hình "Vé của tôi"



 **3.1. Phân loại vé (Sub-tabs):**

 *Tab 1: Vé của tôi:* Hiển thị danh sách vé do chính tài khoản này sở hữu.


 *Tab 2: Vé mua hộ:* Hiển thị các vé đã mua cho người thân thông qua tính năng Định danh hộ.




 **3.2. Hiển thị Card vé:** Mỗi card chứa Avatar, Họ tên, Tên tuyến (Tuyến 3.1 Nhổn - Ga Hà Nội), Loại vé (01 tháng / Vé ưu đãi), Ngày hết hạn (01/11/2026), Mã vé (TK7658364) và nút icon QR.


 **3.3. Xem Lịch sử:** Bấm "Lịch sử" góc trên phải để xem danh sách vé đã hết hạn hoặc các giao dịch mua vé cũ.


 **3.4. Cập nhật danh sách vé:** Nút màu xanh lá dưới cùng dùng để trigger gọi lại API làm mới dữ liệu vé từ server.



#### 4. Màn hình "Tìm ga tàu"



 **4.1. Chọn Tuyến tàu:** Dropdown chọn giữa các tuyến hiện có (Tuyến 2A Cát Linh - Hà Đông, Tuyến 3.1 Nhổn - Ga Hà Nội).


 **4.2. Danh sách nhà ga:** Dựng giao diện Timeline nối dọc danh sách tên ga (Cát Linh -> La Thành -> Thái Hà -> Láng -> Thượng Đình...).

---

### 📝 CHI TIẾT ĐIỀU CHỈNH MỤC 5 (DÀNH CHO KHÁCH HÀNG)

#### 5. Màn hình "Cá nhân" (Profile)



 **5.1. Thông tin cá nhân:** Hiển thị Avatar, Họ tên (*TRỊNH MINH HOÀNG*), Số điện thoại ẩn giữa (*098*****449*).


 **5.2. Phương thức thanh toán:** Hiển thị số dư Ví thanh toán hiện tại, quản lý trạng thái *"Chưa liên kết ngân hàng"* hoặc *"Đã liên kết"*.


 **5.3. Quản lý Đăng ký vé ưu tiên:** Nơi người dùng theo dõi và quản lý các đơn đã đăng ký mua vé ưu đãi (Học sinh/Sinh viên/Người cao tuổi).


 **5.4. Định danh hộ:** Hỗ trợ định danh cho người khác (thêm/sửa/xóa thông tin người thân để phục vụ tính năng mua vé hộ).


 **5.5. Cài đặt bảo mật & Trợ giúp:** Đổi mật khẩu tài khoản, bảo vệ an toàn thông tin và liên hệ kênh hỗ trợ khách hàng.


 **5.6. Gỡ định danh / Đăng xuất:** Nút đỏ dưới cùng dùng để gỡ định danh tài khoản khỏi thiết bị hiện tại (Đăng xuất).
 