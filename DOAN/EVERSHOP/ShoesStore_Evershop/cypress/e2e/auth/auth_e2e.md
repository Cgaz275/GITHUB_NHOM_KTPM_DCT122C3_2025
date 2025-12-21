# Tài Liệu Kiểm Thử E2E (End-to-End) - Xác Thực (Authentication)

## 📋 Luồng Chính (Main Flows)

Hệ thống Evershop có **2 luồng xác thực riêng biệt**: một cho **Khách Hàng** (Customer) và một cho **Quản Trị Viên** (Admin).

### 🛒 Luồng Xác Thực Khách Hàng (Customer Login Flow)

```
1. Khách hàng truy cập trang đăng nhập (/account/login)
                    ↓
2. Điền email và mật khẩu vào form
                    ↓
3. Gửi yêu cầu đăng nhập tới server
                    ↓
4. Server xác thực thông tin đăng nhập
   ├─ Nếu hợp lệ: Tạo session, chuyển hướng đến trang chủ
   └─ Nếu không hợp lệ: Trả về lỗi, khách ở lại trang login
                    ↓
5. Khách hàng truy cập các trang cá nhân (account, addresses, orders)
                    ↓
6. Khi muốn thoát: Nhấn "Logout/Sign Out"
                    ↓
7. Server xóa session, chuyển hướng về trang login
```

**Thông tin xác thực test (Khách Hàng):**
- Email: `cga@gmail.com`
- Mật khẩu: `a12345678`

**Đường dẫn chính:**
- Trang đăng nhập: `/account/login`
- Trang tài khoản: `/account`
- API xác thực: `/api/customerLoginJson`

**Vị trí Logout Button:**
- Trang `/account` trong phần "Account Information" (link "Logout")

---

### 👨‍💼 Luồng Xác Thực Quản Trị Viên (Admin Login Flow)

```
1. Quản trị viên truy cập trang đăng nhập (/admin/login)
                    ↓
2. Điền email và mật khẩu vào form
                    ↓
3. Gửi yêu cầu đăng nhập tới server
                    ↓
4. Server xác thực thông tin đăng nhập
   ├─ Nếu hợp lệ: Tạo session/token, chuyển hướng đến trang chủ admin
   └─ Nếu không hợp lệ: Trả về lỗi, quản trị viên ở lại trang login
                    ↓
5. Quản trị viên truy cập các trang admin được bảo vệ
                    ↓
6. Khi muốn thoát: Nhấn đăng xuất
                    ↓
7. Server xóa session, chuyển hướng về trang login
```

**Thông tin xác thực test (Admin):**
- Email: `alanewiston2@gmail.com`
- Mật khẩu: `a12345678`

**Đường dẫn chính:**
- Trang đăng nhập: `/admin/login`
- Trang quản trị: `/admin`
- API xác thực: `/api/auth/*`

**Vị trí Logout Button:**
- Header phải trong dropdown avatar (icon người dùng) - link "Logout"

---

## 📁 Tập Tin Kiểm Thử

### ⭐ Kiểm Thử Khách Hàng (Customer Tests)

#### 1. **customer-login.cy.js** - Kiểm Thử Đăng Nhập Khách Hàng

Kiểm thử trang đăng nhập khách hàng và gửi form.

