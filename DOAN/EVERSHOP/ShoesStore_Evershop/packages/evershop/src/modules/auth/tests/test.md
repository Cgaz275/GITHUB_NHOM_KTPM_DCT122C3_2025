# Tài Liệu Kiểm Thử Module Xác Thực (Auth)

## Mục Đích

Tài liệu này mô tả chi tiết về cấu trúc, kịch bản kiểm thử và các trường hợp sử dụng cho module xác thực (Auth) trong hệ thống Evershop. Module này quản lý việc đăng nhập, đăng xuất, quản lý token JWT, và kiểm soát quyền truy cập của người dùng.

---

## Cấu Trúc Thư Mục

```
src/modules/auth/
├── tests/
│   ├── test.md                                    # Tài liệu kiểm thử (file này)
│   ├── unit/
│   │   ├── bootstrap.test.ts                      # Test khởi tạo và gắn method vào request
│   │   ├── loginUserWithEmail.test.ts             # Test dịch vụ đăng nhập
│   │   ├── logoutUser.test.ts                     # Test dịch vụ đăng xuất
│   │   ├── authMiddleware.test.ts                 # Test middleware xác thực
│   │   ├── getAdminSessionCookieName.test.ts      # Test lấy tên cookie phiên admin
│   │   ├── getCookieSecret.test.ts                # Test lấy secret cookie
│   │   ├── getFrontStoreSessionCookieName.test.ts # Test lấy tên cookie phiên cửa hàng
│   │   └── getSessionConfig.test.ts               # Test cấu hình phiên làm việc
│   └── integration/
│       ├── generateToken.test.ts                  # Test tạo token JWT
│       └── refreshToken.test.ts                   # Test làm mới token
├── services/
│   ├── loginUserWithEmail.ts                      # Dịch vụ xác thực email/mật khẩu
│   ├── logoutUser.ts                              # Dịch vụ đăng xuất
│   ├── getSessionConfig.ts                        # Cấu hình phiên làm việc
│   ├── getAdminSessionCookieName.ts               # Lấy tên cookie phiên admin
│   ├── getCookieSecret.ts                         # Lấy secret cookie
│   ├── getFrontStoreSessionCookieName.ts          # Lấy tên cookie phiên cửa hàng
│   └── ... (các dịch vụ khác)
├── api/
│   ├── getUserToken/                              # API tạo token
│   ├── refreshUserToken/                          # API làm mới token
│   └── global/                                    # Middleware toàn cục
├── bootstrap.ts                                   # Khởi tạo module, gắn method vào request
├── pages/                                         # Các trang liên quan đến xác thực
└── graphql/                                       # Các resolver GraphQL
```

---

## Phân Loại Kiểm Thử

### 1. Unit Test (Kiểm Thử Đơn Vị)

Kiểm thử các hàm riêng lẻ, dịch vụ và logic nghiệp vụ mà không phụ thuộc vào các thành phần khác.

#### Test Files:
- `unit/bootstrap.test.ts`
- `unit/loginUserWithEmail.test.ts`
- `unit/logoutUser.test.ts`
- `unit/authMiddleware.test.ts`
- `unit/getAdminSessionCookieName.test.ts`
- `unit/getCookieSecret.test.ts`
- `unit/getFrontStoreSessionCookieName.test.ts`
- `unit/getSessionConfig.test.ts`

### 2. Integration Test (Kiểm Thử Tích Hợp)

Kiểm thử sự tương tác giữa nhiều thành phần, bao gồm API handler, middleware và dịch vụ cơ sở dữ liệu.

#### Test Files:
- `integration/generateToken.test.ts`
- `integration/refreshToken.test.ts`

---

## Chi Tiết Các Test Suite

### Test Suite 1: bootstrap.test.ts

**Mục đích:** Kiểm thử khởi tạo module auth, gắn các method vào express.request object bao gồm loginUserWithEmail, logoutUser, isUserLoggedIn, getCurrentUser.

**Số lượng test case:** 15

#### Test Cases - Method Attachment (1 case):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Attach all four methods | Gắn 4 method vào request khi bootstrap được gọi | Tất cả 4 method được define trên request object |

#### Test Cases - loginUserWithEmail Method (3 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Execute with session.save | Thực thi với session.save callback | session.userID được set, locals.user được set, session.save được gọi |
| Not call session.save if null | Xử lý khi session null | session.save không được gọi |
| Call session.save with callback | Gọi session.save với callback tùy chỉnh | session.save được gọi với callback đã cung cấp |

#### Test Cases - logoutUser Method (3 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Execute with session.save | Thực thi logout | session.userID = undefined, locals.user = undefined, session.save gọi |
| Not call session.save if null | Xử lý khi session null | session.save không được gọi |
| Call session.save with callback | Gọi session.save với callback | session.save được gọi với callback |

#### Test Cases - isUserLoggedIn Method (4 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return true for truthy userID | Kiểm tra userID truthy (123) | Trả về true |
| Return false for falsy values | Kiểm tra userID falsy (undefined, null, 0, '', false) | Trả về false |
| Return true for various truthy values | Kiểm tra với nhiều giá trị truthy (1, 123, 'uuid-123', 'admin', true) | Trả về true |

