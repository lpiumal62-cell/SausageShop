# Software Requirements Specification (SRS) Document
## SausageShop E-Commerce Platform

**Version:** 1.0  
**Date:** 2024  
**Project:** SausageShop - Premium Sausage E-Commerce Platform

---

## 1️⃣ Introduction (හැඳින්වීම)

### 1.1 Document Purpose (Document එකේ අරමුණ)

මෙම Software Requirements Specification (SRS) document එක software system එකේ requirements, functionalities, design constraints, සහ system behavior පැහැදිලිව specify කරන document එකකි. මෙම document එක:

- **Developers** ට system development කිරීමට අවශ්‍ය සියලුම information provide කරයි
- **Clients** ට system එකෙන් ලැබෙන features සහ capabilities පැහැදිලි කරයි
- **Examiners** ට project requirements සහ implementation assessment කිරීමට guidance ලබා දෙයි
- **Stakeholders** ට project scope සහ objectives පැහැදිලි කරයි

### 1.2 Product Scope (Product එකේ Scope)

**SausageShop** යනු premium quality sausages online තුළින් sell කරන e-commerce platform එකකි. System එක මගින්:

- **Customers** ට online product browsing, shopping cart management, order placement, සහ account management facilities provide කරයි
- **Administrators** ට product management, order management, customer management, සහ dashboard analytics facilities provide කරයි
- **Guests** ට product browsing සහ shopping cart (session-based) facilities provide කරයි

**Key Benefits:**
- 24/7 online shopping availability
- Real-time inventory management
- Secure payment processing
- Order tracking capabilities
- User-friendly interface
- Mobile-responsive design

### 1.3 Definitions, Acronyms, and Abbreviations

| Term/Acronym | Meaning |
|--------------|---------|
| **SRS** | Software Requirements Specification |
| **UI** | User Interface |
| **UX** | User Experience |
| **API** | Application Programming Interface |
| **REST** | Representational State Transfer |
| **JWT** | JSON Web Token |
| **ORM** | Object-Relational Mapping |
| **Hibernate** | Java ORM framework |
| **JPA** | Jakarta Persistence API |
| **DTO** | Data Transfer Object |
| **SKU** | Stock Keeping Unit |
| **HTTP** | HyperText Transfer Protocol |
| **HTTPS** | HTTP Secure |
| **DB** | Database |
| **SQL** | Structured Query Language |
| **CRUD** | Create, Read, Update, Delete |
| **MVC** | Model-View-Controller |
| **JSP** | JavaServer Pages |
| **HTML** | HyperText Markup Language |
| **CSS** | Cascading Style Sheets |
| **JS** | JavaScript |
| **JSON** | JavaScript Object Notation |

### 1.4 References

1. **IEEE 830-1998** - IEEE Recommended Practice for Software Requirements Specifications
2. **Jakarta EE Documentation** - https://jakarta.ee/
3. **Hibernate Documentation** - https://hibernate.org/
4. **RESTful API Design Guidelines** - REST API Best Practices
5. **Tailwind CSS Documentation** - https://tailwindcss.com/
6. **MySQL Documentation** - https://dev.mysql.com/doc/

---

## 2️⃣ Overall Description (සමස්ත විස්තරය)

### 2.1 Software Perspective (Software Perspective)

SausageShop system එක standalone web-based e-commerce application එකක් වන අතර, එය:

- **Web Browser** තුළ run වන client-side application (HTML, CSS, JavaScript)
- **Java-based** server-side application (Jakarta EE, Hibernate)
- **MySQL Database** එකක් සමඟ integrate වන database layer
- **RESTful API** architecture එකක් use කරන API layer