| Hạng Mục Test | Chi Tiết | Kỳ Vọng |
|---|---|---|
| **Đăng nhập thành công** | Đăng nhập với thông tin hợp lệ | Được chuyển hướng tới homepage |
| | Xác nhận trạng thái đăng nhập | Session được tạo |
| | Tính bền vững sau reload | Vẫn đăng nhập sau F5 |
| **Xác thực Form** | Email không hợp lệ | Hiển thị lỗi xác thực |
| | Mật khẩu trống | Form không được gửi |
| | Cả hai trường trống | Form không được gửi |
| **Lỗi Đăng Nhập** | Email không tồn tại | Vẫn ở trang login, hiển thị lỗi |
| | Mật khẩu sai | Vẫn ở trang login, hiển thị lỗi |
| | Thử lại sau lỗi | Cho phép nhập lại và đăng nhập thành công |
| **Hành Vi Trường Input** | Xóa nội dung email | Trường email trở thành trống |
| | Ký tự đặc biệt | Chấp nhận ký tự đặc biệt |
| | Giá trị được bảo toàn | Giá trị input vẫn còn sau lỗi |
| **Yếu Tố Giao Diện** | Form đăng nhập hiển thị | Trang login tải thành công |
| | Các trường input có sẵn | Email và password input hiển thị |
| | Nút "Sign In" | Nút đăng nhập hiển thị và có thể nhấn |
| | Liên kết đăng ký | Liên kết "Create an account" hoạt động |
| | Liên kết quên mật khẩu | Liên kết "Forgot password" hoạt động |
| **Truy Cập Trang Login** | Truy cập từ URL | Trang /account/login tải được |
| | Tải trang không lỗi | Không có lỗi JS trong console |
| **Quản Lý Phiên** | Session cookie tồn tại | Sau đăng nhập, cookie sessionid có mặt |
| | Trạng thái xác thực duy trì | Vẫn đăng nhập sau reload |
| | Xóa session sau logout | Cookie bị xóa sau đăng xuất |
| **Xử Lý Lỗi** | Lỗi mạng | Hiển thị thông báo lỗi |
| | Không có lỗi khi thành công | Không hiển thị lỗi nếu đăng nhập thành công |
| **Chuyển Trang** | Trang đăng ký | Có thể điều hướng tới trang register |
| | Trang quên mật khẩu | Có thể điều hướng tới trang reset password |
| **Phân Biệt Chữ Hoa/Thường** | Email | Có thể insensitive hoặc sensitive |
| | Mật khẩu phân biệt | 'A12345678' ≠ 'a12345678' |

**Số lượng test:** 36 test

#### 2. **customer-logout.cy.js** - Kiểm Thử Đăng Xuất Khách Hàng

Kiểm thử quá trình đăng xuất khách hàng từ trang `/account` và xóa phiên.

**Vị trí Logout Button:** Trang `/account` trong phần "Account Information"

| Hạng Mục Test | Chi Tiết | Kỳ Vọng |
|---|---|---|
| **Đăng xuất thành công** | Nhấn liên kết logout trên trang /account | Chuyển hướng về trang /account/login |
| | Session bị xóa | Cookie sessionid = null |
| | Không truy cập được trang account | /account chuyển hướng tới /account/login |
| | Cho phép đăng nhập lại | Có thể đăng nhập thành công sau đó |
| **Giao Diện Đăng Xuất** | Logout link hiển thị | Link "Logout" hiển thị trong Account Information |
| | Liên kết có thể nhấn | Không bị vô hiệu hóa |
| **Đăng Xuất Từ Trang Account** | Từ trang /account | Chuyển tới /account/login |
| | Trạng thái tồn tại sau reload | Vẫn ở trang login sau F5 |
| **Xóa Dữ Liệu Phiên** | Cookie bị xóa | Session cookie = null |
| | Dữ liệu user bị xóa | Không còn dữ liệu user lưu trữ |
| **Xử Lý Lỗi Logout** | API bị lỗi 500 | Vẫn chuyển tới login |
| | Request timeout | Vẫn chuyển tới login |
| **Ngăn Chặn Truy Cập** | Browser back button | Không quay lại trang account |
| | Cached account page | Truy cập cache được redirect tới login |
| **Logout Lại Xác Thực** | Yêu cầu nhập lại mật khẩu | Form login trống |
| | Cho phép login với cùng tài khoản | Có thể đăng nhập lại |

**Số lượng test:** 22 test

---

### 👨‍💼 Kiểm Thử Quản Trị Viên (Admin Tests)

#### 3. **admin-login.cy.js** - Kiểm Thử Chức Năng Đăng Nhập Admin

Kiểm thử trang đăng nhập admin và gửi form.

