# Tài Liệu Kiểm Thử Module Xác Thực (Auth)

## Mục Đích

Tài liệu này mô tả chi tiết về cấu trúc, kịch bản kiểm thử và các trường hợp sử dụng cho module xác thực (Auth) trong hệ thống Evershop. Module này quản lý việc đăng nhập, đăng xuất, quản lý token JWT, và kiểm soát quyền truy cập của người dùng.

---

## Cấu Trúc Thư Mục

```
src/modules/auth/
├── tests/
│   ├── test.md                           # Tài liệu kiểm thử (file này)
│   ├── unit/
│   │   ├── loginUserWithEmail.test.ts    # Test dịch vụ đăng nhập
│   │   ├── logoutUser.test.ts            # Test dịch vụ đăng xuất
│   │   └── authMiddleware.test.ts        # Test middleware xác thực
│   └── integration/
│       ├── generateToken.test.ts         # Test tạo token JWT
│       └── refreshToken.test.ts          # Test làm mới token
├── services/
│   ├── loginUserWithEmail.ts             # Dịch vụ xác thực email/mật khẩu
│   ├── logoutUser.ts                     # Dịch vụ đăng xuất
│   ├── getSessionConfig.ts               # Cấu hình phiên làm việc
│   └── ... (các dịch vụ khác)
├── api/
│   ├── getUserToken/                     # API tạo token
│   ├── refreshUserToken/                 # API làm mới token
│   └── global/                           # Middleware toàn cục
├── pages/                                # Các trang liên quan đến xác thực
└── graphql/                              # Các resolver GraphQL
```

---

## Phân Loại Kiểm Thử

### 1. Unit Test (Kiểm Thử Đơn Vị)

Kiểm thử các hàm riêng lẻ, dịch vụ và logic nghiệp vụ mà không phụ thuộc vào các thành phần khác.

#### Test Files:
- `unit/loginUserWithEmail.test.ts`
- `unit/logoutUser.test.ts`
- `unit/authMiddleware.test.ts`

### 2. Integration Test (Kiểm Thử Tích Hợp)

Kiểm thử sự tương tác giữa nhiều thành phần, bao gồm API handler, middleware và dịch vụ cơ sở dữ liệu.

#### Test Files:
- `integration/generateToken.test.ts`
- `integration/refreshToken.test.ts`

---

## Chi Tiết Các Test Suite

### Test Suite 1: loginUserWithEmail.test.ts

**Mục đích:** Kiểm thử dịch vụ xác thực người dùng bằng email và mật khẩu, bao gồm xử lý email, user object, session setup và error scenarios.

**Số lượng test case:** 15

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

### Test Suite 2: logoutUser.test.ts

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

### Test Suite 3: generateToken.test.ts (Integration)

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

### Test Suite 4: refreshToken.test.ts (Integration)

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

### Test Suite 5: authMiddleware.test.ts

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

## Kịch Bản Kiểm Thử Chính

### Kịch Bản 1: Quy Trình Đăng Nhập

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

### Kịch Bản 2: Làm Mới Token

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

### Kịch Bản 3: Kiểm Soát Quyền Truy Cập

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

### Kịch Bản 4: Đăng Xuất

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

## Cách Chạy Kiểm Thử

### Chạy Tất Cả Tests

```bash
npm test
```

### Chạy Riêng Module Auth

```bash
npm test -- src/modules/auth/tests
```

### Chạy Unit Tests Riêng

```bash
npm test -- unit
```

### Chạy Integration Tests Riêng

```bash
npm test -- integration
```

### Chạy Test Cụ Thể

```bash
npm test -- loginUserWithEmail.test.ts
npm test -- refreshToken.test.ts
npm test -- authMiddleware.test.ts
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

---

## Quy Ước Đặt Tên

### Test Suite
```typescript
describe('loginUserWithEmail', () => { ... })
describe('Auth Middleware', () => { ... })
describe('generateToken API Handler', () => { ... })
```

### Test Case
```typescript
it('should successfully login user with correct credentials', () => { ... })
it('should throw error when user not found', () => { ... })
it('should return 401 when refresh token is invalid', () => { ... })
```

### Mock Objects
```typescript
const mockRequest = { ... }
const mockResponse = { ... }
const mockSelectBuilder = { ... }
```

---

## Assertion (Khẳng Định)

### Kiểm Tra Giá Trị
```typescript
expect(result).toBe(expectedValue);
expect(result).toEqual(expectedObject);
expect(result).toBeUndefined();
expect(result).toBeNull();
```

### Kiểm Tra Hàm Được Gọi
```typescript
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(argument1, argument2);
expect(mockFunction).toHaveBeenCalledTimes(1);
```

### Kiểm Tra HTTP Response
```typescript
expect(mockResponse.status).toHaveBeenCalledWith(200);
expect(mockResponse.json).toHaveBeenCalledWith(expectedPayload);
```

### Kiểm Tra Exception
```typescript
await expect(functionCall()).rejects.toThrow('Error message');
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