#### Test Cases - getCurrentUser Method (5 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return user object | Trả về user object từ locals | Trả về user data |
| Return undefined when not set | User undefined | Trả về undefined |
| Return null when null | User = null | Trả về null |
| Return user with properties | User có multiple properties | Trả về user đầy đủ với tất cả properties |

#### Test Cases - Complete Workflow (1 case):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Login, check status, logout | Quy trình đầu đủ login → kiểm tra → logout | isUserLoggedIn, getCurrentUser thay đổi theo phiên |

**Mock Dependencies:**
- `express.request`: request object
- `../../services/loginUserWithEmail.js`: loginUserWithEmail function
- `../../services/logoutUser.js`: logoutUser function

**Ví dụ chạy test:**
```bash
npm test -- unit/bootstrap.test.ts
```

---

### Test Suite 2: loginUserWithEmail.test.ts

**Mục đích:** Kiểm thử dịch vụ xác thực người dùng bằng email và mật khẩu, bao gồm xử lý email, user object, session setup và error scenarios.

**Số lượng test case:** 13

#### Test Cases - Email Processing (4 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Escape single percent sign | Email chứa ký tự `%` | Email được escape: `user%test@example.com` → `user\%test@example.com` |
| Escape multiple percent signs | Email chứa nhiều `%` | Email được escape: `test%%user@example.com` → `test\%\%user@example.com` |
| No special characters | Email bình thường | Không bị thay đổi: `user@example.com` |
| Empty email | Email rỗng | Trả về chuỗi rỗng |

#### Test Cases - User Object Processing (2 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Remove password from user | Xóa password sau login | `user.password` là undefined, các field khác giữ nguyên |
| Preserve user properties | Giữ các properties ngoài password | Object có `admin_user_id`, `email`, `status`, `uuid` nhưng không có `password` |

#### Test Cases - Session Setup (4 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Set session userID | Set userID vào session | `session.userID` bằng `admin_user_id` (1) |
| Update existing session | Cập nhật userID hiện tại | `session.userID` thay đổi từ giá trị cũ sang giá trị mới |
| Handle various user IDs | Xử lý nhiều userID khác nhau | `session.userID` khớp với ID được set (1, 5, 10, 999, 123456) |
| Store user in locals | Lưu user vào request.locals.user | `locals.user.admin_user_id` và `locals.user.email` có giá trị đúng |

#### Test Cases - Error Scenarios (5 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Detect inactive user | Kiểm tra user status = 0 | `isActive` trả về false |
| Detect active user | Kiểm tra user status = 1 | `isActive` trả về true |
| Validate email format | Kiểm tra email format hợp lệ | Valid: `admin@example.com`, Invalid: `invalid.email` hoặc `user@domain` |

**Mock Dependencies:**
- `@evershop/postgres-query-builder`: select() builder
- `../../../lib/postgres/connection`: pool connection
- `../../../lib/util/passwordHelper`: comparePassword()

**Ví dụ chạy test:**
```bash
npm test -- unit/loginUserWithEmail.test.ts
```

---

### Test Suite 3: logoutUser.test.ts

**Mục đích:** Kiểm thử dịch vụ đăng xuất và xóa phiên làm việc.

**Số lượng test case:** 4

#### Test Cases:

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Clear session userID | Đăng xuất xóa session | session.userID được set thành undefined |
| Clear locals user | Đăng xuất xóa user từ locals | locals.user được set thành undefined |
| Handle undefined session | Xử lý khi session undefined | Throw lỗi |
| Clear both values | Đảm bảo cả session và locals được xóa | Cả session.userID và locals.user đều undefined |

**Mock Dependencies:** Không cần mock (hàm đơn giản)

**Ví dụ chạy test:**
```bash
npm test -- unit/logoutUser.test.ts
```

---

### Test Suite 4: authMiddleware.test.ts

**Mục đích:** Kiểm thử middleware xác thực quyền truy cập dựa trên vai trò.

**Số lượng test case:** 6

#### Test Cases:

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Public route access | Truy cập route công khai | next() được gọi, không yêu cầu xác thực |
| Private route no auth | Truy cập route private mà không xác thực | HTTP 401 (UNAUTHORIZED) |
| No UUID | User không có UUID | HTTP 401 |
| Wildcard roles | User có vai trò wildcard (*) | next() được gọi |
| Role match | User có vai trò khớp với route required | next() được gọi |
| Role mismatch | User không có vai trò khớp | HTTP 401 |

**Mock Dependencies:**
- `request.getCurrentUser()`: Trả về user object hoặc null

**Ví dụ chạy test:**
```bash
npm test -- unit/authMiddleware.test.ts
```

---

### Test Suite 5: getAdminSessionCookieName.test.ts

**Mục đích:** Kiểm thử hàm lấy tên cookie phiên admin, bao gồm giá trị mặc định và cấu hình tùy chỉnh.

**Số lượng test case:** 7

