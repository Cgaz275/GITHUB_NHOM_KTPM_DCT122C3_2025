# Hướng Dẫn Docker & Quản Lý

Hướng dẫn hoàn chỉnh để chạy EverShop với Docker trên máy cục bộ và trong pipeline CI/CD.

---

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
3. [Bắt Đầu Nhanh](#bắt-đầu-nhanh)
4. [Các Dịch Vụ Docker Compose](#các-dịch-vụ-docker-compose)
5. [Lệnh Thường Dùng](#lệnh-thường-dùng)
6. [Giải Thích Dockerfile](#giải-thích-dockerfile)
7. [Biến Môi Trường](#biến-môi-trường)
8. [Cấu Hình Mạng & Cổng](#cấu-hình-mạng--cổng)
9. [Khắc Phục Sự Cố](#khắc-phục-sự-cố)
10. [Triển Khai Production](#triển-khai-production)

---

## Tổng Quan

### Tại Sao Dùng Docker?

Docker cung cấp:
- **Tính Nhất Quán**: Môi trường giống hệt trên máy cục bộ và production
- **Cách Ly Hệ Thống**: Không xung đột với các dependencies
- **Khả Năng Mở Rộng**: Dễ dàng mở rộng và triển khai nhiều instance
- **Tích Hợp CI/CD**: Kiểm tra và triển khai tự động
- **Hợp Tác Nhóm**: Môi trường phát triển chuẩn hóa

### Kiến Trúc

```
┌─────────────────────────────────────┐
│      Docker Container               │
├─────────────────────────────────────┤
│  EverShop Application (Node.js)     │
│  - Cổng: 3000                       │
│  - Node: v20 Alpine                 │
└──────────────┬──────────────────────┘
               │
               ├─────────────────┐
               │                 │
           PostgreSQL       Network
          (Cổng 5432)  (evershop-network)
```

---

## Yêu Cầu Hệ Thống

### Bắt Buộc

- **Docker**: 20.10+ ([Tải xuống](https://www.docker.com/products/docker-desktop))
- **Docker Compose**: 2.0+ (đi kèm Docker Desktop)
- **Git**: Để sao chép repository

### Tùy Chọn

- **Docker Registry**: Để đẩy images (GitHub Container Registry, Docker Hub)
- **Make**: Cho lệnh đơn giản hóa (macOS/Linux)

### Xác Minh Cài Đặt

```bash
docker --version
docker-compose --version
docker ps
```

Kết quả mong đợi:
```
Docker version 24.0.0, build ...
Docker Compose version 2.20.0, build ...
```

---

## Bắt Đầu Nhanh

### 1. Khởi Động Dịch Vụ (Một Lệnh)

```bash
# Từ thư mục DOAN/EVERSHOP/ShoesStore_Evershop
docker-compose up -d --build

# Chờ khởi động (lần đầu 40-90 giây để setup database)
docker-compose logs -f app
```

**Lưu ý**:
- Lần đầu chạy, container sẽ tự động chạy `npm run setup` để khởi tạo schema database
- Database sẽ phải sẵn sàng (healthcheck pass) mới bắt đầu setup
- Setup sử dụng biến môi trường (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
- Lần sau sẽ nhanh hơn vì database đã được khởi tạo

### 2. Xác Minh Dịch Vụ Chạy

```bash
docker-compose ps

# Kết quả mong đợi:
# NAME             STATUS
# evershop-app     Up (healthy)
# evershop-db      Up (healthy)
```

### 3. Truy Cập Ứng Dụng

- **Ứng Dụng Web**: http://localhost:3000
- **Cơ Sở Dữ Liệu**: localhost:5432 (PostgreSQL)

### 4. Dừng Dịch Vụ

```bash
docker-compose down

# Hoặc với dọn dẹp volume
docker-compose down -v
```

---

## Các Dịch Vụ Docker Compose

### Dịch Vụ: app (Ứng Dụng EverShop)

```yaml
service: app
image: Được tạo từ Dockerfile
port: 3000:3000
command: npm run setup && npm run start
environment:
  DB_HOST: database
  DB_USER: postgres
  DB_PASSWORD: postgres
  DB_NAME: postgres
  NODE_ENV: production
```

**Tính Năng**:
- ✅ Khởi tạo schema database tự động (npm run setup)
- ✅ Tạo tables và migrations nếu chưa tồn tại
- ✅ Phụ thuộc vào PostgreSQL khởi động
- ✅ Khởi động ứng dụng sau khi setup xong

### Dịch Vụ: database (PostgreSQL)

```yaml
service: database
image: postgres:16
port: 5432:5432
volumes: postgres-data (dữ liệu lâu dài)
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_DB: postgres
```

**Tính Năng**:
- ✅ Lưu trữ dữ liệu lâu dài
- ✅ Khởi động tự động khi container restart

---

## Lệnh Thường Dùng

### Khởi Động & Dừng

```bash
# Khởi động tất cả dịch vụ nền
docker-compose up -d

# Khởi động với xuất log
docker-compose up

# Dừng dịch vụ (giữ volumes)
docker-compose stop

# Dừng và xóa containers
docker-compose down

# Dừng và xóa mọi thứ (bao gồm dữ liệu!)
docker-compose down -v
```

### Xem Nhật Ký

```bash
# Xem nhật ký tất cả dịch vụ
docker-compose logs

# Xem nhật ký app liên tục
docker-compose logs -f app

# Xem dịch vụ cụ thể
docker-compose logs -f database

# 100 dòng cuối cùng
docker-compose logs --tail=100 app
```

### Quản Lý Dịch Vụ

```bash
# Khởi động lại tất cả dịch vụ
docker-compose restart

# Khởi động lại dịch vụ cụ thể
docker-compose restart app

# Xây dựng lại image
docker-compose build

# Xây dựng và khởi động
docker-compose up -d --build

# Kiểm tra trạng thái dịch vụ
docker-compose ps
```

### Hoạt Động Cơ Sở Dữ Liệu

```bash
# Kết nối tới PostgreSQL
docker-compose exec database psql -U postgres -d postgres

# Liệt kê tất cả cơ sở dữ liệu
docker-compose exec database psql -U postgres -l

# Sao lưu cơ sở dữ liệu
docker-compose exec database pg_dump -U postgres postgres > backup.sql

# Khôi phục cơ sở dữ liệu
docker-compose exec database psql -U postgres postgres < backup.sql

# Xem nhật ký PostgreSQL
docker-compose logs -f database
```

### Thực Thi Lệnh Trong Container

```bash
# Chạy lệnh trong container app
docker-compose exec app npm run lint

# Chạy test
docker-compose exec app npm run test

# Truy cập shell app
docker-compose exec app sh

# Cài đặt package bổ sung
docker-compose exec app npm install package-name
```

### Quản Lý Tài Nguyên

```bash
# Kiểm tra sử dụng tài nguyên container
docker stats

# Xem kích thước image
docker images evershop

# Xóa images không dùng
docker image prune

# Xóa tất cả dữ liệu Docker
docker system prune -a
```

---

## Giải Thích Dockerfile

### Xây Dựng Nhiều Giai Đoạn

Dockerfile của chúng tôi sử dụng một giai đoạn để tối ưu hóa:

#### Giai Đoạn: Sản Xuất
```dockerfile
FROM node:20-alpine
# Cài đặt dependencies
# Sao chép mã nguồn
# Biên dịch TypeScript
# Xây dựng ứng dụng
# Kết quả: ~200MB image cuối cùng
```

### Các Tính Năng Chính

1. **Cơ Sở Alpine**: Image cơ sở nhẹ (40MB so với 900MB cho phiên bản tiêu chuẩn)
2. **Tối Ưu Hóa**: Kích thước image nhỏ gọn
3. **Node.js v20**: Phiên bản Node hiện đại

### Lệnh Xây Dựng

```dockerfile
CMD ["npm", "run", "start"]
```

Thực thi: `npm run start`

Đảm bảo:
- Ứng dụng khởi động đúng cách
- Cấu hình đúng cho production

---

## Biến Môi Trường

### Tải từ .env

Tạo tệp `.env` từ `.env.example`:

```bash
cp .env.example .env
# Chỉnh sửa giá trị nếu cần
```

### Sử Dụng Docker Compose

```yaml
# Tải từ .env tự động
environment:
  DB_HOST: database
  DB_USER: ${DB_USER:-postgres}  # Dùng giá trị .env hoặc mặc định "postgres"
  DB_PASSWORD: ${DB_PASSWORD:-postgres}
```

### Ghi Đè Lúc Runtime

```bash
# Qua dòng lệnh
docker-compose up -e NODE_ENV=production

# Qua tệp env
docker-compose --env-file .env.production up

# Qua export
export NODE_ENV=production
docker-compose up
```

### Biến Quan Trọng cho Docker

| Biến | Mặc Định | Mục Đích |
|------|----------|---------|
| `DB_HOST` | `database` | Tên máy chủ cơ sở dữ liệu |
| `DB_PORT` | `5432` | Cổng PostgreSQL |
| `DB_USER` | `postgres` | Người dùng PostgreSQL |
| `DB_PASSWORD` | `postgres` | Mật khẩu PostgreSQL |
| `DB_NAME` | `postgres` | Tên cơ sở dữ liệu |
| `NODE_ENV` | `production` | Chế độ môi trường |
| `PORT` | `3000` | Cổng ứng dụng |

**⚠️ Quan Trọng**: Không bao giờ commit `.env` với thông tin xác thực thực tế lên Git!

---

## Cấu Hình Mạng & Cổng

### Ánh Xạ Cổng

```
Cổng Máy Host → Cổng Container
3000         → 3000  (Ứng Dụng)
5432         → 5432  (PostgreSQL)
```

### Ánh Xạ Cổng Tùy Chỉnh

Chỉnh sửa `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8000:3000"  # Thay đổi: http://localhost:8000
  database:
    ports:
      - "5433:5432"  # PostgreSQL trên 5433 thay vì 5432
```

### Mạng Docker

Các dịch vụ giao tiếp qua mạng Docker `evershop-network`:

```bash
# Từ container app, kết nối tới cơ sở dữ liệu:
Host: database (không phải localhost hoặc 127.0.0.1)
Port: 5432 (cổng nội bộ, không được ánh xạ)

# Từ máy chủ:
Host: localhost
Port: 5432 (cổng được ánh xạ)
```

---

## Khắc Phục Sự Cố

### Cổng Đã Được Sử Dụng

**Vấn Đề**: `Error: Bind for 0.0.0.0:3000 failed: port is already allocated`

**Giải Pháp**:

```bash
# Tìm process sử dụng cổng 3000
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Tùy Chọn 1: Dừng process khác
kill -9 <PID>

# Tùy Chọn 2: Dùng cổng khác
docker-compose up -e PORT=3001

# Tùy Chọn 3: Chỉnh sửa docker-compose.yml
# Thay đổi: ports: ["3001:3000"]
```

### Container Bị Crash Ngay Lập Tức

**Vấn Đề**: Container thoát với lỗi code 1

**Giải Pháp**:

```bash
# Kiểm tra logs
docker-compose logs app

# Xây dựng lại image
docker-compose build --no-cache

# Kiểm tra biến môi trường
cat .env

# Xây dựng lại và khởi động
docker-compose up --build
```

### Lỗi Kết Nối Cơ Sở Dữ Liệu

**Vấn Đề**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Giải Pháp**:

```bash
# Kiểm tra database có chạy
docker-compose ps database

# Kiểm tra logs database
docker-compose logs database

# Xác minh host đúng (không phải localhost, dùng 'database')
# Trong container app, kết nối tới: database:5432

# Chờ database khởi động
docker-compose up database
# Chờ "database_1 ... ready to accept connections"
# Sau đó khởi động app
```

### Lỗi Quyền Hạn Volume

**Vấn Đề**: `Error: EACCES: permission denied`

**Giải Pháp**:

```bash
# Kiểm tra quyền hạn tệp
ls -la

# Sửa quyền sở hữu
sudo chown -R $USER:$USER .

# Hoặc tạo lại volume
docker-compose down -v
docker-compose up -d
```

### Vấn Đề Không Gian Ổ Cứng

**Vấn Đề**: `Error: No space left on device`

**Giải Pháp**:

```bash
# Kiểm tra sử dụng không gian Docker
docker system df

# Dọn dẹp tài nguyên không dùng
docker system prune

# Xóa tất cả images và volumes
docker system prune -a --volumes

# Kiểm tra không gian ổ cứng hệ thống
df -h
```

### Lỗi Bảng Không Tồn Tại ("relation does not exist")

**Vấn Đề**: `error: relation "url_rewrite" does not exist` hoặc tương tự

**Nguyên Nhân**: Database schema chưa được khởi tạo (migrations chưa chạy)

**Giải Pháp**:

```bash
# Rebuild container để chạy setup
docker-compose down -v
docker-compose up -d --build

# Hoặc chạy setup thủ công
docker-compose exec app npm run setup

# Xem logs setup
docker-compose logs -f app
```

**Lưu ý**: Lần đầu chạy container, `npm run setup` sẽ tự động chạy để tạo tất cả tables.

### Cập Nhật Nhanh Không Hoạt Động

**Vấn Đề**: Thay đổi tệp không được phản ánh trong container

**Giải Pháp**:

```bash
# Xác minh ánh xạ volume
docker-compose config | grep -A5 volumes

# Khởi động lại container
docker-compose restart app

# Kiểm tra quyền tệp
ls -la packages/

# Cho Windows/WSL2, dùng đường dẫn đúng
# Dùng đường dẫn kiểu unix trong docker-compose.yml
```

---

## Triển Khai Production

### Xây Dựng Docker Image

```bash
# Xây dựng image trên máy cục bộ
docker build -t evershop:latest -f Dockerfile .

# Xây dựng với tag
docker build -t evershop:1.0.0 -f Dockerfile .

# Xây dựng với tag registry
docker build -t ghcr.io/username/evershop:latest -f Dockerfile .
```

### Đẩy tới Registry

#### GitHub Container Registry

```bash
# Đăng nhập
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin

# Gắn tag image
docker tag evershop:latest ghcr.io/username/evershop:latest

# Đẩy
docker push ghcr.io/username/evershop:latest
```

#### Docker Hub

```bash
# Đăng nhập
docker login

# Gắn tag image
docker tag evershop:latest username/evershop:latest

# Đẩy
docker push username/evershop:latest
```

### Chạy Trong Production

```bash
# Kéo image
docker pull ghcr.io/username/evershop:latest

# Chạy container
docker run -d \
  -p 80:3000 \
  -e DB_HOST=<your-db-host> \
  -e DB_PASSWORD=<secure-password> \
  -e NODE_ENV=production \
  --name evershop \
  ghcr.io/username/evershop:latest
```

### Docker Compose cho Production

Tạo `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/username/evershop:latest
    restart: always
    environment:
      DB_HOST: ${DB_HOST}
      DB_PASSWORD: ${DB_PASSWORD}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - database

  database:
    image: postgres:16
    restart: always
    volumes:
      - postgres-prod:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

Chạy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Giám Sát & Nhật Ký

```bash
# Xem nhật ký container
docker logs evershop

# Theo dõi nhật ký thời gian thực
docker logs -f evershop

# Xem sử dụng tài nguyên
docker stats evershop
```

---

## Thực Hành Tốt Nhất

### Bảo Mật

- ✅ Không hardcode secret trong Dockerfile
- ✅ Dùng biến môi trường cho secret
- ✅ Cập nhật base image thường xuyên
- ✅ Quét image để tìm lỗ hổng: `docker scan evershop`

### Hiệu Năng

- ✅ Dùng Alpine images (nhỏ hơn, nhanh hơn)
- ✅ Tối ưu hóa cache layer
- ✅ Giới hạn tài nguyên trong production
- ✅ Health checks để giám sát

### Phát Triển

- ✅ Dùng volume mounts cho cập nhật nhanh
- ✅ Giữ node_modules trong volume để tránh xung đột
- ✅ Dùng `.dockerignore` để loại trừ file không cần thiết

---

## Tài Nguyên Hữu Ích

- **Tài Liệu Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Node.js Docker**: https://github.com/nodejs/docker-node
- **PostgreSQL Docker**: https://hub.docker.com/_/postgres

---

## Nhận Trợ Giúp

### Vấn Đề Thường Gặp

- **Vấn Đề Cổng**: Xem [Cổng Đã Được Sử Dụng](#cổng-đã-được-sử-dụng)
- **Kết Nối Cơ Sở Dữ Liệu**: Xem [Lỗi Kết Nối Cơ Sở Dữ Liệu](#lỗi-kết-nối-cơ-sở-dữ-liệu)
- **Quyền Tệp**: Xem [Lỗi Quyền Hạn Volume](#lỗi-quyền-hạn-volume)
- **Không Gian Ổ Cứng**: Xem [Vấn Đề Không Gian Ổ Cứng](#vấn-đề-không-gian-ổ-cứng)

### Tài Nguyên Cộng Đồng

- GitHub Issues: Đăng câu hỏi trong issues repository
- Docker Community: https://community.docker.com/
- Stack Overflow: Đặt thẻ câu hỏi với `docker` và `docker-compose`

---

**Cập Nhật Lần Cuối**: 2025
**Phiên Bản**: 1.0
