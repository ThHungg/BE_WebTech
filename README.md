# BE_WebTech - Backend API

Một backend Node.js/Express sử dụng Sequelize ORM để quản lý cơ sở dữ liệu MySQL. API này cung cấp các chức năng cho hệ thống quản lý sản phẩm, giỏ hàng, đơn hàng, thanh toán và nhiều hơn nữa.

## 📋 Yêu cầu hệ thống

- **Node.js**: phiên bản 14.x hoặc cao hơn
- **npm**: phiên bản 6.x hoặc cao hơn
- **MySQL**: phiên bản 5.7 hoặc cao hơn

## 🚀 Cài đặt

### 1. Clone repository hoặc điều hướng đến thư mục dự án

```bash
cd BE_WebTech
```

### 2. Cài đặt các package phụ thuộc

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc của dự án với nội dung sau:

```env
# Cài đặt server
PORT=3000

# Cài đặt database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=webtech_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Secret (dùng cho xác thực)
JWT_SECRET=your_secret_key_here
```

**Lưu ý:**
- Thay `your_password` bằng mật khẩu MySQL của bạn
- Thay `webtech_db` bằng tên cơ sở dữ liệu của bạn (hoặc tạo cơ sở dữ liệu mới)
- Thay `your_secret_key_here` bằng một chuỗi bảo mật cho JWT

### 4. Thiết lập cơ sở dữ liệu

#### 4.1 Tạo cơ sở dữ liệu MySQL

```sql
CREATE DATABASE webtech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 4.2 Import file cơ sở dữ liệu

Dùng MySQL Workbench hoặc command line:

```bash
mysql -u root -p webtech_db < WebTech.sql
```

Hoặc nếu bạn có mật khẩu:

```bash
mysql -u root -p"your_password" webtech_db < WebTech.sql
```

## 🏃 Chạy ứng dụng

### Chế độ phát triển (Development)

```bash
npm start
```

Lệnh này sẽ chạy server với `nodemon`, tự động khởi động lại khi có thay đổi file.

Server sẽ chạy trên: `http://localhost:3000`

### Kiểm tra kết nối

Khi server khởi động thành công, bạn sẽ thấy:

```
Kết nối database thành công!
Server is running on port 3000
```

## 📁 Cấu trúc dự án

```
BE_WebTech/
├── src/
│   ├── index.js                 # Entry point của ứng dụng
│   ├── config/
│   │   └── db.js               # Cấu hình kết nối database
│   ├── controllers/            # Xử lý business logic
│   ├── models/                 # Định nghĩa Sequelize models
│   ├── routes/                 # Định nghĩa API routes
│   ├── services/               # Business logic services
│   ├── middleware/             # Custom middleware (auth, upload)
│   └── utils/                  # Các hàm tiện ích
├── public/                     # Thư mục public files (hình ảnh, v.v.)
├── package.json               # Dependencies và scripts
├── WebTech.sql               # File cơ sở dữ liệu
└── .env                      # Biến môi trường (tạo bằng tay)
```

## 🔧 Các API chính

Các routes API được tổ chức bởi chức năng:

- `/api/users` - Quản lý người dùng
- `/api/products` - Quản lý sản phẩm
- `/api/categories` - Quản lý danh mục
- `/api/brands` - Quản lý thương hiệu
- `/api/cart` - Giỏ hàng
- `/api/orders` - Đơn hàng
- `/api/payments` - Thanh toán
- `/api/reviews` - Đánh giá sản phẩm
- `/api/vouchers` - Khuyến mãi
- `/api/attributes` - Thuộc tính sản phẩm
- `/api/units` - Đơn vị tính

## 🔐 CORS Configuration

Ứng dụng cho phép CORS từ:
- `http://localhost:3000`
- `http://localhost:3002`

Để thêm domain khác, sửa file `src/index.js` phần CORS configuration.

## 📦 Dependencies chính

- **express** - Web framework
- **sequelize** - ORM cho MySQL
- **mysql2** - MySQL client
- **bcryptjs** - Mã hóa mật khẩu
- **jsonwebtoken** - JWT authentication
- **multer** - Upload file
- **dotenv** - Quản lý biến môi trường
- **cors** - Cross-Origin Resource Sharing
- **cookie-parser** - Xử lý cookies

## 🐛 Troubleshooting

### Lỗi kết nối database

**Vấn đề**: "Kết nối database thất bại"

**Giải pháp**:
1. Kiểm tra MySQL service đang chạy
2. Kiểm tra biến môi trường `.env` chính xác
3. Kiểm tra tên, user, password database
4. Kiểm tra quyền truy cập MySQL user

### Port đang bị sử dụng

**Vấn đề**: "Error: listen EADDRINUSE :::3000"

**Giải pháp**:
1. Thay đổi PORT trong `.env`
2. Hoặc tìm process sử dụng port 3000 và kill nó

### Lỗi module không tìm thấy

**Vấn đề**: "Cannot find module 'express'"

**Giải pháp**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Phát triển thêm

Khi phát triển thêm feature:

1. Tạo model mới trong `src/models/`
2. Tạo service trong `src/services/`
3. Tạo controller trong `src/controllers/`
4. Tạo route trong `src/routes/`
5. Import route vào `src/routes/index.js`

## 📖 Khác

- **Xác thực**: Sử dụng JWT token trong header `Authorization: Bearer <token>`
- **Upload ảnh**: Hình ảnh được lưu trong thư mục `public/Img/`
- **Timezone**: Sử dụng `moment-timezone` cho xử lý thời gian

## 🎯 Tiếp theo

- Kết nối Frontend (WebTech) với backend này
- Chạy Frontend trên port 3002 để tránh xung đột

---

**Tác giả**: WebTech Development Team  
**Phiên bản**: 1.0.0