| Hạng Mục Test | Chi Tiết | Kỳ Vọng |
|---|---|---|
| **Đăng nhập thành công** | Đăng nhập với thông tin hợp lệ | Được chuyển hướng tới trang admin, hiển thị trang chủ |
| | Xác nhận trạng thái đăng nhập | Session được tạo, cookie được lưu trữ |
| | Tính bền vững sau reload | Vẫn ở trang admin sau F5 |
| **Xác thực Form** | Email không hợp lệ | Hiển thị lỗi xác thực |
| | Mật khẩu trống | Form không được gửi |
| | Cả hai trường trống | Form không được gửi |
| | Thông báo bắt buộc | Hiển thị "Trường này bắt buộc" |
| **Lỗi Đăng Nhập** | Email không tồn tại | Vẫn ở trang login, hiển thị lỗi |
| | Mật khẩu sai | Vẫn ở trang login, hiển thị lỗi |
| | Thử lại sau lỗi | Cho phép nhập lại và đăng nhập thành công |
| **Hành Vi Trường Input** | Xóa nội dung email | Trường email trở thành trống |
| | Ký tự đặc biệt | Chấp nhận ký tự đặc biệt |
| | Giá trị được bảo toàn | Giá trị input vẫn còn sau lỗi |
| **Yếu Tố Giao Diện** | Form đăng nhập hiển thị | Trang login tải thành công |
| | Các trường input có sẵn | Email và password input hiển thị |
| | Nút "SIGN IN" | Nút đăng nhập hiển thị và có thể nhấn |
| | Nhãn trường | "Email" và "Password" label hiển thị |
| **Truy Cập Trang Login** | Truy cập từ URL | Trang /admin/login tải được |
| | Chuyển hướng khi chưa đăng nhập | /admin chuyển hướng tới /admin/login |
| | Tải trang không lỗi | Không có lỗi JS trong console |
| **Quản Lý Phiên** | Session cookie tồn tại | Sau đăng nhập, cookie sessionid có mặt |
| | Trạng thái xác thực duy trì | Vẫn đăng nhập sau reload |
| | Xóa session sau logout | Cookie bị xóa sau đăng xuất |
| **Tương Tác Trình Duyệt** | Nút Back | Không quay lại trang login |
| | Ngăn truy cập trực tiếp | Trang admin yêu cầu login |
| | Reload trang | Vẫn giữ trạng thái đăng nhập |
| **Xử Lý Lỗi** | Lỗi mạng | Hiển thị thông báo lỗi, form vẫn có sẵn |
| | Không có lỗi khi thành công | Không hiển thị lỗi nếu đăng nhập thành công |
| **Phân Biệt Chữ Hoa/Thường** | Email không phân biệt | UPPERCASE@EMAIL.COM = uppercase@email.com |
| | Mật khẩu phân biệt | 'A12345678' ≠ 'a12345678' |

**Số lượng test:** 38 test

#### 4. **admin-logout.cy.js** - Kiểm Thử Chức Năng Đăng Xuất Admin

Kiểm thử quá trình đăng xuất admin và xóa phiên.

| Hạng Mục Test | Chi Tiết | Kỳ Vọng |
|---|---|---|
| **Đăng xuất thành công** | Nhấn nút đăng xuất | Chuyển hướng về trang login |
| | Session bị xóa | Cookie sessionid = null |
| | Không truy cập được trang admin | /admin chuyển hướng tới /admin/login |
| | Cho phép đăng nhập lại | Có thể đăng nhập thành công sau đó |
| **Giao Diện Đăng Xuất** | Avatar hiển thị | Avatar/icon người dùng hiển thị |
| | Menu dropdown xuất hiện | Khi nhấn avatar, dropdown mở |
| | Tùy chọn "Logout" | Hiển thị liên kết "Logout" |
| | Nút Logout có thể nhấn | Không bị vô hiệu hóa |
| **Đăng Xuất Từ Các Trang** | Từ trang admin | Chuyển tới login |
| | Từ trang users | Chuyển tới login |
| | Trạng thái tồn tại sau reload | Vẫn ở trang login sau F5 |
| **Xóa Dữ Liệu Phiên** | Cookie bị xóa | Tất cả session cookie = null |
| | Token được xóa | localStorage/sessionStorage token xóa |
| | Dữ liệu user bị xóa | Không còn dữ liệu user lưu trữ |
| **Xử Lý Lỗi Logout** | API bị lỗi 500 | Vẫn chuyển tới login |
| | Request timeout | Vẫn chuyển tới login |
| **Đăng Xuất Nhanh** | Nhấp nhiều lần | Chỉ đăng xuất một lần, không lỗi |
| **Nút Logout** | Trạng thái kích hoạt | Nút "Logout" không bị vô hiệu |
| | Kiểu dáng | Cursor = pointer |

