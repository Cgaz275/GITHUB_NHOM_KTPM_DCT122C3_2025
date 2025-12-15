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
  

# 📦 DOAN/EVERSHOP - Hướng Dẫn Dự Án

<div align="center">

![EverShop Logo](https://raw.githubusercontent.com/evershopcommerce/evershop/dev/.github/images/logo-green.png)

### Dự Án E-Commerce Evershop tái sử dụng với Docker & GitHub Container Registry

[![CI Pipeline](https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025/actions/workflows/ci.yml/badge.svg)](https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025/actions)
[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

**Nền tảng thương mại điện tử hiện đại, được xây dựng bằng TypeScript, Express, React và PostgreSQL**

</div>

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
3. [Hướng Dẫn Nhanh](#hướng-dẫn-nhanh)
4. [Docker Setup](#docker-setup)
5. [Chi Tiết Các Thư Mục](#chi-tiết-các-thư-mục)
6. [Quy Trình Phát Triển](#quy-trình-phát-triển)
7. [Triển Khai với Docker & GitHub Container](#triển-khai-với-docker--github-container)
8. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

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
- **CI/CD Tự Động**: GitHub Actions + Docker + GitHub Container Registry
- **NX Workspace**: Quản lý monorepo hiệu quả

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
    ├── SETUP.md                        # Hướng dẫn thiết lập môi trường
    ├── WORKFLOW.md                     # Quy trình làm việc
    ├── CONTRIBUTING.md                 # Tiêu chuẩn đóng góp
    ├── CI_CD_SUMMARY.md               # Tóm tắt quy trình CI/CD
    ├── SYNC_FROM_FULLBASE.md          # Hướng dẫn đồng bộ từ FullBase
    │
    ├── packages/                       # Các gói NX
    │   ├── evershop/                  # Ứng dụng chính
    │   │   ├── src/
    │   │   │   ├── modules/           # Các module tính năng
    │   │   │   ├── bin/               # CLI scripts
    │   │   │   └── ...
    │   │   └── dist/                  # Output đã biên dịch
    │   ├── postgres-query-builder/
    │   └── create-evershop-app/
    │
    ├── extensions/                     # Phần mở rộng (tùy chỉnh)
    ├── themes/                         # Chủ đề giao diện (tùy chỉnh)
    ├── public/                         # Tài nguyên tĩnh
    ├── .github/workflows/              # Quy trình CI/CD
    │
    ├── .env.example                    # Mẫu biến môi trường
    ├── Dockerfile                      # Docker image configuration
    ├── docker-compose.yml              # Docker local development
    ├── nx.json                         # Cấu hình NX workspace
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
| `npm run test` | Chạy các bài kiểm tra |
| `npm run lint` | Kiểm tra chuẩn mã |
| `npm run setup` | Thiết lập cơ sở dữ liệu |
| `npm run nx -- graph` | Xem sơ đồ phụ thuộc |

---

## 🐳 Docker Setup

### Docker Development (Recommended)

Docker cung cấp môi trường phát triển chuẩn, tách biệt với hệ thống. Tất cả services (App, PostgreSQL, Redis) chạy trong container.

#### Bắt Đầu Nhanh

```bash
# 1. Khởi động tất cả services (App + Database + Redis)
docker-compose up -d

# 2. Kiểm tra services chạy
docker-compose ps

# 3. Xem logs
docker-compose logs -f app

# 4. Truy cập ứng dụng
http://localhost:3000
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

- **PostgreSQL** (Port 5432): Database
  - Version 16 Alpine
  - Persistent volume
  - Auto-health check

- **Redis** (Port 6379): Cache & Session
  - Version 7 Alpine
  - Optional but recommended

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
- Docker Compose services (App, PostgreSQL, Redis)
- Lệnh Docker thường dùng
- Cấu hình environment
- Triển khai Docker trên production
- Xử lý sự cố Docker

👉 **[Đọc DOCKER.md](./DOAN/EVERSHOP/ShoesStore_Evershop/DOCKER.md)**

#### ⚙️ `Dockerfile` & `docker-compose.yml`
Cấu hình Docker cho cục bộ và production:
- Multi-stage build optimization
- PostgreSQL & Redis services
- Environment configuration
- Health checks & monitoring

---

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
   npm run dev           - Tests
                          - Build Docker image
                          - Push GHCR
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
npm install --workspaces --include-workspace-root

# Khởi động máy chủ phát triển
npm run dev

# Viết mã, kiểm tra...
```

#### 3️⃣ **Kiểm Tra Cục Bộ**

```bash
# Chạy linting
npm run lint -- --fix

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
┌─────────────────────────────┐
│ 1️⃣  Lint Code (parallel)    │
│ 2️⃣  Run Tests (parallel)    │
│ 3️⃣  Build Application       │
│ 4️⃣  Build & Push Docker     │
│ 5️⃣  Notify Status           │
└─────────────────────────────┘
         ↓
✅ Tests Pass → Docker Image Pushed to ghcr.io
❌ Tests Fail → Build Stopped, Fix Required
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
# - Redis (localhost:6379)
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

# App
NODE_ENV=development
DEBUG=evershop:*
PORT=3000

# Redis (optional)
REDIS_URL=redis://localhost:6379
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

### Xem Sơ Đồ Phụ Thuộc Module

```bash
cd DOAN/EVERSHOP/ShoesStore_Evershop

npm run nx -- graph
# Mở http://localhost:4211
```

---

## 🛠 Xử Lý Sự Cố

### Sự Cố Phổ Biến

#### ❌ Build thất bại cục bộ

```bash
# Xóa cache và cài đặt lại
rm -rf node_modules
npm install --workspaces --include-workspace-root

# Biên dịch lại
npm run compile
npm run compile:db

# Build lại
npm run build
```

#### ❌ Tests không thành công

```bash
# Xóa Jest cache
npm run test -- --clearCache

# Chạy lại tests
npm run test
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
---

## 👥 Thông Tin Nhóm

### Team Phát Triển
- **Trưởng Nhóm**: Châu Gia Anh (3122411002)
- **Thành Viên**: Đào Thị Thanh Tâm (3122411182)
- **Thành Viên**: Dương Lê Khánh (3122411093)

### Môn Học
- **Tên Môn**: Kiểm Thử Phần Mềm (Software Testing)
- **Lớp**: DCT122C3
- **Trường**: Trường Đại Học Sài Gòn
- **GVHD**: TS. Đỗ Như Tài
---

---

## 🎯 Bắt Đầu Triển Khai

### 📋 Checklist Bắt Đầu

- [ ] Chuyển đến thư mục `DOAN/EVERSHOP/ShoesStore_Evershop`
- [ ] Chạy `npm install --workspaces --include-workspace-root` và `npm run dev`
- [ ] Tạo nhánh tính năng `modules/my-feature`
- [ ] Viết mã, test, commit, và push
- [ ] Tạo Pull Request trên GitHub
- [ ] Chờ CI/CD và code review
- [ ] Merge vào `main` khi được phê duyệt

### 🚀 Bước Tiếp Theo

1. **Phát Triển Cục Bộ**:> A:

Local development: chạy bằng npm run dev trong ShoesStore_Evershop

CI: GitHub Actions tự động chạy test khi push code

Local chỉ phục vụ phát triển, không build image tại máy cá nhân.
   ```bash
   cd DOAN/EVERSHOP/ShoesStore_Evershop
   npm install --workspaces --include-workspace-root && npm run dev
   ```

2. **Tạo Tính Năng**:
   ```bash
   git checkout -b modules/my-feature
   # Viết mã...
   npm run test && npm run lint
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

**Q: Tôi phát triển và test ứng dụng ở đâu??**
> **A:** Local development: chạy bằng npm run dev trong ShoesStore_Evershop
> **CI:** GitHub Actions tự động chạy test khi push code
> Local chỉ phục vụ phát triển, không build image tại máy cá nhân.

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
     ├─ SETUP.md             (Cài đặt)
     ├─ CI_CD_SUMMARY.md     (CI/CD)
     ├─ packages/            (Mã nguồn)
     ├─ extensions/          (Phần mở rộng)
     ├─ themes/              (Chủ đề)
     ├─ .github/workflows/   (GitHub Actions)
     └─ package.json         (Dependencies)
```


