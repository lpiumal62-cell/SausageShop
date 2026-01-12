-- SQL Script to Insert 10 Categories with Images
-- Make sure the category_image table exists before running this script

-- Insert 10 Categories
INSERT INTO categories (name, description) VALUES
('Beef Sausages', 'Premium beef sausages made from the finest cuts of beef, carefully selected and prepared using traditional methods. Perfect for grilling and barbecuing.'),
('Pork Sausages', 'Traditional pork sausages with rich, savory flavors. Made from premium pork and seasoned with classic herbs and spices.'),
('Chicken Sausages', 'Lean and healthy chicken sausages perfect for those seeking a lighter option. Made from premium chicken meat with aromatic herbs.'),
('Spicy Sausages', 'Bold and flavorful spicy sausages for heat lovers. Featuring various levels of heat from mild to extremely hot.'),
('Breakfast Sausages', 'Perfect morning sausages infused with maple, sage, and traditional breakfast spices. Ideal for starting your day right.'),
('Gourmet Sausages', 'Chef-crafted gourmet sausages with unique and sophisticated flavor profiles. Premium ingredients for special occasions.'),
('Smoked Sausages', 'Slow-smoked sausages with deep, rich flavors. Hours of careful smoking create an unforgettable taste experience.'),
('International Sausages', 'Authentic sausages from around the world. Experience flavors from Italy, Germany, Spain, and more.'),
('Specialty Sausages', 'Unique and creative sausage combinations. From sweet to savory, discover new flavor adventures.'),
('Organic Sausages', 'Certified organic sausages made from organic meat and natural ingredients. Healthy choice for conscious consumers.');

-- Insert Category Images
-- Note: Adjust the image paths according to your actual file structure
-- The category IDs will be auto-generated (1-10 if starting from empty table)
-- Using placeholder image URLs - replace with actual image paths or URLs
INSERT INTO category_image (category_id, image) VALUES
(1, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(2, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(3, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(4, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(5, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(6, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(7, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(8, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(9, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400'),
(10, 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400');

-- Alternative: If you prefer to use local file paths instead of URLs, comment out the above and use this:
INSERT INTO category_image (category_id, image) VALUES
(1, '/uploads/category/1/beef-sausages.jpg'),
(2, '/uploads/category/2/pork-sausages.jpg'),
(3, '/uploads/category/3/chicken-sausages.jpg'),
(4, '/uploads/category/4/spicy-sausages.jpg'),
(5, '/uploads/category/5/breakfast-sausages.jpg'),
(6, '/uploads/category/6/gourmet-sausages.jpg'),
(7, '/uploads/category/7/smoked-sausages.jpg'),
(8, '/uploads/category/8/international-sausages.jpg'),
(9, '/uploads/category/9/specialty-sausages.jpg'),
(10, '/uploads/category/10/organic-sausages.jpg');