#### Test Cases - Default Value Behavior (2 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return default when not configured | Không có cấu hình | Trả về 'asid' |
| Use default "asid" as fallback | Sử dụng default | Trả về 'asid' |

#### Test Cases - Custom Configuration (2 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return custom value when configured | Có cấu hình tùy chỉnh | Trả về 'custom_admin_session_id' |
| Handle various custom values | Nhiều giá trị khác nhau | Trả về 'admin_sid', 'admin_token', 'session_admin_123' |

#### Test Cases - getConfig Call Verification (3 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Call getConfig with correct key | Kiểm tra key parameter | Gọi với key 'system.session.adminCookieName' |
| Call getConfig exactly once | Kiểm tra số lần gọi | Gọi đúng 1 lần |
| Pass correct default value | Kiểm tra default parameter | Default = 'asid' |

**Mock Dependencies:**
- `../../../../lib/util/getConfig.js`: getConfig function

**Ví dụ chạy test:**
```bash
npm test -- unit/getAdminSessionCookieName.test.ts
```

---

### Test Suite 6: getCookieSecret.test.ts

**Mục đích:** Kiểm thử hàm lấy secret cookie cho session, bao gồm giá trị mặc định và cấu hình tùy chỉnh.

**Số lượng test case:** 8

#### Test Cases - Default Value Behavior (2 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return default when not configured | Không có cấu hình | Trả về 'keyboard cat' |
| Use default "keyboard cat" as fallback | Sử dụng default | Trả về 'keyboard cat' |

#### Test Cases - Custom Configuration (2 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return custom secret value | Có cấu hình tùy chỉnh | Trả về 'my-super-secret-key-123' |
| Handle various secret formats | Nhiều định dạng secret | Trả về secret với ký tự đặc biệt, underscores, mixed case |

#### Test Cases - getConfig Call Verification (3 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Call getConfig with correct key | Kiểm tra key parameter | Gọi với key 'system.session.cookieSecret' |
| Call getConfig exactly once | Kiểm tra số lần gọi | Gọi đúng 1 lần |
| Call getConfig with same key multiple times | Nhiều lần gọi | Tất cả lần gọi dùng key 'system.session.cookieSecret' |

**Mock Dependencies:**
- `../../../../lib/util/getConfig.js`: getConfig function

**Ví dụ chạy test:**
```bash
npm test -- unit/getCookieSecret.test.ts
```

---

### Test Suite 7: getFrontStoreSessionCookieName.test.ts

**Mục đích:** Kiểm thử hàm lấy tên cookie phiên cửa hàng (customer), bao gồm giá trị mặc định và cấu hình tùy chỉnh.

**Số lượng test case:** 10

#### Test Cases - Default Value Behavior (2 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return default when not configured | Không có cấu hình | Trả về 'sid' |
| Use default "sid" as fallback | Sử dụng default | Trả về 'sid' |

#### Test Cases - Custom Configuration (2 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return custom session cookie name | Có cấu hình tùy chỉnh | Trả về 'custom_session_id' |
| Handle various custom cookie names | Nhiều tên khác nhau | Trả về 'storefront_sid', 'front_session', 'customer_session_token', 'shop_sid' |

#### Test Cases - getConfig Call Verification (4 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Call getConfig with correct key | Kiểm tra key parameter | Gọi với key 'system.session.cookieName' |
| Call getConfig exactly once per invocation | Kiểm tra số lần gọi | Gọi đúng 1 lần |
| Pass correct default value | Kiểm tra default parameter | Default = 'sid' |
| Consistently use same key | Kiểm tra nhiều lần gọi | Tất cả lần dùng key 'system.session.cookieName' |

#### Test Cases - Return Value Type (2 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Always return a string | Kiểm tra kiểu trả về | typeof result = 'string' |
| Not return null or undefined | Kiểm tra giá trị null/undefined | Không phải null hay undefined |

**Mock Dependencies:**
- `../../../../lib/util/getConfig.js`: getConfig function

**Ví dụ chạy test:**
```bash
npm test -- unit/getFrontStoreSessionCookieName.test.ts
```

---

### Test Suite 8: getSessionConfig.test.ts

**Mục đích:** Kiểm thử hàm tạo cấu hình phiên làm việc (session config) cho express-session, bao gồm tạo store, cấu hình resave, saveUninitialized, và các property khác.

**Số lượng test case:** 25

#### Test Cases - SessionStorage Store Creation Coverage (3 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Create sessionStorage store with pool | Tạo store với pool connection | store được define và là MockSessionStore |
| Pass pool to store constructor | Kiểm tra pool truyền vào | store.pool được define |
| Initialize store without errors | Khởi tạo không lỗi | Không throw exception |

#### Test Cases - getConfig resave Configuration (5 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Use resave=true when configured true | getConfig returns true | config.resave = true |
| Set resave correctly | Kiểm tra kiểu boolean | typeof resave = boolean, resave = true |
| Use resave=false when configured false | getConfig returns false | config.resave = false |
| Use resave=false when undefined | getConfig returns undefined | config.resave = false |
| Use resave=false as default | Không config | config.resave = false |

