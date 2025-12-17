# GITHUB NHÓM KIỂM THỬ PHẦN MỀM DCT122C3_SGU_2025
**Học phần:** Kiểm thử phần mềm

**Giảng viên:** TS.Đỗ Như Tài

**Lớp:** DCT122C3

**Danh sách thành viên nhóm:**
- Nhóm trưởng: Châu Gia Anh - 3122411002
- Thành viên: Đào Thị Thanh Tâm - 3122411182
- Thành viên: Dương Lê Khánh - 3122411093

**Link classroom:** https://classroom.google.com/c/ODAxNjgxMTkyNzAz

# ĐÔ ÁN MÔN HỌC

- Repository **GITHUB_NHOM_KTPM_DCT122C3_2025** là repo chứa toàn bộ tài liệu liên quan đến môn học
- DOAN\EVERSHOP\FullBase là nơi chứa source gốc của dự án được tái sử dụng
- DOAN\EVERSHOP\ShoesStore_Evershop là root project để deploy án chính với Docker & GitHub Container Registry
  
## Tóm tắt nội dung đồ án

```
Dự án tái sử dụng EverShop theo kiến trúc module, tách rõ mã nguồn tham chiếu và dự án triển khai, tích hợp kiểm thử tự động trong CI/CD, 
và triển khai bằng Docker image thông qua GitHub Container Registry để đảm bảo chất lượng, tính ổn định và khả năng mở rộng đồng thời xây dựng
phương án kiểm thử.
```

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
3. [Hướng Dẫn Nhanh](#hướng-dẫn-nhanh)
4. [Docker Setup](#docker-setup)
5. [Testing](#-testing)
6. [Chi Tiết Các Thư Mục](#chi-tiết-các-thư-mục)
7. [Quy Trình Phát Triển](#quy-trình-phát-triển)
8. [Triển Khai với Docker & GitHub Container](#triển-khai-với-docker--github-container)

---

## 🎯 Tổng Quan

**DOAN/EVERSHOP** là một dự án e-commerce hoàn chỉnh được xây dựng dựa trên **EverShop** - một nền tảng thương mại điện tử mã nguồn mở. Dự án này gồm hai phần chính:

### Mục Tiêu Chính
- 🔄 **Chuẩn Hóa Mã Nguồn** từ FullBase sang Deployment
- 🚀 **Containerization** với Docker & GitHub Container Registry
- 📚 **Quản Lý Module** từ nguồn gốc EverShop
- ✅ **Đảm Bảo Chất Lượng** qua testing và linting tự động

### Tính Năng Chính
- **E-Commerce Đầy Đủ**: Catalog, Checkout, Order Management
- **Kiến Trúc Module**: Dễ mở rộng và bảo trì
- **Công Nghệ Hiện Đại**: TypeScript, Express, React, GraphQL
- **CI/CD Tự Động**: GitHub Actions + Docker + GitHub Container Registry + Cypress E2E Tests
- **Testing Toàn Diện**: Unit tests (Jest) + E2E tests (Cypress)
- **Caching & Sessions**: Redis cho caching dữ liệu và quản lý sessions

---

## 📁 Cấu Trúc Thư Mục

```
DOAN/EVERSHOP/
├── README.md                           # 📄 File này - Hướng dẫn tổng quan
│
├── FullBase/                           # 📦 Nguồn Gốc Mã (Source of Truth)
│   └── evershop-dev/
│       ├── packages/                   # Các gói chính
│       │   ├── evershop/              # Ứng dụng chính
│       │   ├── postgres-query-builder/ # Utilities cơ sở dữ liệu
│       │   └── create-evershop-app/    # CLI scaffolding
│       ├── extensions/                 # Các phần mở rộng
│       ├── themes/                     # Các chủ đề giao diện
│       ├── README.md                   # Hướng dẫn FullBase
│       └── package.json                # Phụ thuộc dự án
│
└── ShoesStore_Evershop/                # Dự Án Triển Khai (Deployment Root)
    ├── README.md                       # Hướng dẫn chi tiết dự án
    ├── CI_CD_SUMMARY.md               # Tóm tắt quy trình CI/CD
    │
    ├── packages/                       # Các gói ứng dụng
    │   ├── evershop/                  # Ứng dụng chính
    │   │   ├── src/
    │   │   │   ├── modules/           # Các module tính năng
    │   │   │   ├── bin/               # CLI scripts
    │   │   │   └── ...
    │   │   └── dist/                  # Output đã biên dịch
    │   ├── postgres-query-builder/
    │   └── create-evershop-app/
    │
    ├── cypress/                        # E2E tests (Cypress)
    │   ├── e2e/                        # Test cases
    │   ├── support/                    # Test helpers
    │   └── fixtures/                   # Test data
    │
    ├── extensions/                     # Phần mở rộng (tùy chỉnh)
    ├── themes/                         # Chủ đề giao diện (tùy chỉnh)
    ├── public/                         # Tài nguyên tĩnh
    ├── .github/workflows/              # Quy trình CI/CD
    │
    ├── .env.example                    # Mẫu biến môi trường
    ├── Dockerfile                      # Docker image configuration
    ├── docker-compose.yml              # Docker local development
    ├── cypress.config.js               # Cấu hình Cypress
    ├── jest.config.js                  # Cấu hình Jest
    ├── package.json                    # Phụ thuộc dự án
    └── ...
```

---

## 🚀 Hướng Dẫn Nhanh

### ⚡ Bắt Đầu trong 5 Phút (Phát Triển Cục Bộ)

```bash
# 1️⃣ Sao chép repository
git clone https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025.git
cd DOAN/EVERSHOP/ShoesStore_Evershop

# 2️⃣ Cài đặt phụ thuộc
npm install

# 3️⃣ Thiết lập cơ sở dữ liệu
npm run setup
# Hoặc dùng Docker: docker-compose up -d

# 4️⃣ Khởi động máy chủ phát triển
npm run dev
# Truy cập: http://localhost:3000
```

### 📋 Yêu Cầu Trước

- **Node.js**: 20.x hoặc 22.x
- **npm**: 9.x trở lên
- **PostgreSQL**: 16 (hoặc dùng Docker)
- **Git**: 2.30+

### 🔧 Lệnh Phổ Biến

| Lệnh | Mục Đích |
|------|---------|
| `npm run dev` | Khởi động máy chủ phát triển |
| `npm run build` | Biên dịch cho sản xuất |
| `npm run test` | Chạy unit tests (Jest) |
| `npm run test:e2e` | Chạy E2E tests (Cypress) headless |
| `npm run test:e2e:ui` | Mở Cypress Test Runner UI |
| `npm run lint` | Kiểm tra chuẩn mã |
| `npm run setup` | Thiết lập cơ sở dữ liệu |
| `npm run compile` | Biên dịch TypeScript |

---

## 🐳 Docker Setup

### Docker Development (Recommended)

Docker cung cấp môi trường phát triển chuẩn, tách biệt với hệ thống. Tất cả services (App, PostgreSQL) chạy trong container.

#### Bắt Đầu Nhanh

```bash
# 1. Khởi động tất cả services (App + Database)
docker-compose up -d

# 2. Kiểm tra services chạy
docker-compose ps

# 3. Xem logs
docker-compose logs -f app

# 4. Xác minh tất cả services đang chạy
docker-compose ps
# Kết quả: app, database, redis - tất cả đều UP

# 5. Truy cập ứng dụng
http://localhost:3000

# Hoặc chạy tests sau khi app start:
# npm run test - chạy unit tests
# npm run test:e2e:ui - mở Cypress UI

# 6. Kiểm tra Redis connection (optional)
redis-cli -h localhost
# Hoặc: docker-compose exec redis redis-cli ping
# Output: PONG
```

#### Dừng Services

```bash
# Dừng services (giữ data)
docker-compose stop

# Dừng và xóa containers
docker-compose down

# Xóa tất cả data
docker-compose down -v
```

#### Lệnh Phổ Biến

| Lệnh | Mục Đích |
|------|---------|
| `docker-compose up -d` | Khởi động background |
| `docker-compose ps` | Xem trạng thái services |
| `docker-compose logs -f app` | Xem logs real-time |
| `docker-compose exec app npm run lint` | Chạy linting trong container |
| `docker-compose exec app npm run test` | Chạy tests trong container |
| `docker-compose down` | Dừng tất cả services |

👉 **Chi tiết**: Xem [DOCKER.md](./DOAN/EVERSHOP/ShoesStore_Evershop/DOCKER.md) để tìm hiểu thêm

### Services trong Docker

- **App** (Port 3000): EverShop application
  - Node 20 Alpine
  - Hot reload enabled
  - Health check enabled
  - Redis client connection

- **PostgreSQL** (Port 5432): Database
  - Version 16 Alpine
  - Persistent volume
  - Auto-health check

- **Redis** (Port 6379): Cache & Session Store
  - Version 7 Alpine
  - AOF (Append-Only File) persistence
  - Health check enabled
  - Persistent volume for data

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Chạy tất cả unit tests
npm run test

# Chạy tests với coverage (ngưỡng pass: 70%)
npm run test -- --coverage

# Chạy tests và clear Jest cache
npm run test -- --clearCache

# Chạy tests cho 1 file cụ thể
npm run test -- path/to/file.test.js
```

**Coverage Threshold**: Tối thiểu **70%** cho branches, functions, lines, statements

### E2E Tests (Cypress)

#### Chạy Tests

```bash
# Chạy tất cả E2E tests (headless)
npm run test:e2e

# Mở Cypress Test Runner UI (interactive)
npm run test:e2e:ui

# Chạy headless (tương tự npm run test:e2e)
npm run test:e2e:headless
```

#### Cấu Hình Cypress

- **Base URL**: http://localhost:3000
- **Viewport**: 1280x720
- **Timeout**: 10 giây (commands, requests, responses)
- **Video**: Chỉ ghi khi tests fail
- **Screenshots**: Tự động chụp khi fail

#### Test Structure

```
cypress/
├── e2e/                    # Test cases
│   ├── auth/              # Authentication tests
│   ├── storefront/        # Customer-facing tests
│   └── ...
├── support/               # Test helpers & commands
│   ├── e2e.js            # E2E setup
│   └── commands.js       # Custom commands
├── fixtures/              # Test data
│   ├── admin.json        # Admin credentials
│   ├── customer.json     # Customer data
│   └── products.json     # Product data
└── ...
```

#### Test Coverage Chính

- ✅ Authentication (admin login/logout)
- ✅ Token management & JWT lifecycle
- ✅ Protected pages & access control
- ✅ Product browsing & catalog
- ✅ Shopping cart operations
- ✅ Checkout flow

👉 **Chi tiết**: Xem [cypress/README.md](./DOAN/EVERSHOP/ShoesStore_Evershop/cypress/README.md)

### Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Unit Tests | 70% |
| E2E Tests | All critical flows |
| Code Quality | ESLint pass |

CI/CD sẽ **FAIL** nếu:
- Unit test coverage < 70%
- Linting có lỗi
- E2E tests fail

### Redis & Caching

#### Giới Thiệu Redis

**Redis** được dùng cho:
- **Session Storage**: Lưu trữ session người dùng (thay vì in-memory)
- **Data Caching**: Cache dữ liệu tĩnh (products, categories, etc.)
- **Rate Limiting**: Giới hạn số request
- **Real-time Features**: Queues, pub/sub, real-time updates

#### Cấu Hình Redis

**Environment Variables** (tự động trong Docker):
```env
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=                    # Optional

# Cache settings
CACHE_ENABLED=true
CACHE_TTL=3600                     # TTL 1 giờ
CACHE_MAX_SIZE=1000                # Max items trong cache
SESSION_STORE=redis                # Dùng Redis cho sessions
```

#### Kiểm Tra Redis Connection

```bash
# Kết nối trực tiếp (nếu redis-cli cài đặt)
redis-cli -h localhost ping
# Output: PONG

# Hoặc dùng Docker
docker-compose exec redis redis-cli ping
# Output: PONG

# Kiểm tra Redis info
docker-compose exec redis redis-cli info
docker-compose exec redis redis-cli dbsize      # Số keys
docker-compose exec redis redis-cli FLUSHDB     # Xóa toàn bộ cache (dev only)
```

#### Sử Dụng Cache trong Code

```javascript
// Giả sử có redis client được tạo
import { redisClient } from './lib/redis';

// Lấy từ cache
const cachedData = await redisClient.get('product:123');
if (cachedData) {
  return JSON.parse(cachedData);
}

// Nếu không có, fetch từ DB
const product = await db.query('SELECT * FROM products WHERE id = ?', [123]);

// Lưu vào cache (1 giờ = 3600 giây)
await redisClient.setex('product:123', 3600, JSON.stringify(product));

return product;
```

#### Xóa Cache khi Data thay đổi

```javascript
// Khi update product
await db.updateProduct(id, newData);

// Xóa cache để client có dữ liệu mới
await redisClient.del('product:' + id);
await redisClient.del('products:all');  // Nếu có list cache
```

---

## 📚 Chi Tiết Các Thư Mục

### FullBase/evershop-dev - Nguồn Gốc Mã

**Mục Đích**: Chứa mã nguồn hoàn chỉnh từ EverShop, sử dụng làm tham chiếu

**Nên Dùng Khi**:
- 📖 Tìm hiểu cách triển khai các tính năng
- 🔍 Tham khảo mã nguồn gốc
- 🔄 Đồng bộ các module mới vào dự án chính

**Cấu Trúc Module**:
```
FullBase/evershop-dev/packages/evershop/src/modules/
├── auth/              # Xác thực & Phân quyền
├── catalog/           # Quản lý sản phẩm
├── checkout/          # Quy trình thanh toán
├── cms/               # Quản lý nội dung
├── customer/          # Quản lý khách hàng
└── oms/               # Quản lý đơn hàng
```

**Không Dùng Để**: Không triển khai trực tiếp từ thư mục này

---

### ShoesStore_Evershop - Dự Án Triển Khai (Chính)

**Mục Đích**: Dự án được chuẩn hóa, sẵn sàng triển khai với Docker & GitHub Container Registry

**Nên Dùng Khi**:
- 💻 Phát triển tính năng mới
- 🚀 Triển khai với Docker (cục bộ hoặc production)
- ✅ Chạy tests và linting
- 🔄 Đồng bộ thay đổi từ FullBase

**Các File Quan Trọng**:

#### 📖 `README.md`
Hướng dẫn chi tiết về dự án này, bao gồm:
- Setup cục bộ
- Cấu trúc dự án
- Lệnh phổ biến
- Troubleshooting


#### 📊 `CI_CD_DOCKER.md`
Tóm tắt quy trình CI/CD với Docker:
- GitHub Actions workflow chi tiết
- Build và push Docker images
- Tự động kiểm tra & triển khai
- Trạng thái kiểm tra

👉 **[Đọc CI_CD_DOCKER.md](./DOAN/EVERSHOP/ShoesStore_Evershop/CI_CD_DOCKER.md)**

#### 🐳 `DOCKER.md`
Hướng dẫn Docker setup & quản lý:
- Docker Compose services (App, PostgreSQL)
- Lệnh Docker thường dùng
- Cấu hình environment
- Triển khai Docker trên production
- Xử lý sự cố Docker

👉 **[Đọc DOCKER.md](./DOAN/EVERSHOP/ShoesStore_Evershop/DOCKER.md)**

#### ⚙️ `Dockerfile` & `docker-compose.yml`
Cấu hình Docker cho cục bộ và production:
- Multi-stage build optimization
- PostgreSQL service
- Environment configuration
- Health checks & monitoring

---

## 🔄 Quy Trình Phát Triển

### Sơ Đồ Toàn Cảnh

```
┌─────────────────────────────────────────────┐
│      FullBase / evershop-dev (Upstream)     │
│  - Source gốc EverShop                     │
│  - Tất cả modules                          │
│  - Chỉ dùng để tham chiếu / sync           │
└─────────────────────────────────────────────┘
                    │
        (Sync / Cherry-pick / Subtree)
                    ↓
┌─────────────────────────────────────────────┐
│      ShoesStore_Evershop (Product Repo)     │
│  - Code đã chuẩn hoá                        │
│  - Module được chọn lọc                    │
│  - CI/CD riêng                              │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ↓                       ↓
   Local Development      GitHub Actions (CI)
   npm run dev           - Lint Code
                          - Unit Tests
                          - Build App
                          - E2E Tests
                          - Build Docker
                                   │
                                   ↓
                      GitHub Container Registry
                                   │
                                   ↓
                          Production Deployment
```

### Quy Trình Làm Việc Chi Tiết

#### 1️⃣ **Tạo Nhánh Tính Năng**

```bash
cd DOAN/EVERSHOP/ShoesStore_Evershop

# Tạo nhánh mới (modules/* hoặc feature/*)
git checkout -b modules/my-feature

# Hoặc từ FullBase nếu cần đồng bộ
# Xem SYNC_FROM_FULLBASE.md
```

#### 2️⃣ **Phát Triển Tính Năng**

```bash
# Cài đặt dependencies (nếu chưa)
npm install

# Khởi động máy chủ phát triển
npm run dev

# Viết mã, kiểm tra...
```

#### 3️⃣ **Kiểm Tra Cục Bộ**

```bash
# Chạy linting
npm run lint

# Chạy unit tests
npm run test

# Biên dịch TypeScript
npm run compile

# Build sản xuất
npm run build
```

#### 4️⃣ **Commit và Push**

```bash
# Commit theo chuẩn Conventional Commits
git add .
git commit -m "feat(module-name): describe your changes"

# Push lên GitHub
git push origin modules/my-feature
```

#### 5️⃣ **Tạo Pull Request**

- Vào GitHub → Create Pull Request
- Mô tả rõ ràng những gì đã thay đổi
- Chuyên chở nhánh tính năng vào `main`
- CI/CD tự động chạy kiểm tra

#### 6️⃣ **Phê Duyệt & Merge**

- Chờ CI/CD checks ✅
- Chờ code review từ team
- Merge vào `main` khi được phê duyệt
- GitHub Actions tự động build Docker image và push lên GitHub Container Registry

---

## 🚀 Triển Khai với Docker & GitHub Container

### Quy Trình CI/CD Tự Động

GitHub Actions tự động chạy trên mỗi push hoặc pull request:

```
Push to main / PR to main
         ↓
┌──────────────────────────────────────────────────────┐
│ 1️⃣  Lint Code (parallel)                             │
│ 2️⃣  Run Unit Tests (parallel)                        │
│ 3️⃣  Build Application                                │
│ 4️⃣  Run E2E Tests (Cypress)                          │
│ 5️⃣  Build & Push Docker (main only)                  │
│ 6️⃣  Notify Status                                    │
└──────────────────────────────────────────────────────┘
         ↓
✅ All Tests Pass → Docker Image Pushed to ghcr.io
❌ Any Test Fails → Build Stopped, Fix Required
```

#### 🐳 GitHub Container Registry (ghcr.io)

**Tự động không cần cấu hình bổ sung:**
- ✅ GitHub Token được cấp tự động
- ✅ Quyền `packages: write` đã có
- ✅ Image tạo tại: `ghcr.io/cgaz275/nhom_ktpm_dct122c3_2025`

**Tags tự động:**
```
ghcr.io/cgaz275/nhom_ktpm_dct122c3_2025:latest          # Main branch
ghcr.io/cgaz275/nhom_ktpm_dct122c3_2025:main-abc123    # Main commit
ghcr.io/cgaz275/nhom_ktpm_dct122c3_2025:modules-xyz    # Feature branch
```

#### 📦 Docker Image

**Multi-stage build:**
- Builder stage: Compile & build (~500MB)
- Runtime stage: Lightweight (~150MB)
- Node 20 Alpine
- Health checks enabled
- Non-root user (security)
- Redis client library included
- Redis connection support

**Chạy Docker image locally:**

```bash
# Pull image mới nhất
docker pull ghcr.io/cgaz275/nhom_ktpm_dct122c3_2025:latest

# Chạy container với environment
docker run -d \
  -e DB_HOST=localhost \
  -e DB_PASSWORD=postgres \
  -e NODE_ENV=production \
  -p 3000:3000 \
  ghcr.io/cgaz275/nhom_ktpm_dct122c3_2025:latest
```

### Triển Khai Cục Bộ với Docker Compose

Để phát triển hoặc test, sử dụng Docker Compose:

```bash
# Khởi động tất cả services
docker-compose up -d

# Services sẽ chạy:
# - App (http://localhost:3000)
# - PostgreSQL (localhost:5432)
```

### Cấu Hình Biến Môi Trường

Tạo `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=evershop

# Redis & Cache
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
CACHE_ENABLED=true
CACHE_TTL=3600
SESSION_STORE=redis

# App
NODE_ENV=development
DEBUG=evershop:*
PORT=3000
SESSION_SECRET=your-secret-key
```

Xem [.env.example](./DOAN/EVERSHOP/ShoesStore_Evershop/.env.example) cho danh sách đầy đủ.

---

## 📊 Giám Sát Dự Án

### Kiểm Tra CI/CD Status

```bash
cd DOAN/EVERSHOP/ShoesStore_Evershop

# Xem lịch sử commit
git log --oneline -10

# Kiểm tra GitHub Actions
# GitHub → Actions tab → Chọn workflow
```

### Xem Deployment

1. **GitHub Container Registry**: https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025/pkgs/container/
2. **GitHub Actions**: Repository → Actions tab → CI Pipeline
3. **Application**: http://localhost:3000 (cục bộ với Docker Compose)

### Xem Logs & Debug

```bash
cd DOAN/EVERSHOP/ShoesStore_Evershop

# Xem logs Docker
docker-compose logs -f app

# Debug tests
DEBUG=evershop:* npm run dev
```

---

## 🛠 Xử Lý Sự Cố

### Sự Cố Phổ Biến

#### ❌ Build thất bại cục bộ

```bash
# Xóa cache và cài đặt lại
rm -rf node_modules
npm install

# Biên dịch lại
npm run compile
npm run compile:db

# Build lại
npm run build
```

#### ❌ Unit Tests không thành công

```bash
# Xóa Jest cache
npm run test -- --clearCache

# Chạy lại tests
npm run test

# Chạy với verbose output
npm run test -- --verbose
```

#### ❌ Cypress E2E Tests fail

```bash
# Kiểm tra app đang chạy
curl http://localhost:3000

# Mở Cypress UI để debug
npm run test:e2e:ui

# Chạy 1 spec file
npx cypress run --spec "cypress/e2e/auth/admin-login.cy.js"

# Xem screenshots/videos
ls cypress/screenshots/
ls cypress/videos/
```

#### ❌ Kết nối cơ sở dữ liệu bị lỗi

```bash
# Kiểm tra PostgreSQL chạy hay không
psql -h localhost -U postgres -c "\l"

# Kiểm tra biến .env
cat .env | grep DB_

# Hoặc dùng Docker
docker-compose up -d
```

#### ❌ Redis connection failed

```bash
# Kiểm tra Redis service
docker-compose ps redis

# Kiểm tra Redis logs
docker-compose logs redis

# Restart Redis
docker-compose restart redis

# Kiểm tra connection
redis-cli -h localhost ping
# Expected: PONG

# Nếu redis-cli không cài, dùng Docker
docker-compose exec redis redis-cli ping

# Clear Redis cache (nếu cần)
docker-compose exec redis redis-cli FLUSHDB
```

#### ❌ Cache không hoạt động

```bash
# Kiểm tra REDIS_URL trong .env
cat .env | grep REDIS

# Kiểm tra app logs
docker-compose logs -f app | grep -i redis

# Restart app để reconnect Redis
docker-compose restart app

# Xác nhận Redis available
curl http://localhost:3000/health  # Nếu có health check endpoint
```

---

## 🎯 Bắt Đầu Triển Khai

### 📋 Checklist Bắt Đầu

- [ ] Chuyển đến thư mục `DOAN/EVERSHOP/ShoesStore_Evershop`
- [ ] Chạy `npm install` và `npm run dev`
- [ ] Tạo nhánh tính năng `modules/my-feature`
- [ ] Viết mã, test, commit, và push
- [ ] Tạo Pull Request trên GitHub
- [ ] Chờ CI/CD và code review
- [ ] Merge vào `main` khi được phê duyệt

### 🚀 Bước Tiếp Theo

1. **Phát Triển Cục Bộ**:

   ```bash
   cd DOAN/EVERSHOP/ShoesStore_Evershop
   npm install && npm run dev
   # Truy cập: http://localhost:3000
   ```

2. **Tạo Tính Năng**:
   ```bash
   git checkout -b modules/my-feature
   # Viết mã...
   npm run test          # Unit tests
   npm run test:e2e      # E2E tests
   npm run lint          # Linting
   ```

3. **Triển Khai**:
   ```bash
   git push origin modules/my-feature
   # Tạo Pull Request trên GitHub
   ```

---

### Câu Hỏi Phổ Biến

**Q: Tôi nên phát triển ở thư mục nào?**
> A: Luôn phát triển ở `DOAN/EVERSHOP/ShoesStore_Evershop`. Chỉ tham khảo `FullBase/evershop-dev`.

**Q: Tôi chạy tests ở đâu?**
> A: 
> - **Local**: `npm run test` (unit) hoặc `npm run test:e2e` (E2E)
> - **CI/CD**: GitHub Actions tự động chạy khi push/PR
> - **Coverage**: Tối thiểu 70%, kiểm tra trên CI

**Q: Cypress tests là gì?**
> A: End-to-end tests cho toàn bộ user workflows (auth, shopping, checkout). Tự động chạy sau build trong CI/CD.

**Q: Redis dùng để làm gì?**
> A: Redis lưu trữ sessions, cache dữ liệu, quản lý queues, rate limiting. Giúp tăng performance bằng cách giảm query database.

**Q: Làm sao biết Redis đang hoạt động?**
> A: Chạy `docker-compose exec redis redis-cli ping`. Nếu output là `PONG`, Redis hoạt động bình thường.

**Q: Tôi có thể vô hiệu hóa Redis không?**
> A: Có. Đặt `CACHE_ENABLED=false` trong .env hoặc xóa Redis service khỏi docker-compose.yml (nhưng không khuyến nghị cho production).

---

## 📊 Tóm Tắt Cấu Trúc

```
DOAN/EVERSHOP/
│
├─── FullBase/evershop-dev/          (Tham Chiếu - Không Triển Khai)
│    └─ source code hoàn chỉnh từ EverShop
│
└─── ShoesStore_Evershop/ ⭐         (Dự Án Chính - Triển Khai Ở Đây)
     ├─ README.md            (Chi tiết dự án)
     ├─ cypress/             (E2E tests)
     ├─ packages/            (Mã nguồn)
     ├─ extensions/          (Phần mở rộng)
     ├─ themes/              (Chủ đề)
     ├─ .github/workflows/   (GitHub Actions)
     ├─ jest.config.js       (Jest config - 70% coverage)
     ├─ cypress.config.js    (Cypress config)
     └─ package.json         (Dependencies)
```