**System Architecture:**
```
┌─────────────────┐
│  Web Browser    │ (Frontend - HTML/CSS/JS)
└────────┬────────┘
         │ HTTP/HTTPS
┌────────▼────────┐
│  Tomcat Server  │ (Application Server)
└────────┬────────┘
         │
┌────────▼────────┐
│  REST API       │ (Jersey/Jakarta EE)
└────────┬────────┘
         │
┌────────▼────────┐
│  Service Layer  │ (Business Logic)
└────────┬────────┘
         │
┌────────▼────────┐
│  Hibernate ORM  │ (Data Access Layer)
└────────┬────────┘
         │
┌────────▼────────┐
│  MySQL Database │ (Data Storage)
└─────────────────┘
```

### 2.2 Users and Characteristics (Users සහ ඔවුන්ගේ Characteristics)

#### 2.2.1 User Types

**1. Guest Users (අමුත්තන්)**
- **Description:** Registered නොවූ visitors
- **Skills Level:** Basic web browsing knowledge
- **Capabilities:**
  - Browse products
  - View product details
  - Add items to cart (session-based)
  - Search products
  - View categories
- **Limitations:**
  - Cannot place orders
  - Cannot save wishlist
  - Cart data lost after session expires

**2. Registered Users (ලියාපදිංචි Users)**
- **Description:** Account සහිත customers
- **Skills Level:** Basic to intermediate web knowledge
- **Capabilities:**
  - All guest user capabilities
  - Create account and login
  - Place orders
  - Manage profile
  - View order history
  - Save wishlist
  - Manage addresses
  - Persistent shopping cart
- **Authentication:** Email and password

**3. Administrators (පරිපාලකයන්)**
- **Description:** System administrators who manage the platform
- **Skills Level:** Advanced technical knowledge
- **Capabilities:**
  - Login to admin panel
  - Manage products (CRUD operations)
  - Manage categories
  - View and manage orders
  - View customer information
  - View dashboard statistics
  - Manage product images
  - Update product stock
- **Authentication:** Admin credentials with role-based access control

**4. Sellers (විකුණන්නන්)**
- **Description:** Product sellers who list their products
- **Skills Level:** Intermediate web knowledge
- **Capabilities:**
  - Manage their own products
  - View sales statistics
  - Manage inventory
- **Status:** Must be approved by admin

### 2.3 Operating Environment (Operating Environment)

#### 2.3.1 Server Environment
- **Operating System:** Windows/Linux/MacOS
- **Java Version:** Java 17 or higher
- **Application Server:** Apache Tomcat (Embedded)
- **Database:** MySQL 8.0 or higher
- **Web Server:** Apache Tomcat

#### 2.3.2 Client Environment
- **Browsers:** 
  - Google Chrome (latest version)
  - Mozilla Firefox (latest version)
  - Microsoft Edge (latest version)
  - Safari (latest version)
- **Screen Resolution:** Responsive design (mobile, tablet, desktop)
- **Internet Connection:** Required for all operations

#### 2.3.3 Development Environment
- **IDE:** IntelliJ IDEA / Eclipse / VS Code
- **Build Tool:** Maven
- **Version Control:** Git
- **Frontend Framework:** Tailwind CSS, jQuery
- **Backend Framework:** Jakarta EE, Jersey, Hibernate

### 2.4 Design Constraints (Design Constraints)

#### 2.4.1 Technical Constraints
- **Programming Language:** Java (Backend), JavaScript (Frontend)
- **Database:** MySQL (Relational Database)
- **ORM Framework:** Hibernate (JPA implementation)
- **API Style:** RESTful API
- **Authentication:** Session-based authentication
- **File Storage:** Local file system for product images

#### 2.4.2 Security Constraints
- Password encryption required
- Session management for user authentication
- Role-based access control (RBAC)
- SQL injection prevention (using Hibernate parameterized queries)
- XSS (Cross-Site Scripting) prevention
- CSRF protection
- Secure file upload validation

#### 2.4.3 Performance Constraints
- Page load time: < 3 seconds
- API response time: < 1 second
- Support for concurrent users: Minimum 100
- Database query optimization required
- Image optimization for faster loading

#### 2.4.4 Business Constraints
- Must support multiple product categories
- Must handle inventory management
- Must support promotional codes/discounts
- Must maintain order history
- Must support multiple delivery types

---