#### Test Cases - getConfig saveUninitialized Configuration (5 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Use saveUninitialized=true when configured true | getConfig returns true | config.saveUninitialized = true |
| Set saveUninitialized correctly | Kiểm tra kiểu boolean | typeof saveUninitialized = boolean, saveUninitialized = true |
| Use saveUninitialized=false when configured false | getConfig returns false | config.saveUninitialized = false |
| Use saveUninitialized=false when undefined | getConfig returns undefined | config.saveUninitialized = false |
| Use saveUninitialized=false as default | Không config | config.saveUninitialized = false |

#### Test Cases - getConfig Mock Call Verification (4 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Call getConfig with resave key and default false | Kiểm tra resave call | getConfig('system.session.resave', false) |
| Call getConfig with saveUninitialized key | Kiểm tra saveUninitialized call | getConfig('system.session.saveUninitialized', false) |
| Call getConfig exactly twice | Kiểm tra số lần gọi | Gọi đúng 2 lần |
| Call with correct default values | Kiểm tra default values | Cả 2 call dùng default false |

#### Test Cases - Basic Configuration Properties (3 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Create config with correct structure | Cấu trúc đầy đủ | config.secret, cookie, resave, saveUninitialized, store |
| Pass cookieSecret to config | Kiểm tra secret | config.secret = 'test-secret' |
| Set cookie maxAge to 24 hours | Kiểm tra maxAge | config.cookie.maxAge = 24 * 60 * 60 * 1000 |

#### Test Cases - Type Safety and Properties (3 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Return SessionOptions with properties | Kiểm tra type | config có tất cả required properties |
| Handle empty string secret | Secret rỗng | config.secret = '' |
| Handle null secret | Secret null | config.secret = null |

#### Test Cases - Edge Cases (3 cases):

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Handle special characters in secret | Secret có ký tự đặc biệt | config.secret = 'secret@#$%^&*()' |
| Handle very long secret | Secret dài 1000 ký tự | config.secret.length = 1000 |
| Return consistent config on multiple calls | Gọi nhiều lần | config1 = config2 |

**Mock Dependencies:**
- `../../../../lib/postgres/connection`: pool connection
- `../../../../lib/util/getConfig`: getConfig function
- `express-session`: Store class
- `connect-pg-simple`: SessionStore class

**Ví dụ chạy test:**
```bash
npm test -- unit/getSessionConfig.test.ts
```

---

### Test Suite 9: generateToken.test.ts (Integration)

**Mục đích:** Kiểm thử API handler để tạo access token và refresh token, kiểm tra request body, response structure, và token types.

**Số lượng test case:** 8

#### Test Cases:

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Store user data from request body | Kiểm tra email và password được lưu từ request.body | `request.body.email` = 'admin@test.com' và `request.body.password` = 'password123' |
| Have user in locals after login | Kiểm tra user có trong locals sau login | `request.locals.user` được define, `admin_user_id` = 1 |
| Handle response status codes | Kiểm tra response status codes (200, 400, 401, 500) | Status được set đúng với mỗi response |
| Structure token response correctly | Kiểm tra response structure thành công | Response có `data.accessToken` và `data.refreshToken` |
| Structure error response correctly | Kiểm tra error response structure | Response có `error.status` và `error.message` |
| Verify token types exist | Kiểm tra TOKEN_TYPES constants | TOKEN_TYPES.ADMIN = 'ADMIN', TOKEN_TYPES.CUSTOMER = 'CUSTOMER' |
| Validate user data structure | Kiểm tra user object có các field cần thiết | User có `admin_user_id`, `email`, `uuid`, `status` |

**Mock Dependencies:**
- `../../services/loginUserWithEmail`: request.loginUserWithEmail()
- `../../../lib/util/jwt`: generateToken(), generateRefreshToken()

**Ví dụ chạy test:**
```bash
npm test -- integration/generateToken.test.ts
```

---

### Test Suite 10: refreshToken.test.ts (Integration)

**Mục đích:** Kiểm thử API handler để làm mới access token bằng refresh token, kiểm tra token verification, response structure, và user validation.

**Số lượng test case:** 9

#### Test Cases:

| Test Case | Mô Tả | Kỳ Vọng |
|-----------|-------|---------|
| Handle missing refresh token error | Không gửi refresh token | HTTP 400, message: "Refresh token is required" |
| Store refresh token in request body | Kiểm tra refreshToken được lưu từ request.body | `request.body.refreshToken` = 'valid_refresh_token' |
| Structure successful refresh response | Kiểm tra response structure thành công | Response có `success=true` và `data.accessToken` |
| Return 401 for invalid token | Token không hợp lệ/hết hạn | HTTP 401, message: "Invalid refresh token" |
| Return 401 for inactive user | User bị vô hiệu hóa (status = 0) | HTTP 401, message: "Admin user not found or inactive" |
| Return 401 for user not found | User không tồn tại trong DB | HTTP 401, message: "Admin user not found or inactive" |
| Verify token response structure | Kiểm tra response có các field cần thiết | Response có `success=true` và `data.accessToken` |
| Handle various user IDs in token payload | Kiểm tra payload với nhiều userID khác nhau | Token payload với `admin_user_id` = 1, 5, 42, 999 đều hợp lệ |
| Validate user status for token refresh | Kiểm tra user status trước khi cấp token mới | `status=1` → valid, `status=0` → invalid |