**Số lượng test:** 29 test

#### 5. **admin-access-control.cy.js** - Kiểm Thử Kiểm Soát Truy Cập Admin

Kiểm thử ủy quyền và truy cập trang được bảo vệ.

| Hạng Mục Test | Chi Tiết | Kỳ Vọng |
|---|---|---|
| **Trang Admin Được Bảo Vệ** | Truy cập /admin không login | Chuyển hướng tới /admin/login |
| | Truy cập /admin/dashboard không login | Chuyển hướng tới /admin/login |
| | Đăng nhập rồi truy cập /admin | Được phép, hiển thị dashboard |
| | Đăng nhập rồi truy cập /admin/dashboard | Được phép, không lỗi |
| **Cố Gắng Truy Cập Trái Phép** | Quản lý người dùng | Chuyển tới login |
| | Quản lý sản phẩm | Chuyển tới login |
| | Cài đặt | Chuyển tới login |
| | API endpoint admin | Trả về 401 hoặc 403 |
| **Truy Cập Trang Login** | Chưa đăng nhập | Có thể truy cập /admin/login |
| | Đã đăng nhập | Có thể truy cập (có thể redirect) |
| **Kiểm Soát Phiên** | Session hợp lệ | Được phép truy cập |
| | Session hết hạn | Chuyển tới login |
| | Xóa cookie | Không truy cập được /admin |
| | Phải đăng nhập lại | Cho phép đăng nhập sau khi session hết |
| **Bảo Vệ CSRF** | Xác thực token | Form chứa CSRF protection |
| | Request POST không hợp lệ | Bị từ chối (401, 403, 400) |
| **Nội Dung Trang Admin** | Dashboard hiển thị | Sau login, dashboard tải |
| | Nội dung admin ẩn | Người dùng chưa login không thấy nội dung |
| | Điều hướng giữa các trang | Có thể điều hướng mà không logout |
| **API Endpoints Được Bảo Vệ** | Request không được xác thực | Trả về 401 hoặc 403 |
| | Request được xác thực | Không trả về 401 hoặc 403 |
| | JWT token không hợp lệ | Trả về 401 hoặc 403 |

**Số lượng test:** 44 test

#### 6. **auth-flow.cy.js** - Kiểm Thử Luồng Xác Thực Hoàn Chỉnh

Kiểm thử toàn bộ quy trình xác thực admin.

**Số lượng test:** 47 test

#### 7. **auth-security.cy.js** - Kiểm Thử Bảo Mật Xác Thực

Kiểm thử các lỗ hổng bảo mật xác thực.

**Số lượng test:** 41 test

---

## 🚀 Cách Chạy Các Test

### Chạy Toàn Bộ Test Authentication:
```bash
npm run cy:open
# Hoặc từ dòng lệnh:
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js"
```

### Chạy Test Khách Hàng:
```bash
npx cypress run --spec "cypress/e2e/auth/customer-*.cy.js"
```

### Chạy Test Admin:
```bash
npx cypress run --spec "cypress/e2e/auth/admin-*.cy.js"
npx cypress run --spec "cypress/e2e/auth/auth-*.cy.js"
```

