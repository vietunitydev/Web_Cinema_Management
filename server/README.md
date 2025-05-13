# Cinema Management System API

Backend REST API cho hệ thống quản lý rạp chiếu phim, đặt vé online sử dụng Node.js, Express và MongoDB.

## Tính năng

- Xác thực và phân quyền: đăng ký, đăng nhập, vai trò người dùng (khách hàng, quản lý rạp, admin)
- Quản lý phim: thêm, sửa, xóa phim, đánh giá phim
- Quản lý rạp: thêm, sửa, xóa rạp và phòng chiếu
- Quản lý lịch chiếu: tạo và quản lý lịch chiếu phim
- Đặt vé: chọn ghế và thanh toán
- Quản lý khuyến mãi: tạo và áp dụng mã giảm giá
- Thống kê: doanh thu, vé bán, phim phổ biến

## Công nghệ sử dụng

- **Node.js** - Môi trường runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Cơ sở dữ liệu NoSQL
- **Mongoose** - ODM (Object Document Mapper) cho MongoDB
- **JWT** - Xác thực bằng JSON Web Token
- **Bcrypt** - Hash mật khẩu
- **Cloudinary** - Lưu trữ hình ảnh
- **Express Validator** - Xác thực input

## Cài đặt và chạy

### Điều kiện tiên quyết

- Node.js (>= 14.x)
- MongoDB
- Tài khoản Cloudinary (cho lưu trữ hình ảnh)

### Bước cài đặt

1. Clone repository
```bash
git clone 
cd 
```

2. Cài đặt dependencies
```bash
npm install
```

3. Cấu hình biến môi trường
```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin cần thiết
```

4. Chạy ứng dụng
```bash
# Chế độ development
npm run dev

# Chế độ production
npm run prod
```

## Tài liệu API

### Xác thực

```
POST /api/auth/register - Đăng ký tài khoản mới
POST /api/auth/login - Đăng nhập
GET /api/auth/logout - Đăng xuất
GET /api/auth/me - Lấy thông tin người dùng hiện tại
PATCH /api/auth/updateme - Cập nhật thông tin cá nhân
PATCH /api/auth/updatepassword - Cập nhật mật khẩu
```

### Người dùng

```
GET /api/users - Lấy tất cả người dùng (Admin)
POST /api/users - Tạo người dùng mới (Admin)
GET /api/users/:id - Lấy thông tin người dùng (Admin)
PATCH /api/users/:id - Cập nhật người dùng (Admin)
DELETE /api/users/:id - Xóa người dùng (Admin)
PATCH /api/users/:id/deactivate - Vô hiệu hóa tài khoản (Admin)
PATCH /api/users/:id/activate - Kích hoạt tài khoản (Admin)
GET /api/users/mybookings - Lấy đơn đặt vé của người dùng hiện tại
GET /api/users/:id/bookings - Lấy đơn đặt vé của người dùng (Admin)
```

### Phim

```
GET /api/movies - Lấy tất cả phim
GET /api/movies/now-playing - Lấy phim đang chiếu
GET /api/movies/coming-soon - Lấy phim sắp chiếu
GET /api/movies/top-rated - Lấy phim được đánh giá cao
GET /api/movies/search - Tìm kiếm phim
GET /api/movies/:id - Lấy thông tin chi tiết phim
POST /api/movies - Thêm phim mới (Admin, Manager)
PATCH /api/movies/:id - Cập nhật phim (Admin, Manager)
DELETE /api/movies/:id - Xóa phim (Admin, Manager)
GET /api/movies/:movieId/showtimes - Lấy lịch chiếu của phim
GET /api/movies/:movieId/cinemas/:cinemaId/showtimes - Lấy lịch chiếu của phim tại một rạp
```

### Rạp chiếu phim

```
GET /api/cinemas - Lấy tất cả rạp
GET /api/cinemas/city/:city - Lấy rạp theo thành phố
GET /api/cinemas/:id - Lấy thông tin chi tiết rạp
GET /api/cinemas/:id/halls - Lấy tất cả phòng chiếu của rạp
GET /api/cinemas/:id/halls/:hallId - Lấy thông tin chi tiết phòng chiếu
POST /api/cinemas - Thêm rạp mới (Admin, Manager)
PATCH /api/cinemas/:id - Cập nhật rạp (Admin, Manager)
DELETE /api/cinemas/:id - Xóa rạp (Admin, Manager)
POST /api/cinemas/:id/halls - Thêm phòng chiếu mới (Admin, Manager)
PATCH /api/cinemas/:id/halls/:hallId - Cập nhật phòng chiếu (Admin, Manager)
DELETE /api/cinemas/:id/halls/:hallId - Xóa phòng chiếu (Admin, Manager)
GET /api/cinemas/:cinemaId/showtimes - Lấy lịch chiếu tại rạp
```

### Lịch chiếu

```
GET /api/showtimes - Lấy tất cả lịch chiếu
GET /api/showtimes/date/:date - Lấy lịch chiếu theo ngày
GET /api/showtimes/:id - Lấy thông tin chi tiết lịch chiếu
GET /api/showtimes/:id/seats - Kiểm tra trạng thái ghế
POST /api/showtimes - Tạo lịch chiếu mới (Admin, Manager)
PATCH /api/showtimes/:id - Cập nhật lịch chiếu (Admin, Manager)
DELETE /api/showtimes/:id - Xóa lịch chiếu (Admin, Manager)
PATCH /api/showtimes/:id/cancel - Hủy lịch chiếu (Admin, Manager)
```