**Mock Dependencies:**
- `../../../lib/util/jwt`: verifyRefreshToken(), generateToken()
- `@evershop/postgres-query-builder`: select() builder
- `../../../lib/postgres/connection`: pool connection

**Ví dụ chạy test:**
```bash
npm test -- integration/refreshToken.test.ts
```

---

## Kịch Bản Kiểm Thử Chính

### Kịch Bản 1: Khởi Tạo Module

```
1. Module auth được import
2. bootstrap() được gọi
3. Các method được gắn vào express.request
   ├─ loginUserWithEmail()
   ├─ logoutUser()
   ├─ isUserLoggedIn()
   └─ getCurrentUser()
```

**Test Coverage:**
- bootstrap.test.ts: Method attachment, workflow test

---

### Kịch Bản 2: Quy Trình Đăng Nhập

```
1. User nhập email và mật khẩu
2. API gọi loginUserWithEmail()
   ├─ Kiểm tra email trong DB (ILIKE query với escape %)
   ├─ So sánh mật khẩu với hash
   └─ Set session.userID và locals.user
3. API gọi generateToken()
   ├─ Tạo accessToken JWT
   ├─ Tạo refreshToken JWT
   └─ Trả về tokens cho client
```

**Test Coverage:**
- loginUserWithEmail.test.ts: Successful login, user not found, wrong password
- generateToken.test.ts: Token generation success, login error handling

---

### Kịch Bản 3: Làm Mới Token

```
1. Client gửi refreshToken
2. API verifyRefreshToken()
   ├─ Validate token signature
   └─ Decode user data từ token
3. Kiểm tra user còn active trong DB
4. Tạo accessToken mới
5. Trả về accessToken mới cho client
```

**Test Coverage:**
- refreshToken.test.ts: Valid token, invalid token, user not found, inactive user

---

### Kịch Bản 4: Kiểm Soát Quyền Truy Cập

```
1. Middleware [getCurrentUser]auth.ts được gọi
2. Kiểm tra route access level
   ├─ Nếu public: next()
   └─ Nếu private: kiểm tra user
3. Kiểm tra user có UUID
4. Kiểm tra vai trò (roles)
   ├─ Nếu roles = '*': next()
   ├─ Nếu roles chứa route id: next()
   └─ Ngược lại: return 401
```

**Test Coverage:**
- authMiddleware.test.ts: Public route, private route, role-based access

---

### Kịch Bản 5: Đăng Xuất

```
1. User click nút logout
2. API gọi request.logoutUser()
   ├─ Xóa session.userID
   └─ Xóa locals.user
3. Session bị xóa từ DB (via connect-pg-simple)
4. Client xóa tokens từ storage
```

**Test Coverage:**
- logoutUser.test.ts: Clear session, clear locals, handle undefined session

---

### Kịch Bản 6: Cấu Hình Session

```
1. Module khởi tạo lấy các cấu hình
   ├─ getAdminSessionCookieName() → 'asid' (default)
   ├─ getFrontStoreSessionCookieName() → 'sid' (default)
   ├─ getCookieSecret() → 'keyboard cat' (default)
   └─ getSessionConfig(secret) → SessionOptions object
2. Express session được thiết lập với cấu hình này
3. PostgreSQL session store được khởi tạo
```

**Test Coverage:**
- getAdminSessionCookieName.test.ts: Default và custom values
- getFrontStoreSessionCookieName.test.ts: Default và custom values
- getCookieSecret.test.ts: Default và custom values
- getSessionConfig.test.ts: Store creation, config properties

---

## Chi Tiết Kiểm Thử API

### Tổng Quan API Endpoints

Module Auth cung cấp 2 API endpoints chính:

| Endpoint | HTTP Method | Mục Đích | Authentication |
|----------|-------------|----------|-----------------|
| `/api/auth/token` | POST | Tạo access token và refresh token | Basic (email + password) |
| `/api/auth/refresh-token` | POST | Làm mới access token | Bearer Token (refresh token) |

---

### API 1: Generate Token (Tạo Token)

**Endpoint:** `POST /api/auth/token`

**Mục Đích:** Xác thực người dùng bằng email và mật khẩu, trả về access token và refresh token.

#### 1.1 Request Example

```http
POST /api/auth/token HTTP/1.1
Content-Type: application/json
Host: api.example.com

{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### 1.2 Successful Response (HTTP 200)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwfQ.signature_here",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJSRUZSRVNIIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9.refresh_signature_here",
    "user": {
      "admin_user_id": 1,
      "email": "admin@example.com",
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "status": 1
    }
  }
}
```

**Response Fields:**
- `success` (boolean): Trạng thái thành công
- `data.accessToken` (string): JWT token dùng để xác thực request tiếp theo (hết hạn sau 1 giờ)
- `data.refreshToken` (string): Token dùng để làm mới access token (hết hạn sau 30 ngày)
- `data.user` (object): Thông tin người dùng vừa đăng nhập