## 3️⃣ Specific Requirements (විශේෂ අවශ්‍යතා)

### 3.1 External Interface Requirements (External Interface Requirements)

#### 3.1.1 User Interface Requirements

**3.1.1.1 Home Page (index.html)**
- Hero banner with call-to-action buttons
- Featured products section
- "Why Choose Us" section
- Customer testimonials slider
- Statistics counter
- Newsletter subscription
- Process flow visualization
- Trust badges
- Social media feed

**3.1.1.2 Shop Page (shop.html)**
- Product listing with grid layout
- Advanced search and filtering:
  - Search by product name
  - Filter by category
  - Filter by price range
  - Filter by stock availability
  - Sort by price, name, date
  - Show only on-sale products
- Product cards with:
  - Product image
  - Product title
  - Price (with sale price if applicable)
  - Stock status
  - Quick add to cart button
  - Wishlist button

**3.1.1.3 Product Detail Page (product.html)**
- Product image gallery (main image + thumbnails)
- Product title and category
- Price display (regular and sale price)
- Stock quantity display
- Quantity selector
- Add to cart button
- Add to wishlist button
- Product description tabs:
  - Description
  - Nutrition Facts
  - Ingredients
- Related products section
- Product SKU display

**3.1.1.4 Shopping Cart Page (cart.html)**
- Cart items list with:
  - Product image
  - Product name
  - Price per unit
  - Quantity controls (increase/decrease)
  - Total price per item
  - Remove item button
- Order summary:
  - Subtotal
  - Shipping cost
  - Tax
  - Discount (promo code)
  - Grand total
- Promo code input
- Delivery type selection (Standard/Express)
- Clear cart button
- Proceed to checkout button

**3.1.1.5 User Authentication Pages**
- **Sign Up Page (sign-up.html):**
  - First name, last name fields
  - Email field
  - Password field
  - Confirm password field
  - Submit button
  - Link to sign-in page

- **Sign In Page (sign-in.html):**
  - Email field
  - Password field
  - Remember me checkbox
  - Submit button
  - Link to sign-up page
  - Forgot password link

**3.1.1.6 Admin Dashboard (admin-dashboard.html)**
- Statistics cards:
  - Total products
  - Total orders
  - Total customers
  - Total revenue
- Recent orders table
- Quick action buttons
- Charts and graphs (if applicable)

**3.1.1.7 Admin Products Page (admin-products.html)**
- Products table with columns:
  - Product image
  - Product title
  - Category
  - Price
  - Stock quantity
  - Status
  - Actions (Update, Delete)
- Add new product button
- Search and filter options

**3.1.1.8 Admin Edit Product Page (admin-edit-product.html)**
- Product form with fields:
  - Product title
  - Short description
  - Long description
  - Category selection
  - Price
  - Sale price
  - Stock quantity
  - SKU
  - Nutrition information (calories, protein, fat, carbs)
  - Ingredients
  - Product images (multiple upload)
- Update button
- Cancel button

#### 3.1.2 Hardware Interface Requirements
- **Server Hardware:**
  - Minimum 4GB RAM
  - Minimum 50GB storage
  - Network connectivity

- **Client Hardware:**
  - Any device with web browser
  - Internet connection
  - Minimum screen resolution: 320x480 (mobile)

#### 3.1.3 Software Interface Requirements
- **Database:** MySQL 8.0+
- **Application Server:** Apache Tomcat (Embedded)
- **Java Runtime:** JRE 17+
- **Web Browser:** Modern browsers with JavaScript enabled

### 3.2 Functional Requirements (Functional Requirements)

#### 3.2.1 User Management

**FR-1: User Registration**
- **Description:** System must allow new users to create accounts
- **Input:** First name, last name, email, password
- **Process:**
  1. Validate email format
  2. Check if email already exists
  3. Validate password strength
  4. Hash password
  5. Generate verification code
  6. Save user to database with PENDING status
  7. Send verification email (if implemented)
- **Output:** Success message or error message
- **Priority:** High

