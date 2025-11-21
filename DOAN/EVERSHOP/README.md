# 📦 DOAN/EVERSHOP - Hướng Dẫn Dự Án

<div align="center">

![EverShop Logo](https://raw.githubusercontent.com/evershopcommerce/evershop/dev/.github/images/logo-green.png)

### Dự Án E-Commerce Evershop tái sử dụng để deploy lên Vercel

[![CI Pipeline](https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025/actions/workflows/ci.yml/badge.svg)](https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025/actions)
[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

**Nền tảng thương mại điện tử hiện đại, được xây dựng bằng TypeScript, Express, React và PostgreSQL**

</div>

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
3. [Hướng Dẫn Nhanh](#hướng-dẫn-nhanh)
4. [Chi Tiết Các Thư Mục](#chi-tiết-các-thư-mục)
5. [Quy Trình Phát Triển](#quy-trình-phát-triển)
6. [Triển Khai trên Vercel](#triển-khai-trên-vercel)
7. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 🎯 Tổng Quan

**DOAN/EVERSHOP** là một dự án e-commerce hoàn chỉnh được xây dựng dựa trên **EverShop** - một nền tảng thương mại điện tử mã nguồn mở. Dự án này gồm hai phần chính:

### Mục Tiêu Chính
- 🔄 **Chuẩn Hóa Mã Nguồn** từ FullBase sang Deployment
- 🚀 **Triển Khai trên Vercel** với CI/CD tự động
- 📚 **Quản Lý Module** từ nguồn gốc EverShop
- ✅ **Đảm Bảo Chất Lượng** qua testing và linting tự động

### Tính Năng Chính
- **E-Commerce Đầy Đủ**: Catalog, Checkout, Order Management
- **Kiến Trúc Module**: Dễ mở rộng và bảo trì
- **Công Nghệ Hiện Đại**: TypeScript, Express, React, GraphQL
- **CI/CD Tự Động**: GitHub Actions + Vercel
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
└── evershop/                           # 🚀 Dự Án Triển Khai (Deployment Root)
    ├── README.md                       # Hướng d��n chi tiết dự án
    ├── SETUP.md                        # Hướng dẫn thiết lập môi trường
    ├── WORKFLOW.md                     # Quy trình làm việc
    ├── DEPLOYMENT.md                   # Hướng dẫn triển khai Vercel
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
    ├── nx.json                         # Cấu hình NX workspace
    ├── vercel.json                     # Cấu hình triển khai Vercel
    ├── package.json                    # Phụ thuộc dự án
    └── ...
```

---

## 🚀 Hướng Dẫn Nhanh

### ⚡ Bắt Đầu trong 5 Phút (Phát Triển Cục Bộ)

```bash
# 1️⃣ Sao chép repository
git clone https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025.git
cd DOAN/EVERSHOP/evershop

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

### evershop - Dự Án Triển Khai (Chính)

**Mục Đích**: Dự án được chuẩn hóa, sẵn sàng triển khai lên Vercel

**Nên Dùng Khi**:
- 💻 Phát triển tính năng mới
- 🚀 Triển khai lên Vercel
- ✅ Chạy tests và linting
- 🔄 Đồng bộ thay đổi từ FullBase

**Các File Quan Trọng**:

#### 📖 `README.md`
Hướng dẫn chi tiết về dự án này, bao gồm:
- Setup cục bộ
- Cấu trúc dự án
- Lệnh phổ biến
- Troubleshooting

👉 **[Đọc README.md của evershop](./evershop/README.md)**

#### 🔧 `SETUP.md`
Hướng dẫn cài đặt từng bước:
- Cài đặt dependencies
- Cấu hình cơ sở dữ liệu
- Cấu hình biến môi trường
- Xác minh cài đặt

👉 **[Đọc SETUP.md](./evershop/SETUP.md)**

#### 🔄 `WORKFLOW.md`
Quy trình làm việc hàng ngày:
- Chiến lược tạo nhánh
- Quy trình commit
- Cách tạo Pull Request
- Kiểm tra mã

👉 **[Đọc WORKFLOW.md](./evershop/WORKFLOW.md)**

#### 🚀 `DEPLOYMENT.md`
Triển khai lên Vercel:
- Cấu hình Vercel
- Cấu hình biến môi trường
- Quy trình CI/CD
- Xử lý sự cố triển khai

👉 **[Đọc DEPLOYMENT.md](./evershop/DEPLOYMENT.md)**

#### 🔄 `SYNC_FROM_FULLBASE.md`
Hướng dẫn đồng bộ từ FullBase:
- Cách sao chép module
- Xử lý xung đột
- Kiểm tra phụ thuộc
- Cập nhật phiên bản

👉 **[Đọc SYNC_FROM_FULLBASE.md](./evershop/SYNC_FROM_FULLBASE.md)**

#### 📋 `CONTRIBUTING.md`
Tiêu chuẩn đóng góp mã:
- Chuẩn mã (Code Standards)
- Quy trình kiểm tra
- Yêu cầu test coverage

👉 **[Đọc CONTRIBUTING.md](./evershop/CONTRIBUTING.md)**

#### 📊 `CI_CD_SUMMARY.md`
Tóm tắt quy trình CI/CD:
- GitHub Actions workflow
- Tự động kiểm tra & triển khai
- Trạng thái kiểm tra

👉 **[Đọc CI_CD_SUMMARY.md](./evershop/CI_CD_SUMMARY.md)**

#### ⚙️ `vercel.json`
Cấu hình triển khai Vercel:
- Build command
- Output directory
- Environment variables
- Quy tắc triển khai

---

## 🔄 Quy Trình Phát Triển

### Sơ Đồ Toàn Cảnh

```
┌─────────────────────────────────────────────┐
│     FullBase/evershop-dev (Tham Chiếu)      │
│  - Mã nguồn hoàn chỉnh                     │
│  - Tất cả module                           │
└─────────────────────────────────────────────┘
                    │
                    │ Đồng bộ module cần thiết
                    ↓
┌─────────────────────────────────────────────┐
│     evershop (Dự Án Chính)                  │
│  - Mã được chuẩn hóa                       │
│  - Sẵn sàng triển khai                     │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
        ↓                      ↓
   Local Dev            Vercel Deploy
  (npm run dev)        (GitHub Actions)
        │                      │
        │                      ↓
        │             ✅ Tests → Build → Deploy
        │                      │
        │                      ↓
        └──────→ Production Website
```

### Quy Trình Làm Việc Chi Tiết

#### 1️⃣ **Tạo Nhánh Tính Năng**

```bash
cd DOAN/EVERSHOP/evershop

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
- Vercel tự động triển khai lên production

---

## 🚀 Triển Khai trên Vercel

### Cài Đặt Ban Đầu (Một Lần)

#### Bước 1: Kết Nối Repository

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Kết nối GitHub repository
4. Chọn dự án: `Cgaz275/NHOM_KTPM_DCT122C3_2025`

#### Bước 2: Cấu Hình Build

1. **Root Directory**: `DOAN/EVERSHOP/evershop`
2. **Build Command**: `npm run build`
3. **Output Directory**: `packages/evershop/dist`
4. **Install Command**: `npm install`

#### Bước 3: Cấu Hình Biến Môi Trường

Thêm các biến vào Vercel Dashboard:

```env
# Database (Production)
DB_HOST=<your-db-host>
DB_PORT=5432
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-db-name>
NODE_ENV=production
APP_URL=https://your-domain.vercel.app

# Database (Preview)
DB_HOST=<staging-db-host>
DB_PORT=5432
DB_USER=<staging-db-user>
DB_PASSWORD=<staging-db-password>
DB_NAME=<staging-db-name>
NODE_ENV=staging
```

#### Bước 4: Cấu Hình GitHub Secrets

Vào GitHub Repository Settings → Secrets:

```
VERCEL_TOKEN=<token-from-vercel>
VERCEL_ORG_ID=<org-id>
VERCEL_PROJECT_ID=<project-id>
```

### Triển Khai Tự Động

#### 🟢 Preview Deployment
- **Kích hoạt**: Mỗi Pull Request
- **Môi trường**: Staging
- **URL**: Auto-generated (trong PR comment)

#### 🔴 Production Deployment
- **Kích hoạt**: Merge vào `main`
- **Môi trường**: Production
- **URL**: https://your-domain.vercel.app

---

## 📊 Giám Sát Dự Án

### Kiểm Tra CI/CD Status

```bash
cd DOAN/EVERSHOP/evershop

# Xem lịch sử commit
git log --oneline -10

# Kiểm tra GitHub Actions
# GitHub → Actions tab → Chọn workflow
```

### Xem Deployment

1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **GitHub Actions**: Repository → Actions tab
3. **Application**: http://localhost:3000 (cục bộ)

### Xem Sơ Đồ Phụ Thuộc Module

```bash
cd DOAN/EVERSHOP/evershop

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
npm install

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

### Tài Liệu Xử Lý Sự Cố

👉 **Chi tiết hơn**: Xem tương ứng trong:
- [SETUP.md - Troubleshooting](./evershop/SETUP.md#troubleshooting)
- [DEPLOYMENT.md - Troubleshooting](./evershop/DEPLOYMENT.md#troubleshooting)
- [WORKFLOW.md - Troubleshooting](./evershop/WORKFLOW.md#troubleshooting)

---

## 📚 Tài Liệu Tham Khảo

### Tài Liệu Dự Án

| File | Nội Dung |
|------|---------|
| [README.md](./evershop/README.md) | Hướng dẫn chi tiết dự án |
| [SETUP.md](./evershop/SETUP.md) | Cài đặt môi trường |
| [WORKFLOW.md](./evershop/WORKFLOW.md) | Quy trình làm việc |
| [DEPLOYMENT.md](./evershop/DEPLOYMENT.md) | Triển khai Vercel |
| [SYNC_FROM_FULLBASE.md](./evershop/SYNC_FROM_FULLBASE.md) | Đồng bộ từ FullBase |
| [CONTRIBUTING.md](./evershop/CONTRIBUTING.md) | Tiêu chuẩn đóng góp |
| [CI_CD_SUMMARY.md](./evershop/CI_CD_SUMMARY.md) | Tóm tắt CI/CD |

### Tài Liệu Bên Ngoài

- **EverShop Official**: https://evershop.io
- **EverShop Documentation**: https://evershop.io/docs/
- **GitHub Repository**: https://github.com/evershopcommerce/evershop
- **NX Documentation**: https://nx.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/
- **Express.js Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## 👥 Thông Tin Nhóm

### Team Phát Triển
- **Trưởng Nhóm**: Châu Gia Anh (3122411002)
- **Thành Viên**: Đào Thị Thanh Tâm (3122411182)
- **Thành Viên**: Dương Lê Khánh (3122411093)

### Môn Học
- **Tên Môn**: Kiểm Thử Phần Mềm (Software Testing)
- **Mã Môn**: DCT122C3
- **Lớp**: 2025
- **Trường**: Trường Đại Học Sài Gòn

---

## 📄 Giấy Phép

Licensed under **GNU GENERAL PUBLIC LICENSE 3.0**

Xem file [LICENSE](./LICENSE) để chi tiết.

---

## 🎯 Bắt Đầu Ngay

### 📋 Checklist Bắt Đầu

- [ ] Đọc file README này
- [ ] Chuyển đến thư mục `DOAN/EVERSHOP/evershop`
- [ ] Đọc [SETUP.md](./evershop/SETUP.md) để cài đặt cục bộ
- [ ] Chạy `npm install` và `npm run dev`
- [ ] Đọc [WORKFLOW.md](./evershop/WORKFLOW.md) để hiểu quy trình
- [ ] Tạo nhánh tính năng `modules/my-feature`
- [ ] Viết mã, test, commit, và push
- [ ] Tạo Pull Request trên GitHub
- [ ] Chờ CI/CD và code review
- [ ] Merge vào `main` khi được phê duyệt

### 🚀 Bước Tiếp Theo

1. **Phát Triển Cục Bộ**:
   ```bash
   cd DOAN/EVERSHOP/evershop
   npm install && npm run dev
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
   # Vercel tự động triển khai preview
   ```

---

## 🆘 Cần Trợ Giúp?

### Câu Hỏi Phổ Biến

**Q: Tôi nên phát triển ở thư mục nào?**
> A: Luôn phát triển ở `DOAN/EVERSHOP/evershop`. Chỉ tham khảo `FullBase/evershop-dev`.

**Q: Làm cách nào để cập nh��t module từ FullBase?**
> A: Xem hướng dẫn chi tiết ở [SYNC_FROM_FULLBASE.md](./evershop/SYNC_FROM_FULLBASE.md).

**Q: Cơ sở dữ liệu của tôi không kết nối được?**
> A: Xem hướng dẫn xử lý sự cố ở [SETUP.md](./evershop/SETUP.md#troubleshooting).

**Q: Làm cách nào để triển khai lên production?**
> A: Merge vào `main`, Vercel sẽ tự động triển khai. Chi tiết ở [DEPLOYMENT.md](./evershop/DEPLOYMENT.md).

### Liên Hệ & Hỗ Trợ

- **GitHub Issues**: Post bugs và feature requests
- **Discussions**: Trao đổi ý tưởng với team
- **Slack/Teams**: Nếu có internal communication channel

---

## 📊 Tóm Tắt Cấu Trúc

```
DOAN/EVERSHOP/
│
├─── README.md ⬅️ Bạn đang đọc file này
│
├─── FullBase/evershop-dev/          (Tham Chiếu - Không Triển Khai)
│    └─ source code hoàn chỉnh từ EverShop
│
└─── evershop/ ⭐              (Dự Án Chính - Triển Khai Ở Đây)
     ├─ README.md            (Chi tiết dự án)
     ├─ SETUP.md             (Cài đặt)
     ├─ WORKFLOW.md          (Quy trình làm việc)
     ├─ DEPLOYMENT.md        (Triển khai Vercel)
     ├─ SYNC_FROM_FULLBASE.md (Đồng bộ)
     ├─ CONTRIBUTING.md      (Tiêu chuẩn)
     ├─ CI_CD_SUMMARY.md     (CI/CD)
     ├─ packages/            (Mã nguồn)
     ├─ extensions/          (Phần mở rộng)
     ├─ themes/              (Chủ đề)
     ├─ .github/workflows/   (GitHub Actions)
     ├─ vercel.json          (Vercel config)
     └─ package.json         (Dependencies)
```

---

<div align="center">

### 🎉 Sẵn Sàng Bắt Đầu?

👉 **Chuyển đến [DOAN/EVERSHOP/evershop/README.md](./evershop/README.md)**

hoặc

👉 **Bắt Đầu Thiết Lập với [SETUP.md](./evershop/SETUP.md)**

---

Made with ❤️ for Software Testing Course

**DOAN/EVERSHOP - 2025**

</div>