#### 1.3 Error Responses

**Case 1: Email không tồn tại (HTTP 401)**
```json
{
  "success": false,
  "error": {
    "status": 401,
    "message": "User not found"
  }
}
```

**Case 2: Mật khẩu sai (HTTP 401)**
```json
{
  "success": false,
  "error": {
    "status": 401,
    "message": "Invalid password"
  }
}
```

**Case 3: User bị vô hiệu hóa/inactive (HTTP 401)**
```json
{
  "success": false,
  "error": {
    "status": 401,
    "message": "User is inactive"
  }
}
```

**Case 4: Request body không hợp lệ (HTTP 400)**
```json
{
  "success": false,
  "error": {
    "status": 400,
    "message": "Email and password are required"
  }
}
```

**Case 5: Lỗi server (HTTP 500)**
```json
{
  "success": false,
  "error": {
    "status": 500,
    "message": "Internal server error"
  }
}
```

#### 1.4 API Test Cases

**Test Suite:** `integration/generateToken.test.ts` (8 test cases)

| Test Case ID | Tên Test | Request | Expected Result |
|--------------|----------|---------|-----------------|
| GT-001 | Login thành công | `{"email":"admin@example.com", "password":"password123"}` | HTTP 200, trả về accessToken, refreshToken, user data |
| GT-002 | Email không tồn tại | `{"email":"notfound@example.com", "password":"password123"}` | HTTP 401, message: "User not found" |
| GT-003 | Mật khẩu sai | `{"email":"admin@example.com", "password":"wrongpass"}` | HTTP 401, message: "Invalid password" |
| GT-004 | User bị vô hiệu hóa | `{"email":"inactive@example.com", "password":"password123"}` | HTTP 401, message: "User is inactive" |
| GT-005 | Request body rỗng | `{}` | HTTP 400, message: "Email and password are required" |
| GT-006 | Email rỗng | `{"email":"", "password":"password123"}` | HTTP 400 hoặc HTTP 401 |
| GT-007 | Password rỗng | `{"email":"admin@example.com", "password":""}` | HTTP 400 hoặc HTTP 401 |
| GT-008 | User data trong response | Login thành công, kiểm tra user object | User có fields: admin_user_id, email, uuid, status (password không được include) |

#### 1.5 Token Structure (JWT Decoding)

**Access Token Payload Example:**
```json
{
  "sub": 1,
  "admin_user_id": 1,
  "email": "admin@example.com",
  "type": "ADMIN",
  "iat": 1700000000,
  "exp": 1700003600
}
```

**Refresh Token Payload Example:**
```json
{
  "sub": 1,
  "admin_user_id": 1,
  "type": "REFRESH",
  "iat": 1700000000,
  "exp": 1700086400
}
```

---

### API 2: Refresh Token (Làm Mới Token)

**Endpoint:** `POST /api/auth/refresh-token`

**Mục Đích:** Tạo access token mới bằng cách sử dụng refresh token, không cần nhập lại email/password.

#### 2.1 Request Example

```http
POST /api/auth/refresh-token HTTP/1.1
Content-Type: application/json
Host: api.example.com

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJSRUZSRVNIIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9.refresh_signature_here"
}
```

#### 2.2 Successful Response (HTTP 200)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTcwMDAwMzYwMCwiZXhwIjoxNzAwMDA3MjAwfQ.new_signature_here",
    "user": {
      "admin_user_id": 1,
      "email": "admin@example.com",
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "status": 1
    }
  }
}
```

**Response Fields:**
- `success` (boolean): Trạng thái thành công
- `data.accessToken` (string): Access token mới (hết hạn sau 1 giờ)
- `data.user` (object): Thông tin người dùng (nếu user vẫn active)

#### 2.3 Error Responses

**Case 1: Refresh token bị thiếu (HTTP 400)**
```json
{
  "success": false,
  "error": {
    "status": 400,
    "message": "Refresh token is required"
  }
}
```

**Case 2: Refresh token không hợp lệ (HTTP 401)**
```json
{
  "success": false,
  "error": {
    "status": 401,
    "message": "Invalid refresh token"
  }
}
```

**Case 3: Refresh token hết hạn (HTTP 401)**
```json
{
  "success": false,
  "error": {
    "status": 401,
    "message": "Refresh token expired"
  }
}
```

**Case 4: User không tồn tại (HTTP 401)**
```json
{
  "success": false,
  "error": {
    "status": 401,
    "message": "Admin user not found or inactive"
  }
}
```

**Case 5: User bị vô hiệu hóa (HTTP 401)**
```json
{
  "success": false,
  "error": {
    "status": 401,
    "message": "Admin user not found or inactive"
  }
}
```

#### 2.4 API Test Cases

**Test Suite:** `integration/refreshToken.test.ts` (9 test cases)

| Test Case ID | Tên Test | Request | Expected Result |
|--------------|----------|---------|-----------------|
| RT-001 | Làm mới token thành công | `{"refreshToken":"valid_refresh_token"}` | HTTP 200, trả về accessToken mới, user data |
| RT-002 | Refresh token bị thiếu | `{}` | HTTP 400, message: "Refresh token is required" |
| RT-003 | Refresh token không hợp lệ | `{"refreshToken":"invalid_token"}` | HTTP 401, message: "Invalid refresh token" |
| RT-004 | Refresh token hết hạn | `{"refreshToken":"expired_token"}` | HTTP 401, message: "Refresh token expired" |
| RT-005 | User không tồn tại | Token của user đã bị xóa | HTTP 401, message: "Admin user not found or inactive" |
| RT-006 | User bị vô hiệu hóa | Token của user có status=0 | HTTP 401, message: "Admin user not found or inactive" |
| RT-007 | Refresh token sai format | `{"refreshToken":"not.jwt.format"}` | HTTP 401, message: "Invalid refresh token" |
| RT-008 | Access token được cấp mới | Gửi refresh token hợp lệ | Access token khác vs token cũ, nhưng user_id giống |
| RT-009 | User data trong response | Làm mới token thành công | User object có tất cả fields cần thiết (admin_user_id, email, uuid, status) |

---

### API Test Execution

#### Chạy API Tests Riêng

```bash
# Chạy cả 2 API integration tests
npm test -- integration