**FR-2: User Login**
- **Description:** System must authenticate registered users
- **Input:** Email, password
- **Process:**
  1. Validate email format
  2. Find user by email
  3. Verify password
  4. Check user status (must be ACTIVE/VERIFIED)
  5. Create session
  6. Set session attributes (user, role)
- **Output:** Success with redirect or error message
- **Priority:** High

**FR-3: User Logout**
- **Description:** System must allow users to logout
- **Process:**
  1. Invalidate session
  2. Clear session data
  3. Redirect to home page
- **Output:** Redirect to home page
- **Priority:** Medium

**FR-4: Profile Management**
- **Description:** Users must be able to view and update their profile
- **Input:** Updated user information
- **Process:**
  1. Retrieve current user data
  2. Display in profile form
  3. Allow updates
  4. Validate changes
  5. Save to database
- **Output:** Updated profile information
- **Priority:** Medium

#### 3.2.2 Product Management

**FR-5: Browse Products**
- **Description:** Users must be able to view all available products
- **Process:**
  1. Fetch all active products from database
  2. Include product images, prices, categories
  3. Display in grid/list layout
- **Output:** Product listing page
- **Priority:** High

**FR-6: Search Products**
- **Description:** Users must be able to search products by name
- **Input:** Search query string
- **Process:**
  1. Accept search input
  2. Query database for matching products
  3. Filter by product title/description
  4. Display results
- **Output:** Filtered product list
- **Priority:** High

**FR-7: Filter Products**
- **Description:** Users must be able to filter products by various criteria
- **Input:** Category, price range, stock availability, sort option
- **Process:**
  1. Apply category filter
  2. Apply price range filter
  3. Apply stock filter
  4. Apply sorting (price, name, date)
  5. Display filtered results
- **Output:** Filtered and sorted product list
- **Priority:** High

**FR-8: View Product Details**
- **Description:** Users must be able to view detailed information about a product
- **Input:** Product ID
- **Process:**
  1. Fetch product by ID
  2. Load product images
  3. Load product category
  4. Load nutrition information
  5. Load ingredients
  6. Load related products
  7. Display all information
- **Output:** Product detail page
- **Priority:** High

**FR-9: Admin - Add Product**
- **Description:** Administrators must be able to add new products
- **Input:** Product details, images
- **Process:**
  1. Validate product data
  2. Upload product images
  3. Save product to database
  4. Associate images with product
  5. Set default status
- **Output:** Success message with product ID
- **Priority:** High

**FR-10: Admin - Update Product**
- **Description:** Administrators must be able to update existing products
- **Input:** Product ID, updated product data, optional new images
- **Process:**
  1. Fetch existing product
  2. Update product fields
  3. Handle image updates (if provided)
  4. Save changes to database
- **Output:** Success message
- **Priority:** High

**FR-11: Admin - Delete Product**
- **Description:** Administrators must be able to delete products
- **Input:** Product ID
- **Process:**
  1. Verify product exists
  2. Check for associated orders
  3. Delete product images
  4. Delete product from database
- **Output:** Success message
- **Priority:** Medium

**FR-12: Admin - Manage Categories**
- **Description:** Administrators must be able to manage product categories
- **Input:** Category name, category image
- **Process:**
  1. Add new category
  2. Update category
  3. Delete category (if no products associated)
- **Output:** Category list
- **Priority:** High

#### 3.2.3 Shopping Cart Management

**FR-13: Add to Cart**
- **Description:** Users must be able to add products to shopping cart
- **Input:** Product ID, Quantity
- **Process:**
  1. Validate product exists
  2. Check stock availability
  3. If logged in: save to database cart
  4. If guest: save to session cart
  5. Update cart total
- **Output:** Cart updated message
- **Priority:** High

**FR-14: View Cart**
- **Description:** Users must be able to view their shopping cart
- **Process:**
  1. Retrieve cart items (from database or session)
  2. Load product details for each item
  3. Calculate totals
  4. Display cart items
- **Output:** Cart page with items
- **Priority:** High

