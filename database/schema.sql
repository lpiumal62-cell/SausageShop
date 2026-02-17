-- Generated schema for SausageShop (MySQL)
-- Adjust engine/charset as needed.

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Table `status`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `status` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_status_value` (`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `role` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45),
  `last_name` VARCHAR(45),
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `verification_code` VARCHAR(45),
  `status_id` INT,
  `role_id` INT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_status` (`status_id`),
  KEY `idx_users_role` (`role_id`),
  CONSTRAINT `fk_users_status` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `city`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `city` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `address`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `address` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `line_one` VARCHAR(45),
  `line_two` VARCHAR(45),
  `postal_code` VARCHAR(10),
  `city_id` INT,
  `users_id` INT NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `mobile` VARCHAR(20),
  PRIMARY KEY (`id`),
  KEY `idx_address_city` (`city_id`),
  KEY `idx_address_user` (`users_id`),
  CONSTRAINT `fk_address_city` FOREIGN KEY (`city_id`) REFERENCES `city`(`id`),
  CONSTRAINT `fk_address_user` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `settings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `setting_type` VARCHAR(50) NOT NULL,
  `updated_at` DATETIME,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `newsletter_subscribers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1),
  `subscribed_at` DATETIME,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_newsletter_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `contact_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1),
  `created_at` DATETIME,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `coupons`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `discount_type` VARCHAR(20) NOT NULL,
  `discount_value` DOUBLE NOT NULL,
  `usage_limit` INT,
  `used_count` INT,
  `valid_from` DATETIME,
  `valid_until` DATETIME,
  `created_at` DATETIME,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupons_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `discount`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `discount` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `coupon_code` VARCHAR(45) NOT NULL,
  `value` DOUBLE NOT NULL,
  `started_at` DATETIME,
  `expired_at` DATETIME,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_discount_coupon_code` (`coupon_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `delivery_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `price` DOUBLE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `category_image`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `category_image` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `image` VARCHAR(500) NOT NULL,
  `created_at` DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_category_image_category` (`category_id`),
  CONSTRAINT `fk_category_image_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `seller`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `seller` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_name` VARCHAR(200),
  `company_mobile` VARCHAR(20),
  `company_email` VARCHAR(100),
  `status_id` INT,
  `users_id` INT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_seller_status` (`status_id`),
  KEY `idx_seller_user` (`users_id`),
  CONSTRAINT `fk_seller_status` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`),
  CONSTRAINT `fk_seller_user` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `product` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `short_description` VARCHAR(500),
  `long_description` TEXT,
  `categories_id` INT NOT NULL,
  `price` DOUBLE NOT NULL,
  `sale_price` DOUBLE,
  `stock_qty` INT NOT NULL,
  `sku` VARCHAR(100),
  `calories` DOUBLE,
  `protein` DOUBLE,
  `fat` DOUBLE,
  `carbs` DOUBLE,
  `ingredients` TEXT,
  `seller_id` INT NOT NULL,
  `stock_id` INT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_sku` (`sku`),
  KEY `idx_product_category` (`categories_id`),
  KEY `idx_product_seller` (`seller_id`),
  KEY `idx_product_stock` (`stock_id`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`categories_id`) REFERENCES `categories`(`id`),
  CONSTRAINT `fk_product_seller` FOREIGN KEY (`seller_id`) REFERENCES `seller`(`id`)
  -- optional FK to stock to avoid circular constraint:
  -- , CONSTRAINT `fk_product_stock` FOREIGN KEY (`stock_id`) REFERENCES `stock`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `product_image`
-- (Element collection for Product.images)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_image` (
  `product_id` INT NOT NULL,
  `image` VARCHAR(255),
  KEY `idx_product_image_product` (`product_id`),
  CONSTRAINT `fk_product_image_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `stock`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `price` DOUBLE NOT NULL,
  `qty` INT NOT NULL,
  `discount_id` INT,
  `status_id` INT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_stock_product` (`product_id`),
  KEY `idx_stock_discount` (`discount_id`),
  KEY `idx_stock_status` (`status_id`),
  CONSTRAINT `fk_stock_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`),
  CONSTRAINT `fk_stock_discount` FOREIGN KEY (`discount_id`) REFERENCES `discount`(`id`),
  CONSTRAINT `fk_stock_status` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `cart`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `qty` INT NOT NULL,
  `users_id` INT,
  `stock_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cart_user` (`users_id`),
  KEY `idx_cart_stock` (`stock_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`),
  CONSTRAINT `fk_cart_stock` FOREIGN KEY (`stock_id`) REFERENCES `stock`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `delivery_types_id` INT,
  `status_id` INT,
  `users_id` INT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_orders_delivery_type` (`delivery_types_id`),
  KEY `idx_orders_status` (`status_id`),
  KEY `idx_orders_user` (`users_id`),
  CONSTRAINT `fk_orders_delivery_type` FOREIGN KEY (`delivery_types_id`) REFERENCES `delivery_types`(`id`),
  CONSTRAINT `fk_orders_status` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `order_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `qty` INT NOT NULL,
  `rating` INT,
  `stock_id` INT NOT NULL,
  `orders_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_stock` (`stock_id`),
  KEY `idx_order_items_order` (`orders_id`),
  CONSTRAINT `fk_order_items_stock` FOREIGN KEY (`stock_id`) REFERENCES `stock`(`id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`orders_id`) REFERENCES `orders`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `product_reviews`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `users_id` INT,
  `rating` INT NOT NULL,
  `review_text` TEXT,
  `verified_purchase` TINYINT(1),
  `approved` TINYINT(1),
  `created_at` DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_product_reviews_product` (`product_id`),
  KEY `idx_product_reviews_user` (`users_id`),
  CONSTRAINT `fk_product_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`),
  CONSTRAINT `fk_product_reviews_user` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `recently_viewed`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `recently_viewed` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `users_id` INT,
  `product_id` INT NOT NULL,
  `viewed_at` DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_recently_viewed_user` (`users_id`),
  KEY `idx_recently_viewed_product` (`product_id`),
  CONSTRAINT `fk_recently_viewed_user` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`),
  CONSTRAINT `fk_recently_viewed_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `wishlist`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `wishlist` (
  `users_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `added_at` DATETIME,
  PRIMARY KEY (`users_id`, `product_id`),
  KEY `idx_wishlist_product` (`product_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`),
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