# Chạy từng API test riêng
npm test -- integration/generateToken.test.ts
npm test -- integration/refreshToken.test.ts

# Chạy với verbose output
npm test -- integration --verbose

# Chạy với coverage
npm test -- integration --coverage
```

#### Integration Test Flow

```
Client                     Server                 Database
  │                          │                        │
  ├─POST /auth/token─────────>│                        │
  │ {email, password}         │                        │
  │                           ├─Query user─────────────>│
  │                           │<─User data─────────────┤
  │                           │                        │
  │                           │ Compare password       │
  │                           │ (bcrypt)               │
  │                           │                        │
  │<─HTTP 200─────────────────┤                        │
  │ {accessToken,             │                        │
  │  refreshToken, user}      │                        │
  │                           │                        │
  │─ Store tokens in client ─ │                        │
  │                           │                        │
  │─Authorization: Bearer ────>│                        │
  │ accessToken               │                        │
  │<─Protected resource data──┤                        │
  │                           │                        │
  ├─POST /auth/refresh-token─>│                        │
  │ {refreshToken}            │                        │
  │                           ├─Verify token, Query──>│
  │                           │<─User data─────────────┤
  │<─HTTP 200─────────────────┤                        │
  │ {accessToken (new), user} │                        │
```

---

### API Authentication Header

Sau khi nhận được access token, client sẽ sử dụng nó trong header của request như sau:

```http
GET /api/admin/dashboard HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Middleware sẽ:
1. Trích xuất token từ header `Authorization: Bearer <token>`
2. Verify token signature
3. Decode token để lấy user info
4. Kiểm tra quyền truy cập (role-based access control)
5. Cho phép hoặc từ chối request

---

### API Test Coverage Summary

| Aspect | Coverage |
|--------|----------|
| **HTTP Methods** | POST (2/2 endpoints) |
| **Success Cases** | Login thành công, Refresh token thành công |
| **Error Cases** | User not found, Invalid password, Invalid token, Expired token, Inactive user, Missing parameters |
| **Status Codes** | 200 (success), 400 (bad request), 401 (unauthorized), 500 (server error) |
| **Request Validation** | Email format, Password strength, Token format, Required fields |
| **Response Validation** | Token structure, User data presence, Error messages, Success flags |
| **Security** | Password encryption (bcrypt), JWT signing, Token expiration, User status check |
| **Total API Test Cases** | 17 (8 generateToken + 9 refreshToken) |

---

## Cách Chạy Kiểm Thử

### Chạy Tất Cả Tests

```bash
npm test
```

### Chạy Riêng Module Auth

```bash
npm run test:auth -- --testPathPattern="packages/evershop/src/modules/auth/tests"

```

### Chạy Unit Tests Riêng

```bash
npm run test:auth -- --testPathPattern="packages/evershop/src/modules/auth/tests/unit"

```

### Chạy Integration Tests Riêng

```bash
npm run test:auth -- --testPathPattern="packages/evershop/src/modules/auth/tests/intergration"

```

### Chạy Test Cụ Thể

```bash
npm test -- bootstrap.test.ts
npm test -- loginUserWithEmail.test.ts
npm test -- logoutUser.test.ts
npm test -- authMiddleware.test.ts
npm test -- getAdminSessionCookieName.test.ts
npm test -- getCookieSecret.test.ts
npm test -- getFrontStoreSessionCookieName.test.ts
npm test -- getSessionConfig.test.ts
npm test -- generateToken.test.ts
npm test -- refreshToken.test.ts
```

### Chạy Với Coverage Report

```bash
npm test -- --coverage
```

### Chạy Trong Watch Mode

```bash
npm test -- --watch
```

---

## Các Dependencies Được Mock

### 1. PostgreSQL Query Builder