### Đặt vé

```
POST /api/bookings - Đặt vé mới
GET /api/bookings - Lấy tất cả đơn đặt vé (Admin, Manager)
GET /api/bookings/:id - Lấy thông tin chi tiết đơn đặt vé
PATCH /api/bookings/:id/status - Cập nhật trạng thái đơn đặt vé (Admin, Manager)
GET /api/bookings/verify/:bookingCode - Kiểm tra mã đặt vé (Admin, Manager)
GET /api/bookings/stats/daily - Thống kê doanh thu theo ngày (Admin, Manager)
GET /api/bookings/stats/movies - Thống kê doanh thu theo phim (Admin, Manager)
GET /api/bookings/stats/cinemas - Thống kê doanh thu theo rạp (Admin, Manager)
```

### Đánh giá

```
GET /api/reviews - Lấy tất cả đánh giá
GET /api/reviews/:id - Lấy thông tin chi tiết đánh giá
POST /api/reviews - Tạo đánh giá mới
GET /api/reviews/myreviews - Lấy đánh giá của bản thân
PATCH /api/reviews/:id - Cập nhật đánh giá
DELETE /api/reviews/:id - Xóa đánh giá
GET /api/reviews/pending - Lấy đánh giá đang chờ duyệt (Admin, Manager)
PATCH /api/reviews/:id/approve - Duyệt đánh giá (Admin, Manager)
PATCH /api/reviews/:id/reject - Từ chối đánh giá (Admin, Manager)
```

### Khuyến mãi

```
GET /api/promotions - Lấy tất cả khuyến mãi
GET /api/promotions/:id - Lấy thông tin chi tiết khuyến mãi
POST /api/promotions/check-coupon - Kiểm tra mã khuyến mãi
GET /api/promotions/coupon/:couponCode - Lấy khuyến mãi theo mã
POST /api/promotions - Tạo khuyến mãi mới (Admin, Manager)
PATCH /api/promotions/:id - Cập nhật khuyến mãi (Admin, Manager)
DELETE /api/promotions/:id - Xóa khuyến mãi (Admin, Manager)
PATCH /api/promotions/update-status - Cập nhật trạng thái tất cả khuyến mãi (Admin, System)
```

## Cấu trúc dự án

```
cinema-management-api/
├── src/
│   ├── config/
│   │   ├── db.js                # Cấu hình kết nối MongoDB
│   │   ├── cloudinary.js        # Cấu hình Cloudinary
│   │   └── index.js             # Các cấu hình chung
│   ├── controllers/
│   │   ├── authController.js    # Xử lý đăng nhập, đăng ký
│   │   ├── movieController.js   # Xử lý quản lý phim
│   │   ├── cinemaController.js  # Xử lý quản lý rạp
│   │   ├── showtimeController.js # Xử lý lịch chiếu
│   │   ├── bookingController.js # Xử lý đặt vé
│   │   ├── userController.js    # Xử lý người dùng
│   │   ├── reviewController.js  # Xử lý đánh giá
│   │   └── promotionController.js # Xử lý khuyến mãi
│   ├── middlewares/
│   │   ├── auth.js              # Middleware xác thực JWT
│   │   ├── upload.js            # Middleware upload ảnh
│   │   ├── validate.js          # Middleware validate dữ liệu
│   │   └── errorHandler.js      # Middleware xử lý lỗi
│   ├── models/
│   │   ├── User.js              # Schema người dùng
│   │   ├── Movie.js             # Schema phim
│   │   ├── Cinema.js            # Schema rạp chiếu phim
│   │   ├── Showtime.js          # Schema lịch chiếu
│   │   ├── Booking.js           # Schema đặt vé
│   │   ├── Review.js            # Schema đánh giá
│   │   └── Promotion.js         # Schema khuyến mãi
│   ├── routes/
│   │   ├── authRoutes.js        # Route xác thực
│   │   ├── movieRoutes.js       # Route quản lý phim
│   │   ├── cinemaRoutes.js      # Route quản lý rạp
│   │   ├── showtimeRoutes.js    # Route lịch chiếu
│   │   ├── bookingRoutes.js     # Route đặt vé
│   │   ├── userRoutes.js        # Route người dùng
│   │   ├── reviewRoutes.js      # Route đánh giá
│   │   └── promotionRoutes.js   # Route khuyến mãi
│   ├── utils/
│   │   ├── generateToken.js     # Tạo JWT token
│   │   ├── catchAsync.js        # Xử lý async/await
│   │   └── apiFeatures.js       # Các chức năng API (sort, filter...)
│   ├── app.js                   # Cấu hình Express app
│   └── server.js                # Khởi tạo server
├── package.json
├── .env                         # Biến môi trường
└── README.md
```

## Giấy phép

[MIT](LICENSE)

## Liên hệ

Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ qua email: [your-email@example.com](mailto:your-email@example.com)