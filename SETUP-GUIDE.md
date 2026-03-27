# 📝 Setup Guide - BlockNest Backend

Panduan lengkap untuk setup backend BlockNest dari awal.

## 🚀 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env dengan database credentials kamu
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blocknest_db?schema=public"

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Run migrations
npm run prisma:migrate

# 6. Seed database (optional)
npm run prisma:seed

# 7. Start development server
npm run dev
```

Server akan berjalan di: http://localhost:4000

## 📋 Detailed Setup

### 1. Install Dependencies

```bash
npm install
```

Dependencies yang akan terinstall:
- **express** - Web framework
- **@prisma/client** - Prisma ORM client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **express-validator** - Input validation
- **multer** - File upload
- **nodemon** - Auto-reload (dev)
- **prisma** - Prisma CLI (dev)

### 2. Setup Database

#### Option A: Menggunakan PostgreSQL lokal

**Install PostgreSQL:**
```bash
# Windows (chocolatey)
choco install postgresql

# Mac (homebrew)
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Create database:**
```bash
# Login ke PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE blocknest_db;

# Exit
\q
```

#### Option B: Menggunakan Docker

**docker-compose.yml** (di root project):
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: blocknest_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: blocknest_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Start Docker:**
```bash
docker-compose up -d
```

### 3. Configure Environment Variables

**Copy .env.example:**
```bash
cp .env.example .env
```

**Edit .env:**
```env
# Application
NODE_ENV=development
PORT=4000

# Database (adjust sesuai setup kamu)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blocknest_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Frontend URL (untuk CORS)
FRONTEND_URL="http://localhost:5173"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
```

**Penting:** Ganti `JWT_SECRET` dengan string random yang aman!

Generate JWT secret:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# atau online
# https://www.random.org/strings/
```

### 4. Setup Prisma

**Generate Prisma Client:**
```bash
npm run prisma:generate
```

**Create database tables:**
```bash
npm run prisma:migrate
```

Command ini akan:
- Membaca `src/prisma/schema.prisma`
- Membuat migration file
- Apply migration ke database
- Create tables: users, products, orders, dll.

**Verify tables:**
```bash
# Open Prisma Studio (database GUI)
npm run prisma:studio
```

Browser akan open di http://localhost:5555

### 5. Seed Database (Optional)

Seed database dengan data sample:

```bash
npm run prisma:seed
```

Data yang akan dibuat:
- **Admin user**: admin@blocknest.com / admin123
- **Regular user**: user@blocknest.com / user123
- **Categories**: Living Room, Bedroom, Dining, Office, Outdoor, Sale
- **Sample products**: produk seed sesuai slug dan kebutuhan display FE

### 6. Start Development Server

```bash
npm run dev
```

Server akan start dengan nodemon (auto-reload):
- URL: http://localhost:4000
- API Routes: /api/auth, /api/products, /api/orders

### 7. Test API

**Test dengan cURL:**
```bash
# Health check
curl http://localhost:4000

# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get products
curl http://localhost:4000/api/products
```

**Test dengan Thunder Client (VS Code):**
1. Install Thunder Client extension
2. Create new request
3. Set URL: http://localhost:4000/api/products
4. Click Send

## 🔧 Development Workflow

### Membuat Migration Baru

Setiap kali mengubah `schema.prisma`:

```bash
# 1. Edit src/prisma/schema.prisma
# 2. Create migration
npm run prisma:migrate

# Prisma akan tanya nama migration
# Example: "add_product_rating"

# 3. Prisma akan generate & apply migration
# 4. Restart server (nodemon auto-restart)
```

### Menambah Field Baru

**Example: Tambah field `phone` di User:**

1. Edit `src/prisma/schema.prisma`:
```prisma
model User {
  id       String @id @default(uuid())
  email    String @unique
  password String
  name     String
  phone    String?  // ← Field baru
  // ... other fields
}
```

2. Create migration:
```bash
npm run prisma:migrate
# Name: "add_user_phone_field"
```

3. Update controller untuk handle field baru

### Reset Database (HATI-HATI!)

```bash
# Hapus semua data & migrations
npm run prisma:migrate reset

# Re-run migrations
npm run prisma:migrate

# Seed lagi
npm run prisma:seed
```

**WARNING:** Command ini akan **DELETE ALL DATA**!

## 🧪 Testing Endpoints

### Authentication Flow

**1. Register:**
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "081234567890"
}

# Response:
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**2. Login:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Response:
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**3. Get Profile:**
```bash
GET /api/auth/profile
Authorization: Bearer <token>

# Response:
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Product Endpoints

**Get all products:**
```bash
GET /api/products
GET /api/products?page=1&limit=10
GET /api/products?search=sofa
GET /api/products?categoryId=<uuid>
GET /api/products?minPrice=1000000&maxPrice=5000000
GET /api/products?sortBy=price&order=asc
```

**Get single product:**
```bash
GET /api/products/<product-id>
```

**Create product (Admin only):**
```bash
POST /api/products
Authorization: Bearer <admin-token>
{
  "name": "Modern Sofa",
  "slug": "modern-sofa",
  "description": "Beautiful sofa",
  "price": 3500000,
  "stock": 10,
  "sku": "SOFA-001",
  "categoryId": "<category-uuid>"
}
```

### Order Endpoints

**Create order:**
```bash
POST /api/orders
Authorization: Bearer <token>
{
  "addressId": "<address-uuid>",
  "paymentMethod": "bank_transfer",
  "notes": "Deliver in the morning"
}
```

**Get user orders:**
```bash
GET /api/orders
Authorization: Bearer <token>
```

## 📊 Database Schema Overview

### Users & Auth
- **users** - User accounts
- **addresses** - Shipping addresses

### Products
- **categories** - Product categories
- **products** - Product catalog
- **product_images** - Product images

### Shopping
- **carts** - User shopping carts
- **cart_items** - Items in cart

### Orders
- **orders** - Customer orders
- **order_items** - Order line items

### Reviews
- **reviews** - Product reviews & ratings

## 🐛 Troubleshooting

### Error: Port 4000 already in use

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :4000
kill -9 <PID>

# Atau ganti PORT di .env
PORT=4001
```

### Error: Database connection failed

```bash
# Check PostgreSQL status
# Windows
sc query postgresql

# Mac
brew services list

# Linux
sudo systemctl status postgresql

# Check DATABASE_URL di .env
cat .env | grep DATABASE_URL

# Test connection
psql -U postgres -d blocknest_db
```

### Error: Prisma Client not generated

```bash
npm run prisma:generate
```

### Error: Module not found

```bash
# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Error: Migration failed

```bash
# Reset database (CAUTION: deletes data!)
npm run prisma:migrate reset

# Or manually drop tables via Prisma Studio
npm run prisma:studio
```

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm start                # Start production

# Prisma
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI
npm run prisma:seed      # Seed database

# Database
psql -U postgres         # PostgreSQL CLI
docker-compose up -d     # Start Docker
docker-compose down      # Stop Docker
docker logs blocknest_postgres  # View logs
```

## 🎯 Next Steps

1. ✅ Setup complete!
2. 📖 Baca [README.md](./README.md) untuk API documentation
3. 🧪 Test semua endpoints
4. 💻 Start building features!

## 📝 Notes

- **Development**: Gunakan `npm run dev` (auto-reload)
- **Production**: Gunakan `npm start`
- **Prisma Studio**: Tool yang bagus untuk view/edit database
- **Postman/Thunder Client**: Tools untuk test API
- **Git**: Jangan commit `.env` file!

---

**Happy Coding! 🚀**
