CREATE DATABASE IF NOT EXISTS webtech;
USE webtech;

SET FOREIGN_KEY_CHECKS = 0;

-- I. USER & CORE
CREATE TABLE Role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(id)
);

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

-- II. PRODUCT & ATTRIBUTE
CREATE TABLE Brand (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon_emoji VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    FOREIGN KEY (parent_id) REFERENCES Category(id)
);

CREATE TABLE Product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    avg_rating DECIMAL(2, 1) DEFAULT 0.0,
    total_sold INT DEFAULT 0,
    total_stock INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (brand_id) REFERENCES Brand(id),
    FOREIGN KEY (category_id) REFERENCES Category(id)
);

CREATE TABLE Product_Description_Block (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    sort_order INT NOT NULL,
    content TEXT NULL,
    img_content VARCHAR(255) NULL,
    caption_img VARCHAR(255) NULL,
    FOREIGN KEY (product_id) REFERENCES Product(id),
    UNIQUE KEY unique_product_sort (product_id, sort_order)
);

CREATE TABLE Img_Product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(id)
);

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

CREATE TABLE Unit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Attribute (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    unit_id INT NULL,
    FOREIGN KEY (unit_id) REFERENCES Unit(id)
);

CREATE TABLE Product_Attribute_Value (
    product_id INT NOT NULL,
    attribute_id INT NOT NULL,
    value TEXT,
    PRIMARY KEY (product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (attribute_id) REFERENCES Attribute(id)
);

-- III. CART & PAYMENT
CREATE TABLE Cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES User(id)
);

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

CREATE TABLE Payment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

-- IV. VOUCHER
CREATE TABLE Voucher (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discount_type ENUM('fixed', 'percentage') NOT NULL, 
    discount_value DECIMAL(10, 2) NOT NULL,
    usage_limit INT NOT NULL DEFAULT 0,
    used_count INT NOT NULL DEFAULT 0,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Voucher_Detail (
    code VARCHAR(50) PRIMARY KEY,
    voucher_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (voucher_id) REFERENCES Voucher(id) ON DELETE CASCADE
);

CREATE TABLE Voucher_Constraint (
    voucher_id INT PRIMARY KEY,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2) NULL,
    FOREIGN KEY (voucher_id) REFERENCES Voucher(id) ON DELETE CASCADE
);

-- V. ORDER & REVIEW
CREATE TABLE `Order` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(20) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    voucher_detail_id VARCHAR(50) NULL,
    payment_id INT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    note TEXT NULL,
    order_status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (voucher_detail_id) REFERENCES Voucher_Detail(code),
    FOREIGN KEY (payment_id) REFERENCES Payment(id)
);

CREATE TABLE Order_Detail (
    order_id INT NOT NULL,
    product_variant_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_variant_id),
    FOREIGN KEY (order_id) REFERENCES `Order`(id),
    FOREIGN KEY (product_variant_id) REFERENCES Product_Variant(id)
);

CREATE TABLE Review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT,
    rate TINYINT NOT NULL CHECK (rate >= 1 AND rate <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Product(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;