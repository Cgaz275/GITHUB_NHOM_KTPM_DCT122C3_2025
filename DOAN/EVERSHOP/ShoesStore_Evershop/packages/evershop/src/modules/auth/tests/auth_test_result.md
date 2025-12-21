# 📋 Báo Cáo Kết Quả Kiểm Thử Mô Đun Xác Thực (Auth Module)

---

## 📑 MỤC LỤC

1. [Tóm Tắt Kết Quả Thực Thi](#1-tóm-tắt-kết-quả-thực-thi)
2. [Báo Cáo Phạm Vi Kiểm Thử (Coverage)](#2-báo-cáo-phạm-vi-kiểm-thử-coverage)
3. [Chi Tiết Các Bài Kiểm Thử Thất Bại](#3-chi-tiết-các-bài-kiểm-thử-thất-bại)
   - [3.1 Nhóm Kiểm Thử: Tạo SessionStorage Store](#31-nhóm-kiểm-thử-tạo-sessionstorage-store)
   - [3.2 Nhóm Kiểm Thử: Cấu Hình resave](#32-nhóm-kiểm-thử-cấu-hình-resave)
   - [3.3 Nhóm Kiểm Thử: Cấu Hình saveUninitialized](#33-nhóm-kiểm-thử-cấu-hình-saveuninitialize)
   - [3.4 Nhóm Kiểm Thử: Xác Minh Gọi Mock](#34-nhóm-kiểm-thử-xác-minh-gọi-mock)
4. [Cảnh Báo Và Lỗi Console](#4-cảnh-báo-và-lỗi-console)
5. [Phân Tích Tóm Tắt Vấn Đề](#5-phân-tích-tóm-tắt-vấn-đề)
6. [Khuyến Nghị Và Giải Pháp](#6-khuyến-nghị-và-giải-pháp)

---

## 1. Tóm Tắt Kết Quả Thực Thi

### Thông Tin Chung
| Thông Tin | Giá Trị |
|-----------|--------|
| **Bộ Kiểm Thử (Test Suites)** | 1 thất bại, 9 thành công (10 tổng cộng) |
| **Số Bài Kiểm Thử (Tests)** | 12 thất bại, 93 thành công (105 tổng cộng) |
| **Snapshots** | 0 |
| **Thời Gian Thực Thi** | 4.534 giây |

### Phạm Vi Kiểm Thử (Coverage)
| Chỉ Số | Giá Trị |
|-------|--------|
| **Lệnh (Statements)** | 100% (60/60) |
| **Nhánh (Branches)** | 100% (12/12) |
| **Hàm (Functions)** | 100% (9/9) |
| **Dòng Code (Lines)** | 100% (60/60) |

⚠️ **Lưu ý**: Mặc dù phạm vi kiểm thử đạt 100%, nhưng có 12 bài kiểm thử thất bại.

---

## 2. Báo Cáo Phạm Vi Kiểm Thử (Coverage)

| Tên Tệp | % Lệnh | % Nhánh | % Hàm | % Dòng | Dòng Không Kiểm Thử |
|---------|--------|----------|-------|--------|-------------------|
| **Tất cả tệp** | **100** | **100** | **100** | **100** | - |
| `auth` | 100 | 100 | 100 | 100 | - |
| `auth/services` | 100 | 100 | 100 | 100 | - |
| └─ `getAdminSessionCookieName.ts` | 100 | 100 | 100 | 100 | - |
| └─ `getCookieSecret.ts` | 100 | 100 | 100 | 100 | - |
| └─ `getFrontStoreSessionCookieName.ts` | 100 | 100 | 100 | 100 | - |
| └─ `getSessionConfig.ts` | 100 | 100 | 100 | 100 | - |

---

## 3. Chi Tiết Các Bài Kiểm Thử Thất Bại

**Tệp Kiểm Thử**: `getSessionConfig.test.ts`

### 3.1 Nhóm Kiểm Thử: Tạo SessionStorage Store

#### ❌ Bài Kiểm Thử 1: [EXECUTION] Tạo sessionStorage store với kết nối pool

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 60 |
| **Giá Trị Mong Đợi** | `"MockSessionStore"` |
| **Giá Trị Thực Tế** | `"PGStore"` |
| **Mã Lỗi** | `expect(config.store.constructor.name).toBe('MockSessionStore')` |
| **Nguyên Nhân Gốc** | Store instance không được mock đúng cách; trả về `PGStore` thay vì `MockSessionStore` |

**Hệ Quả**: Mock không hoạt động chính xác, hàm thực tế được sử dụng thay vì phiên bản giả.

---

#### ❌ Bài Kiểm Thử 2: [EXECUTION] Truyền pool vào sessionStorage store constructor

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 66 |
| **Giá Trị Mong Đợi** | Pool property được định nghĩa |
| **Giá Trị Thực Tế** | `undefined` |
| **Mã Lỗi** | `expect(config.store.pool).toBeDefined()` |
| **Nguyên Nhân Gốc** | Pool không được truyền đến sessionStorage store constructor |

**Hệ Quả**: Cấu hình kết nối database không được truyền đúng cách.

---

### 3.2 Nhóm Kiểm Thử: Cấu Hình resave

#### ❌ Bài Kiểm Thử 3: [TRUE BRANCH] Sử dụng resave=true khi getConfig trả về true

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 88 |
| **Giá Trị Mong Đợi** | `true` |
| **Giá Trị Thực Tế** | `false` |
| **Mã Lỗi** | `expect(config.resave).toBe(true)` |
| **Nguyên Nhân Gốc** | Hàm `getSessionConfig` không sử dụng đúng mock `getConfig` cho cấu hình resave |

**Hệ Quả**: Cấu hình session không được áp dụng theo mong muốn.

---

#### ❌ Bài Kiểm Thử 4: [TRUE BRANCH] Đặt giá trị cấu hình resave chính xác

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 103 |
| **Giá Trị Mong Đợi** | `true` |
| **Giá Trị Thực Tế** | `false` |
| **Mã Lỗi** | `expect(config.resave).toBe(true)` |
| **Nguyên Nhân Gốc** | Giống bài kiểm thử 3; resave không được đặt thành true khi mong muốn |

---

#### ❌ Bài Kiểm Thử 5: [FALSE BRANCH] Sử dụng resave=false khi getConfig trả về false

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 119 |
| **Giá Trị Mong Đợi** | Mock được gọi với `'system.session.resave'`, `false` |
| **Giá Trị Thực Tế** | Không có lệnh gọi (0) |
| **Mã Lỗi** | `expect(mockGetConfig).toHaveBeenCalledWith('system.session.resave', false)` |
| **Nguyên Nhân Gốc** | Mock `getConfig` không được gọi bởi `getSessionConfig` |

**Hệ Quả**: Phần phụ thuộc không được sử dụng đúng cách.

---

### 3.3 Nhóm Kiểm Thử: Cấu Hình saveUninitialized

#### ❌ Bài Kiểm Thử 6: [TRUE BRANCH] Sử dụng saveUninitialized=true khi getConfig trả về true

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 157 |
| **Giá Trị Mong Đợi** | `true` |
| **Giá Trị Thực Tế** | `false` |
| **Mã Lỗi** | `expect(config.saveUninitialized).toBe(true)` |
| **Nguyên Nhân Gốc** | Hàm `getSessionConfig` không sử dụng đúng mock `getConfig` cho cấu hình saveUninitialized |

---

#### ❌ Bài Kiểm Thử 7: [TRUE BRANCH] Đặt giá trị cấu hình saveUninitialized chính xác

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 172 |
| **Giá Trị Mong Đợi** | `true` |
| **Giá Trị Thực Tế** | `false` |
| **Mã Lỗi** | `expect(config.saveUninitialized).toBe(true)` |
| **Nguyên Nhân Gốc** | Giống bài kiểm thử 6 |

---

#### ❌ Bài Kiểm Thử 8: [FALSE BRANCH] Sử dụng saveUninitialized=false khi getConfig trả về false

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 188 |
| **Giá Trị Mong Đợi** | Mock được gọi với `'system.session.saveUninitialized'`, `false` |
| **Giá Trị Thực Tế** | Không có lệnh gọi (0) |
| **Mã Lỗi** | `expect(mockGetConfig).toHaveBeenCalledWith('system.session.saveUninitialized', false)` |
| **Nguyên Nhân Gốc** | Mock `getConfig` không được gọi bởi `getSessionConfig` |

---

### 3.4 Nhóm Kiểm Thử: Xác Minh Gọi Mock

#### ❌ Bài Kiểm Thử 9: Gọi getConfig với khóa system.session.resave và giá trị mặc định false

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 220 |
| **Giá Trị Mong Đợi** | Mock được gọi với `'system.session.resave'`, `false` |
| **Giá Trị Thực Tế** | Không có lệnh gọi (0) |
| **Mã Lỗi** | `expect(mockGetConfig).toHaveBeenCalledWith('system.session.resave', false)` |
| **Nguyên Nhân Gốc** | Mock `getConfig` không được gọi |

---

#### ❌ Bài Kiểm Thử 10: Gọi getConfig với khóa system.session.saveUninitialized và giá trị mặc định false

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 228 |
| **Giá Trị Mong Đợi** | Mock được gọi với `'system.session.saveUninitialized'`, `false` |
| **Giá Trị Thực Tế** | Không có lệnh gọi (0) |
| **Mã Lỗi** | `expect(mockGetConfig).toHaveBeenCalledWith('system.session.saveUninitialized', false)` |
| **Nguyên Nhân Gốc** | Mock `getConfig` không được gọi |

---

#### ❌ Bài Kiểm Thử 11: Gọi getConfig đúng 2 lần cho mỗi lần gọi

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 236 |
| **Giá Trị Mong Đợi** | 2 lệnh gọi |
| **Giá Trị Thực Tế** | 0 lệnh gọi |
| **Mã Lỗi** | `expect(mockGetConfig).toHaveBeenCalledTimes(2)` |
| **Nguyên Nhân Gốc** | Hàm `getConfig` không được gọi từ `getSessionConfig` |

**Hệ Quả**: Hàm không sử dụng phần phụ thuộc mong muốn.

---

#### ❌ Bài Kiểm Thử 12: Gọi getConfig với các giá trị mặc định chính xác

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Vị Trí** | Dòng 245 |
| **Giá Trị Mong Đợi** | `true` |
| **Giá Trị Thực Tế** | `false` |
| **Mã Lỗi** | `expect(calls.some(call => call[0] === 'system.session.resave' && call[1] === false)).toBe(true)` |
| **Nguyên Nhân Gốc** | Mảng mock calls rỗng; `getConfig` không được gọi |

---

## 4. Cảnh Báo Và Lỗi Console

```
⚠️  WARNING: NODE_ENV value of 'test' did not match any deployment config file names.
    at _warnOrThrow (node_modules/config/lib/config.js:1494:13)

⚠️  WARNING: See https://github.com/node-config/node-config/wiki/Strict-Mode
    at _warnOrThrow (node_modules/config/lib/config.js:1495:13)

⚠️  WARNING: No configurations found in configuration directory:
    D:\CGA\1.STUDY\SGU\Testing\Github Clone\GITHUB_NHOM_KTPM_DCT122C3_2025\DOAN\EVERSHOP\ShoesStore_Evershop\config
    at Object.<anonymous> (node_modules/config/lib/config.js:1523:11)

⚠️  WARNING: To disable this warning set SUPPRESS_NO_CONFIG_WARNING in the environment.
    at Object.<anonymous> (node_modules/config/lib/config.js:1524:11)
```

**Ý Nghĩa Cảnh Báo**:
- Không tìm thấy tệp cấu hình cho chế độ `test`
- Thư mục cấu hình không tồn tại hoặc rỗng
- Cần thiết lập biến môi trường hoặc tạo tệp cấu hình phù hợp

---

## 5. Phân Tích Tóm Tắt Vấn Đề

### 🔴 Vấn Đề Chính Được Xác Định

#### 1. Vấn Đề Mock Cấu Hình
**Mô Tả**: Hàm `getSessionConfig` không mock hoặc sử dụng đúng phần phụ thuộc `getConfig`

**Ảnh Hưởng**:
- Mock `getConfig` không được gọi
- Tất cả 6 bài kiểm thử liên quan đến `getConfig` đều thất bại
- Cấu hình không được lấy từ mock

---

#### 2. Vấn Đề Mock Store
**Mô Tả**: SessionStorage store trả về `PGStore` thay vì `MockSessionStore`

**Ảnh Hưởng**:
- Kết nối database thực tế được sử dụng trong kiểm thử (không nên)
- Pool connection không được truyền đúng cách
- 2 bài kiểm thử liên quan đến store thất bại

---

#### 3. Vấn Đề Xử Lý Giá Trị Cấu Hình
**Mô Tả**: Các giá trị cấu hình boolean `resave` và `saveUninitialized` không được áp dụng chính xác

**Ảnh Hưởng**:
- Luôn trả về `false` thay vì giá trị được cấu hình
- 4 bài kiểm thử liên quan đến cấu hình này thất bại

---

#### 4. Vấn Đề Injection Phần Phụ Thuộc
**Mô Tả**: Mock `getConfig` không được gọi từ `getSessionConfig`, gợi ý hàm không sử dụng mock dependency

**Ảnh Hưởng**:
- Hàm có thể sử dụng `getConfig` thực tế
- Cần kiểm tra cách nhập (import) hoặc tiêm (inject) phần phụ thuộc

---

### 📊 Phân Bổ Lỗi

| Loại Lỗi | Số Lượng Bài Kiểm Thử | Tỷ Lệ |
|----------|----------------------|-------|
| Liên quan `getConfig` mock | 6 | 50% |
| Liên quan `store` mock | 2 | 16.7% |
| Liên quan cấu hình `resave`/`saveUninitialized` | 4 | 33.3% |
| **Tổng** | **12** | **100%** |

---

## 6. Khuyến Nghị Và Giải Pháp

### 🔧 Các Bước Khắc Phục

#### **Bước 1: Kiểm Tra Cấu Hình Mock trong Tệp Kiểm Thử**
```typescript
// Kiểm tra:
// 1. Jest setup và mock configuration
// 2. Cách gọi jest.mock() cho getConfig
// 3. Cách định nghĩa mockGetConfig
```

**Hành Động**: 
- Xem lại phần setup của tệp kiểm thử
- Đảm bảo `jest.mock()` được gọi trước khi import hàm thực tế
- Xác nhận mock được cấu hình trong `beforeEach` hoặc `beforeAll`

---

#### **Bước 2: Xác Minh Import/Injection trong getSessionConfig.ts**
```typescript
// Cần đảm bảo:
// 1. getConfig được import từ đúng vị trí
// 2. getConfig được sử dụng (gọi) trong hàm
// 3. Không có caching hoặc tham chiếu trực tiếp gây vấn đề
```

**Hành Động**:
- Kiểm tra cách `getConfig` được import trong `getSessionConfig.ts`
- Đảm bảo `getConfig` được gọi khi tính toán `resave` và `saveUninitialized`
- Xác nhận không có caching làm hỏng mock

---

#### **Bước 3: Kiểm Tra Logic Thực Thi trong getSessionConfig**
```typescript
// Hàm phải:
// 1. Gọi getConfig('system.session.resave', false)
// 2. Gọi getConfig('system.session.saveUninitialized', false)
// 3. Sử dụng các giá trị trả về cho cấu hình
```

**Hành Động**:
- Xem lại logic xử lý `resave` trong hàm
- Xem lại logic xử lý `saveUninitialized` trong hàm
- Đảm bảo kết quả từ `getConfig` được sử dụng cho giá trị

---

#### **Bước 4: Xác Nhận Việc Tạo Store**
```typescript
// Store phải:
// 1. Được tạo từ mock trong môi trường kiểm thử
// 2. Nhận pool connection làm tham số
// 3. Được gán cho config.store
```

**Hành Động**:
- Kiểm tra logic tạo store trong `getSessionConfig.ts`
- Đảm bảo pool được truyền vào constructor
- Xác minh mock store được sử dụng thay vì `PGStore` thực tế

---

#### **Bước 5: Xử Lý Cảnh Báo NODE_ENV**
**Các Tùy Chọn**:
- Tạo tệp cấu hình `config/test.json`
- Hoặc thiết lập `SUPPRESS_NO_CONFIG_WARNING=true` trong `.env.test`
- Hoặc thiết lập trong `jest.config.js`

---

### ✅ Danh Sách Kiểm Tra Sửa Chữa

- [ ] Xác minh `jest.mock()` gọi đúng vị trí
- [ ] Kiểm tra `beforeEach` reset mock
- [ ] Xác nhận `getConfig` được import từ đúng module
- [ ] Xác minh `getConfig` được gọi 2 lần trong hàm
- [ ] Kiểm tra giá trị trả về được sử dụng cho `resave`
- [ ] Kiểm tra giá trị trả về được sử dụng cho `saveUninitialized`
- [ ] Xác minh store mock được sử dụng
- [ ] Kiểm tra pool được truyền vào store
- [ ] Xử lý cảnh báo NODE_ENV
- [ ] Chạy lại kiểm thử sau khi sửa chữa

---

### 📝 Ghi Chú Quan Trọng

1. **Phạm Vi Kiểm Thử 100%** không đảm bảo tính chính xác của logic
   - Tất cả dòng được thực thi, nhưng không đúng cách (với mock)
   
2. **Lỗi Cache Mock** là nguyên nhân phổ biến
   - Đảm bảo mock được reset trong mỗi kiểm thử
   
3. **Thứ Tự Import Quan Trọng**
   - Mock phải được thiết lập trước khi import hàm được kiểm thử
