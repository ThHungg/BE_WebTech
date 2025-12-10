use webtech


use webtech;
-- Tắt kiểm tra khóa ngoại để tạo bảng không bị lỗi thứ tự
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng nếu đã tồn tại để tránh lỗi
DROP TABLE IF EXISTS Content_Block, News, Img_Review, Review, Order_Detail, `Order`, Voucher_Brand_Link, Voucher_Constraint, Voucher_Detail, Voucher, Payment, Cart_Item, Cart, Product_Attribute_Value, Cate_Attribute_Link, Attribute, Unit, Product_Variant, Img_Product, Product, Cate_Brand_Link, Category, Brand, Address, User, Role;

---------------------------------------------------
-- I. USER & CORE (1 - 3)
---------------------------------------------------

-- 1. Role
CREATE TABLE Role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. User
CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(id)
);

-- 3. Address
CREATE TABLE Address (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    street_address VARCHAR(255),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES User(id)
);

---------------------------------------------------
-- II. PRODUCT & ATTRIBUTE (4 - 13)
---------------------------------------------------

-- 4. Brand
CREATE TABLE Brand (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo VARCHAR(255)
);

-- 5. Category (Sử dụng parent_id cho phân cấp)
CREATE TABLE Category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (parent_id) REFERENCES Category(id)
);

ALTER TABLE Category
ADD COLUMN icon_emoji VARCHAR(10)
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci
AFTER slug;


select * from Category;


-- 6. Cate_Brand_Link (Bảng mới: Liên kết N:M giữa Category và Brand)
CREATE TABLE Cate_Brand_Link (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES Brand(id),
    FOREIGN KEY (category_id) REFERENCES Category(id),
    UNIQUE KEY unique_cate_brand (brand_id, category_id)
);

-- 7. Product (ĐÃ SỬA ĐỔI: Dùng cate_brand_link_id thay cho brand_id và category_id trực tiếp)

CREATE TABLE Product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NOT NULL,              -- FK MỚI/QUAY LẠI
    category_id INT NOT NULL,           -- FK MỚI/QUAY LẠI
    name VARCHAR(255) NOT NULL,
    avg_rating DECIMAL(2, 1) DEFAULT 0.0,
    total_sold INT DEFAULT 0,
    total_stock INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Khóa Ngoại MỚI
    FOREIGN KEY (brand_id) REFERENCES Brand(id),
    FOREIGN KEY (category_id) REFERENCES Category(id)
    -- Đã loại bỏ FOREIGN KEY (cate_brand_link_id)
);

CREATE TABLE Product_Description_Block (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    sort_order INT NOT NULL,           -- Thứ tự của khối nội dung
    content TEXT NULL,                 -- Nội dung văn bản của khối
    img_content VARCHAR(255) NULL,     -- URL hình ảnh của khối
    caption_img VARCHAR(255) NULL,     -- Chú thích cho hình ảnh (nếu có)
    FOREIGN KEY (product_id) REFERENCES Product(id),
    -- Đảm bảo thứ tự là duy nhất cho mỗi sản phẩm
    UNIQUE KEY unique_product_sort (product_id, sort_order)
);

-- 8. Img_Product
CREATE TABLE Img_Product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(id)
);

-- 9. Product_Variant
CREATE TABLE Product_Variant (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    img_product_id INT NULL,
    name VARCHAR(255) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    sold INT NOT NULL DEFAULT 0,
    original_price DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (img_product_id) REFERENCES Img_Product(id)
);

-- 10. Unit (Bảng mới)
CREATE TABLE Unit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(50) NOT NULL UNIQUE
);

-- 11. Attribute (Đã sửa đổi: FK unit_id tham chiếu Unit)
CREATE TABLE Attribute (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    unit_id INT NULL,
    FOREIGN KEY (unit_id) REFERENCES Unit(id)
);

-- 12. Cate_Attribute_Link
CREATE TABLE Cate_Attribute_Link (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attribute_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (attribute_id) REFERENCES Attribute(id),
    FOREIGN KEY (category_id) REFERENCES Category(id)
);

-- 13. Product_Attribute_Value
CREATE TABLE Product_Attribute_Value (
    product_id INT NOT NULL,
    attribute_id INT NOT NULL,
    value TEXT,
    PRIMARY KEY (product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (attribute_id) REFERENCES Attribute(id)
);

---------------------------------------------------
-- III. CART & PAYMENT (14 - 16)
---------------------------------------------------

-- 14. Cart
CREATE TABLE Cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- 15. Cart_Item
CREATE TABLE Cart_Item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_variant_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    is_selected BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (cart_id) REFERENCES Cart(id),
    FOREIGN KEY (product_variant_id) REFERENCES Product_Variant(id),
    UNIQUE KEY unique_cart_item (cart_id, product_variant_id)
);

-- 16. Payment
CREATE TABLE Payment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- IV. VOUCHER (17 - 20)
---------------------------------------------------

-- 17. Voucher
CREATE TABLE Voucher (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 18. Voucher_Detail (Mã code cụ thể)
CREATE TABLE Voucher_Detail (
    code VARCHAR(50) PRIMARY KEY,
    voucher_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (voucher_id) REFERENCES Voucher(id)
);

-- 19. Voucher_Constraint (Ràng buộc tổng quát: min_order_amount, max_discount_amount)
CREATE TABLE Voucher_Constraint (
    voucher_id INT PRIMARY KEY,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2) NULL,
    FOREIGN KEY (voucher_id) REFERENCES Voucher(id)
);

-- 20. Voucher_Brand_Link (Ràng buộc theo Thương hiệu)
CREATE TABLE Voucher_Brand_Link (
    voucher_id INT NOT NULL,
    brand_id INT NOT NULL,
    PRIMARY KEY (voucher_id, brand_id),
    FOREIGN KEY (voucher_id) REFERENCES Voucher(id),
    FOREIGN KEY (brand_id) REFERENCES Brand(id)
);

---------------------------------------------------
-- V. ORDER, REVIEW & NEWS (21 - 26)
---------------------------------------------------

-- 21. Order
CREATE TABLE `Order` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    voucher_detail_id VARCHAR(50) NULL,
    payment_id INT NULL,
    order_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    shipping_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (voucher_detail_id) REFERENCES Voucher_Detail(code),
    FOREIGN KEY (payment_id) REFERENCES Payment(id)
);

-- 22. Order_Detail
CREATE TABLE Order_Detail (
    order_id INT NOT NULL,
    product_variant_id INT NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_variant_id),
    FOREIGN KEY (order_id) REFERENCES `Order`(id),
    FOREIGN KEY (product_variant_id) REFERENCES Product_Variant(id)
);

-- 23. Review
CREATE TABLE Review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT,
    rate TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- 24. Img_Review
CREATE TABLE Img_Review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    image VARCHAR(255) NOT NULL,
    FOREIGN KEY (review_id) REFERENCES Review(id)
);

-- 25. News
CREATE TABLE News (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    thumbnail VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES User(id)
);

-- 26. Content_Block (Liên kết với News)
CREATE TABLE Content_Block (
    id INT PRIMARY KEY AUTO_INCREMENT,
    news_id INT NOT NULL,
    sort_order INT NOT NULL,
    content TEXT,
    img_content VARCHAR(255),
    caption_img VARCHAR(255),
    FOREIGN KEY (news_id) REFERENCES News(id)
);

-- Bật lại kiểm tra khóa ngoại sau khi tạo xong
SET FOREIGN_KEY_CHECKS = 1;