**FR-15: Update Cart Quantity**
- **Description:** Users must be able to update item quantities in cart
- **Input:** Product ID, New Quantity
- **Process:**
  1. Validate quantity (must be > 0)
  2. Check stock availability
  3. Update cart item quantity
  4. Recalculate totals
- **Output:** Updated cart
- **Priority:** High

**FR-16: Remove from Cart**
- **Description:** Users must be able to remove items from cart
- **Input:** Product ID
- **Process:**
  1. Find cart item
  2. Remove from cart (database or session)
  3. Recalculate totals
- **Output:** Updated cart
- **Priority:** High

**FR-17: Clear Cart**
- **Description:** Users must be able to clear entire cart
- **Process:**
  1. Remove all cart items
  2. Clear session cart (if guest)
  3. Clear database cart (if logged in)
- **Output:** Empty cart
- **Priority:** Medium

**FR-18: Apply Promo Code**
- **Description:** Users must be able to apply promotional codes
- **Input:** Promo code string
- **Process:**
  1. Validate promo code
  2. Check expiration date
  3. Calculate discount
  4. Apply to cart total
- **Output:** Updated cart with discount
- **Priority:** Medium

#### 3.2.4 Order Management

**FR-19: Place Order**
- **Description:** Users must be able to place orders
- **Input:** Cart items, delivery address, delivery type
- **Process:**
  1. Validate cart is not empty
  2. Validate stock availability for all items
  3. Calculate order total
  4. Create order record
  5. Create order items
  6. Update product stock
  7. Clear cart
  8. Send confirmation (if implemented)
- **Output:** Order confirmation with order ID
- **Priority:** High

**FR-20: View Order History**
- **Description:** Users must be able to view their order history
- **Process:**
  1. Retrieve user's orders
  2. Load order details
  3. Display in chronological order
- **Output:** Order history page
- **Priority:** Medium

**FR-21: Admin - View Orders**
- **Description:** Administrators must be able to view all orders
- **Process:**
  1. Retrieve all orders
  2. Load order details
  3. Display in table format
- **Output:** Orders list page
- **Priority:** High

**FR-22: Admin - Update Order Status**
- **Description:** Administrators must be able to update order status
- **Input:** Order ID, New Status
- **Process:**
  1. Find order
  2. Update status
  3. Save to database
  4. Notify user (if implemented)
- **Output:** Success message
- **Priority:** High

#### 3.2.5 Wishlist Management

**FR-23: Add to Wishlist**
- **Description:** Users must be able to add products to wishlist
- **Input:** Product ID
- **Process:**
  1. Verify user is logged in
  2. Check if product already in wishlist
  3. Add to wishlist
  4. Save to database
- **Output:** Success message
- **Priority:** Medium

**FR-24: Remove from Wishlist**
- **Description:** Users must be able to remove products from wishlist
- **Input:** Product ID
- **Process:**
  1. Find wishlist item
  2. Remove from database
- **Output:** Success message
- **Priority:** Medium

**FR-25: View Wishlist**
- **Description:** Users must be able to view their wishlist
- **Process:**
  1. Retrieve user's wishlist items
  2. Load product details
  3. Display wishlist
- **Output:** Wishlist page
- **Priority:** Medium

### 3.3 Behavior Requirements (Use Case View)

#### 3.3.1 Use Case Diagram Overview

```
                    ┌─────────────┐
                    │   System    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                   │
   ┌────▼────┐       ┌─────▼─────┐      ┌─────▼─────┐
   │  Guest  │       │   User    │      │  Admin   │
   └────┬────┘       └─────┬─────┘      └─────┬─────┘
        │                  │                  │
        │ Browse Products  │                  │
        │ View Details     │                  │
        │ Add to Cart      │                  │
        │                  │                  │
        │                  │ Register         │
        │                  │ Login            │
        │                  │ Place Order     │
        │                  │ Manage Profile  │
        │                  │ Wishlist         │
        │                  │                  │
        │                  │                  │ Manage Products
        │                  │                  │ Manage Orders
        │                  │                  │ View Dashboard
        │                  │                  │ Manage Categories
```