```typescript
jest.mock('@evershop/postgres-query-builder');

// Sử dụng:
const mockSelectBuilder = {
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  and: jest.fn().mockReturnThis(),
  load: jest.fn().mockResolvedValue(userData)
};
(select as jest.Mock).mockReturnValue(mockSelectBuilder);
```

### 2. JWT Utilities

```typescript
jest.mock('../../../lib/util/jwt');

// Sử dụng:
(jwtUtil.generateToken as jest.Mock).mockReturnValue('access_token');
(jwtUtil.verifyRefreshToken as jest.Mock).mockReturnValue(decodedToken);
```

### 3. Password Helper

```typescript
jest.mock('../../../lib/util/passwordHelper');

// Sử dụng:
(comparePassword as jest.Mock).mockReturnValue(true);
```

### 4. getConfig Utility

```typescript
jest.mock('../../../../lib/util/getConfig');

// Sử dụng:
const mockGetConfig = jest.fn((key, defaultValue) => defaultValue);
(getConfig as jest.Mock).mockImplementation(mockGetConfig);
```

### 5. Express Request & Session

```typescript
jest.unstable_mockModule('express', () => ({
  request: mockRequest
}));

// Sử dụng:
const mockRequest = {};
const mockSessionSave = jest.fn();
const context = {
  session: { userID: undefined, save: mockSessionSave },
  locals: { user: undefined }
};
```

### 6. Database Pool

```typescript
jest.mock('../../../../lib/postgres/connection', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }
}));
```

### 7. Express Session & Session Store

```typescript
jest.mock('express-session', () => ({
  default: { Store: class Store {} },
  __esModule: true
}));

jest.mock('connect-pg-simple', () => {
  return jest.fn(() => {
    return class MockSessionStore {
      constructor(options) {
        this.pool = options.pool;
      }
    };
  });
});
```

---

## Quy Ước Đặt Tên

### Test Suite
```typescript
describe('bootstrap', () => { ... })
describe('loginUserWithEmail', () => { ... })
describe('logoutUser', () => { ... })
describe('Auth Middleware', () => { ... })
describe('getAdminSessionCookieName', () => { ... })
describe('getCookieSecret', () => { ... })
describe('getFrontStoreSessionCookieName', () => { ... })
describe('getSessionConfig', () => { ... })
describe('generateToken API Handler', () => { ... })
describe('refreshToken API Handler', () => { ... })
```

### Test Case
```typescript
it('should successfully login user with correct credentials', () => { ... })
it('should throw error when user not found', () => { ... })
it('should return 401 when refresh token is invalid', () => { ... })
it('should return default cookie name when not configured', () => { ... })
it('should create sessionStorage store with pool connection', () => { ... })
```

### Mock Objects
```typescript
const mockRequest = { ... }
const mockResponse = { ... }
const mockSelectBuilder = { ... }
const mockGetConfig = jest.fn()
const mockSessionSave = jest.fn()
```

---

## Assertion (Khẳng Định)

### Kiểm Tra Giá Trị
```typescript
expect(result).toBe(expectedValue);
expect(result).toEqual(expectedObject);
expect(result).toBeUndefined();
expect(result).toBeNull();
expect(typeof result).toBe('string');
```

### Kiểm Tra Hàm Được Gọi
```typescript
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(argument1, argument2);
expect(mockFunction).toHaveBeenCalledTimes(1);
expect(mockFunction).not.toHaveBeenCalled();
```

### Kiểm Tra HTTP Response
```typescript
expect(mockResponse.status).toHaveBeenCalledWith(200);
expect(mockResponse.json).toHaveBeenCalledWith(expectedPayload);
```

### Kiểm Tra Exception
```typescript
await expect(functionCall()).rejects.toThrow('Error message');
expect(() => { functionCall(); }).not.toThrow();
```

---

## Compilation và Execution

### Step 1: Compile TypeScript
```bash
npm run deploy
```

### Step 2: Run Jest Tests
```bash
npm run test -- ./packages/evershop/dist/src/modules/auth/tests
```

### Full Pipeline
```bash
npm run deploy && npm run test -- ./packages/evershop/dist/modules/auth/tests
```

### With coverage

```bash
npm run test -- ./packages/evershop/dist/modules/auth/tests --coverage
```

---

## Tổng Kết Số Lượng Test Cases

| Test File | Unit/Integration | Số Test Cases |
|-----------|------------------|---------------|
| bootstrap.test.ts | Unit | 15 |
| loginUserWithEmail.test.ts | Unit | 13 |
| logoutUser.test.ts | Unit | 4 |
| authMiddleware.test.ts | Unit | 6 |
| getAdminSessionCookieName.test.ts | Unit | 7 |
| getCookieSecret.test.ts | Unit | 8 |
| getFrontStoreSessionCookieName.test.ts | Unit | 10 |
| getSessionConfig.test.ts | Unit | 25 |
| generateToken.test.ts | Integration | 8 |
| refreshToken.test.ts | Integration | 9 |
| **Tổng Cộng** | **8 Unit + 2 Integration** | **105** |