### Chạy Test Riêng Lẻ:
```bash
# Customer tests
npx cypress run --spec "cypress/e2e/auth/customer-login.cy.js"
npx cypress run --spec "cypress/e2e/auth/customer-logout.cy.js"

# Admin tests
npx cypress run --spec "cypress/e2e/auth/admin-login.cy.js"
npx cypress run --spec "cypress/e2e/auth/admin-logout.cy.js"
npx cypress run --spec "cypress/e2e/auth/admin-access-control.cy.js"
npx cypress run --spec "cypress/e2e/auth/auth-flow.cy.js"
npx cypress run --spec "cypress/e2e/auth/auth-security.cy.js"
```

### Chạy Ở Chế Độ Headless:
```bash
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js" --headless
```

### Chạy Với Trình Duyệt Chrome:
```bash
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js" --browser chrome
```

### Chạy Với Reporter:
```bash
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js" --reporter junit
```

---

## ⚙️ Cấu Hình Test

### Cấu Hình Cypress:
- **Base URL**: `http://localhost:3000` (cấu hình qua `CYPRESS_BASE_URL`)
- **Viewport**: 1280x720
- **Default Timeout**: 10000ms
- **Request Timeout**: 10000ms
- **Response Timeout**: 10000ms

### Thông Tin Đăng Nhập Test:

**Khách Hàng:**
- Email: `cga@gmail.com`
- Mật khẩu: `a12345678`

**Quản Trị Viên:**
- Email: `alanewiston2@gmail.com`
- Mật khẩu: `a12345678`

Có thể ghi đè qua biến môi trường:
```bash
CYPRESS_ADMIN_EMAIL=your@email.com CYPRESS_ADMIN_PASSWORD=password npm run cy:run
```

---

## 📊 Thống Kê Test

| Thông Số | Giá Trị |
|---|---|
| **Tổng số file test** | 7 file |
| **Tổng số test** | ~257 test |
| **Test khách hàng** | ~58 test (2 files) |
| **Test quản trị viên** | ~199 test (5 files) |
| **Các lĩnh vực coverage** | Login, Logout, Access Control, Flow, Security |
| **Thời gian chạy (headless)** | ~8-15 phút |

---

## 🔧 Biến Môi Trường

Cấu hình hành vi test qua các biến môi trường:

```bash
# Cấu Hình Cơ Sở Dữ Liệu (cho seeding)
DB_HOST=localhost
DB_PORT=5433
DB_NAME=evershop2
DB_USER=postgres
DB_PASSWORD=123

# Cấu Hình Cypress
CYPRESS_BASE_URL=http://localhost:3000
CYPRESS_DEFAULT_COMMAND_TIMEOUT=10000
CYPRESS_ADMIN_EMAIL=alanewiston2@gmail.com
CYPRESS_ADMIN_PASSWORD=a12345678
CYPRESS_CUSTOMER_EMAIL=cga@gmail.com
CYPRESS_CUSTOMER_PASSWORD=a12345678
```

---

## 🔗 Các File Liên Quan

**Module Khách Hàng:**
- `packages/evershop/src/modules/customer/pages/frontStore/login/`
- `packages/evershop/src/modules/customer/services/customer/loginCustomerWithEmail.ts`

**Module Quản Trị:**
- `packages/evershop/src/modules/auth/pages/admin/adminLogin/`
- `packages/evershop/src/modules/auth/services/loginUserWithEmail.ts`

**Cypress Config:**
- `cypress.config.js`
- `cypress/support/e2e.js`
- `cypress/support/commands.js`

**Database Seed:**
- `cypress/plugins/seedTestAdmin.js`

**Environment:**
- `.env`, `.env.example`

---

## 📚 Tài Liệu Tham Khảo

- [Cypress Documentation](https://docs.cypress.io)
- [Evershop Documentation](https://www.evershop.io/docs)
- [Customer Module](../../../packages/evershop/src/modules/customer/)
- [Authentication Module](../../../packages/evershop/src/modules/auth/)