#### 3.3.2 Key Use Cases

**UC-1: Browse Products (Guest/User)**
- **Actor:** Guest, User
- **Precondition:** None
- **Main Flow:**
  1. User navigates to shop page
  2. System displays all products
  3. User can filter/search products
  4. User clicks on product to view details
- **Postcondition:** Product details displayed

**UC-2: Add Product to Cart (Guest/User)**
- **Actor:** Guest, User
- **Precondition:** User viewing product
- **Main Flow:**
  1. User selects quantity
  2. User clicks "Add to Cart"
  3. System validates stock
  4. System adds item to cart
  5. System shows success message
- **Postcondition:** Item added to cart

**UC-3: Place Order (User)**
- **Actor:** User (must be logged in)
- **Precondition:** User has items in cart
- **Main Flow:**
  1. User navigates to cart
  2. User reviews items
  3. User selects delivery type
  4. User applies promo code (optional)
  5. User clicks "Proceed to Checkout"
  6. System validates cart
  7. System creates order
  8. System updates stock
  9. System clears cart
  10. System shows order confirmation
- **Postcondition:** Order created, cart cleared

**UC-4: Admin Login**
- **Actor:** Administrator
- **Precondition:** Admin has valid credentials
- **Main Flow:**
  1. Admin navigates to admin login page
  2. Admin enters email and password
  3. System validates credentials
  4. System checks admin role
  5. System creates admin session
  6. System redirects to admin dashboard
- **Postcondition:** Admin logged in, redirected to dashboard

**UC-5: Add New Product (Admin)**
- **Actor:** Administrator
- **Precondition:** Admin is logged in
- **Main Flow:**
  1. Admin navigates to add product page
  2. Admin fills product form
  3. Admin uploads product images
  4. Admin selects category
  5. Admin clicks "Save Product"
  6. System validates data
  7. System saves product
  8. System uploads images
  9. System shows success message
- **Postcondition:** New product added to system

---

## 4️⃣ Non-Functional Requirements (Functional නොවන අවශ්‍යතා)

### 4.1 Performance Requirements

**PERF-1: Page Load Time**
- Home page must load within 3 seconds
- Product listing page must load within 2 seconds
- Product detail page must load within 2 seconds
- Admin pages must load within 2 seconds

**PERF-2: API Response Time**
- API endpoints must respond within 1 second for standard queries
- Complex queries (with joins) may take up to 2 seconds
- Image uploads may take up to 5 seconds depending on file size

**PERF-3: Database Performance**
- Database queries must be optimized with proper indexing
- Support for at least 100 concurrent users
- Database connection pooling must be implemented

**PERF-4: Image Handling**
- Product images must be optimized for web display
- Maximum image size: 5MB per image
- Supported formats: JPG, PNG, WebP
- Images must be resized automatically if needed

### 4.2 Safety & Security Requirements

**SEC-1: Authentication Security**
- Passwords must be hashed using secure hashing algorithm (BCrypt)
- Session management must use secure session tokens
- Session timeout: 30 minutes of inactivity
- Password minimum length: 8 characters

**SEC-2: Authorization**
- Role-based access control (RBAC) must be implemented
- Admin endpoints must be protected with `@IsUser` annotation
- Users can only access their own data
- Guests cannot access user-only features

**SEC-3: Data Protection**
- SQL injection prevention through parameterized queries (Hibernate)
- XSS (Cross-Site Scripting) prevention through input sanitization
- CSRF protection for state-changing operations
- Sensitive data (passwords) must never be logged

**SEC-4: File Upload Security**
- File type validation (only images allowed)
- File size limits enforced
- Malicious file detection
- Uploaded files stored in secure directory outside web root

**SEC-5: Session Security**
- Session IDs must be cryptographically secure
- Session fixation prevention
- Secure cookie flags (HttpOnly, Secure in production)

### 4.3 Usability Requirements

**USE-1: User Interface**
- Interface must be intuitive and easy to navigate
- Consistent design across all pages
- Clear error messages
- Loading indicators for async operations

**USE-2: Responsive Design**
- Must work on mobile devices (320px width minimum)
- Must work on tablets (768px width)
- Must work on desktops (1024px+ width)
- Touch-friendly buttons on mobile

**USE-3: Accessibility**
- Proper HTML semantic structure
- Alt text for images
- Keyboard navigation support
- Color contrast compliance (WCAG AA)

### 4.4 Reliability Requirements

**REL-1: System Availability**
- System must be available 99% of the time
- Graceful error handling
- User-friendly error pages

**REL-2: Data Integrity**
- Database transactions for critical operations
- Rollback on errors
- Data validation at multiple layers

**REL-3: Backup and Recovery**
- Regular database backups recommended
- Ability to restore from backup
- Log all critical operations

### 4.5 Scalability Requirements

**SCAL-1: Database Scalability**
- Database design must support growth
- Proper indexing for performance
- Ability to add more products without performance degradation

**SCAL-2: Application Scalability**
- Code must be modular and maintainable
- Separation of concerns (MVC pattern)
- Service layer for business logic

### 4.6 Maintainability Requirements

**MAIN-1: Code Quality**
- Code must follow Java coding standards
- Proper comments and documentation
- Consistent naming conventions

**MAIN-2: Documentation**
- API documentation
- Database schema documentation
- User manual (if applicable)

---

## 5️⃣ Database Schema Overview

### 5.1 Core Entities

1. **users** - User accounts
2. **role** - User roles (ADMIN, USER, SELLER)
3. **status** - Status values (ACTIVE, PENDING, etc.)
4. **category** - Product categories
5. **product** - Products
6. **product_image** - Product images (element collection)
7. **seller** - Seller information
8. **stock** - Stock information
9. **cart** - Shopping cart items
10. **orders** - Orders
11. **order_item** - Order line items
12. **address** - User addresses
13. **city** - Cities
14. **delivery_type** - Delivery types
15. **wishlist** - User wishlists

### 5.2 Key Relationships

- User → Role (Many-to-One)
- User → Status (Many-to-One)
- Product → Category (Many-to-One)
- Product → Seller (Many-to-One)
- Product → Stock (Many-to-One)
- Product → Product Images (One-to-Many via ElementCollection)
- Order → User (Many-to-One)
- Order → Order Items (One-to-Many)
- Cart → User (Many-to-One)
- Cart → Product (Many-to-One)
- Wishlist → User (Many-to-One)
- Wishlist → Product (Many-to-One)

---

## 6️⃣ System Constraints

### 6.1 Technical Constraints
- Must use Java 17+
- Must use MySQL database
- Must use Hibernate ORM
- Must use RESTful API architecture
- Must be web-based application

### 6.2 Business Constraints
- Must support multiple product categories
- Must handle inventory management
- Must support promotional codes
- Must maintain order history
- Must support multiple delivery types

### 6.3 Regulatory Constraints
- Must comply with data protection regulations
- Must handle user data securely
- Must provide privacy policy

---

## 7️⃣ Appendices

### 7.1 Glossary
- **Cart:** Temporary storage for products user wants to purchase
- **Wishlist:** Saved list of products user is interested in
- **SKU:** Stock Keeping Unit - unique identifier for products
- **Session:** Temporary storage for user data during browser session
- **ORM:** Object-Relational Mapping - technique for database access

### 7.2 Assumptions
- Users have basic web browsing knowledge
- Internet connection is available
- Modern web browsers are used
- Database server is available and accessible

### 7.3 Dependencies
- Java Development Kit (JDK) 17+
- MySQL Database Server 8.0+
- Apache Tomcat (Embedded)
- Maven for dependency management
- Modern web browser

---

## Document Approval

**Prepared by:** Development Team  
**Reviewed by:** [Reviewer Name]  
**Approved by:** [Approver Name]  
**Date:** [Date]

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Development Team | Initial SRS Document |

---

**End of Document**
