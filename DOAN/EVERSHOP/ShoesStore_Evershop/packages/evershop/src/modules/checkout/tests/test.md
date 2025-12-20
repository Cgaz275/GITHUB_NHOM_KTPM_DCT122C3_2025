# Tài Liệu Kiểm Thử Module Checkout (Thanh Toán)

## Mục Đích

Tài liệu này mô tả chi tiết cấu trúc, cách chạy, và kịch bản kiểm thử (Unit Tests + Integration Tests) cho module Checkout trong hệ thống EverShop. Module này quản lý giỏ hàng, tính giá, áp dụng giảm giá, và xử lý quy trình thanh toán hoàn chỉnh.

---

## 📊 Tóm Tắt Kiến Trúc Kiểm Thử

```
src/modules/checkout/tests/
├── test.md                                        # Tài liệu kiểm thử (file này)
├── basicSetup.js                                  # Setup chung cho tất cả tests
├── products.js                                    # Dữ liệu sản phẩm mock
├── coupons.js                                     # Dữ liệu coupon mock
├── taxRates.js                                    # Dữ liệu tax mock
│
├── unit/                                          # ✅ UNIT TESTS (13 files)
│   │
│   ├── 📊 Calculation Tests (9 files)             # Tests các hàm tính toán giá
│   │   ├── discountAmount.test.js                 # Test tính toán giảm giá
│   │   ├── grandTotal.test.js                     # Test tổng cộng cuối cùng
│   │   ├── lineTotal.test.js                      # Test tổng từng sản phẩm
│   │   ├── lineTotalWithDiscount.test.js          # Test tổng sản phẩm + giảm giá
│   │   ├── productPrice.test.js                   # Test giá sản phẩm
│   │   ├── subTotal.test.js                       # Test tổng phụ
│   │   ├── subTotalWithDiscount.test.js           # Test tổng phụ + giảm giá
│   │   ├── taxAmount.test.js                      # Test tính thuế
│   │   └── taxAmountRounding.test.js              # Test làm tròn thuế
│   │
│   └── 🛒 Service Tests (4 files)                 # Tests các dịch vụ giỏ hàng
│       ├── addCartItem.test.ts                    # Test thêm sản phẩm vào giỏ
│       ├── removeItemSideEffect.test.js           # Test xóa sản phẩm & side effects
│       ├── updateCartItemQtySideEffect.test.js    # Test cập nhật số lượng & side effects
│       └── addItemSideEffect.test.js              # Test hooks & processors khi thêm
│
└── integration/                                   # 🔗 INTEGRATION TESTS (3 files)
    │
    ├── cartManagement.integration.test.js         # Test quy trình quản lý giỏ hàng
    ├── checkoutFlow.integration.test.js           # Test toàn bộ quy trình thanh toán
    └── orderCreation.integration.test.js          # Test validation & creation đơn hàng
```

---

## 📈 Phân Loại Tests

### ✅ Unit Tests (13 files) - Kiểm Thử Từng Chức Năng Độc Lập

| Loại | Số Lượng | Mục Đích | Ví Dụ |
|------|---------|---------|------|
| **Calculation Tests** | 9 | Test các hàm tính toán giá | `productPrice`, `taxAmount`, `grandTotal` |
| **Service Tests** | 4 | Test dịch vụ giỏ hàng | `addCartItem`, `updateCartItemQty` |
| **Total Unit** | **13** | Kiểm thử từng hàm độc lập | - |

**Phạm vi:** Mỗi test tập trung vào **1 hàm/dịch vụ** cụ thể

### 🔗 Integration Tests (3 files) - Kiểm Thử Quy Trình Hoàn Chỉnh

| File | Số Lượng Test | Mục Đích |
|------|-----------|---------|
| **cartManagement.integration.test.js** | 5 | Test quy trình quản lý giỏ hàng từ đầu đến cuối |
| **checkoutFlow.integration.test.js** | 6 | Test toàn bộ quy trình từ thêm item đến đặt hàng |
| **orderCreation.integration.test.js** | 5 | Test validate & tạo đơn hàng |
| **Total Integration** | **16** | Kiểm thử quy trình bao gồm nhiều services |

**Phạm vi:** Mỗi test kiểm thử **quy trình hoàn chỉnh** gồm nhiều bước

---

## 🧪 Chi Tiết Unit Tests

### 📊 Calculation Tests (9 files)

#### 1. `discountAmount.test.js` - Tính Toán Giảm Giá

**Mục đích:** Test tính toán giảm giá áp dụng cho giỏ hàng.

**Các trường hợp test:**
- ✅ Giảm giá phần trăm (10% đơn hàng)
- ✅ Giảm giá cố định (100 đồng)
- ✅ Giảm giá không vượt quá tổng giá (capping)
- ✅ Tính toán với/không bao gồm thuế

---

#### 2. `productPrice.test.js` - Giá Sản Phẩm

**Mục đích:** Test tính toán giá sản phẩm (có/không bao gồm thuế).

**Các trường hợp test:**
- ✅ Giá chưa thuế vs giá bao gồm thuế
- ✅ Tính với các thuế suất khác nhau
- ✅ Final price = product price + adjustments
- ✅ Giá trong cấu hình tax-included mode

---

#### 3. `lineTotal.test.js` - Tổng Từng Sản Phẩm

**Mục đích:** Test `Line Total = Product Price × Quantity`.

**Các trường hợp test:**
- ✅ Tính tổng = giá × số lượng
- ✅ Cập nhật khi thay đổi số lượng
- ✅ Line total với các thuế suất khác nhau
- ✅ Line total cuối cùng = line total + adjustments

---

#### 4. `lineTotalWithDiscount.test.js` - Tổng Sản Phẩm Với Giảm Giá

**Mục đích:** Test tính `Line Total - Discount`.

**Các trường hợp test:**
- ✅ Chia cắt giảm giá vào từng item
- ✅ Giảm giá không vượt line total

---

#### 5. `subTotal.test.js` - Tổng Phụ

**Mục đích:** Test `Sub Total = ∑(Line Total)`.

**Các trường hợp test:**
- ✅ Sub total = tổng giá tất cả sản phẩm
- ✅ Cập nhật khi thêm/xóa sản phẩm
- ✅ Sub total với/không bao gồm thuế

---

#### 6. `subTotalWithDiscount.test.js` - Tổng Phụ Với Giảm Giá

**Mục đích:** Test `Sub Total - Discount`.

**Các trường hợp test:**
- ✅ Sub total - discount amount
- ✅ Cập nhật khi áp dụng coupon

---

#### 7. `taxAmount.test.js` - Tính Thuế

**Mục đích:** Test tính thuế dựa trên tax rate và cấu hình.

**Các trường hợp test:**
- ✅ Tax = Sub Total × Tax Rate (chưa thuế)
- ✅ Tax = Sub Total - (Sub Total / (1 + Rate)) (bao gồm thuế)
- ✅ Tính từng item với tax rate khác nhau
- ✅ Tổng thuế = ∑(tax item)

---

#### 8. `taxAmountRounding.test.js` - Làm Tròn Thuế

**Mục đích:** Test làm tròn thuế (round-half-up, 2 chữ số).

**Các trường hợp test:**
- ✅ Làm tròn từng item: 10.456 → 10.46
- ✅ Làm tròn tổng thuế đơn hàng
- ✅ Không có sai lệch tính toán (rounding error)

---

#### 9. `grandTotal.test.js` - Tổng Cộng Cuối Cùng

**Mục đích:** Test `Grand Total = Sub Total + Tax - Discount + Shipping`.

**Các trường hợp test:**
- ✅ Grand total = sub total + tax (không giảm giá)
- ✅ Grand total = (sub total + tax) - discount
- ✅ Grand total ≥ 0 (không âm)
- ✅ Cập nhật khi áp dụng coupon

---

### 🛒 Service Tests (4 files)

#### 1. `addCartItem.test.ts` - Thêm Sản Phẩm

**Mục đích:** Test dịch vụ thêm sản phẩm vào giỏ.

**Các trường hợp test:**
- ✅ Thêm sản phẩm mới
- ✅ Xử lý sản phẩm trùng lặp (cùng SKU → tăng qty)
- ✅ Xử lý số lượng (string → number)
- ✅ Kiểm tra lỗi item (không tồn tại, qty không hợp lệ)
- ✅ Giữ thứ tự sản phẩm
- ✅ Cập nhật trạng thái giỏ

---

#### 2. `updateCartItemQtySideEffect.test.js` - Cập Nhật Số Lượng

**Mục đích:** Test cập nhật số lượng + side effects (hooks).

**Các trường hợp test:**
- ✅ Cập nhật bằng UUID / SKU
- ✅ Tăng (increase) / Giảm (decrease) số lượng
- ✅ Xóa item khi qty → 0
- ✅ Hook before: Ngăn cập nhật
- ✅ Hook after: Tự động thêm item khác

---

#### 3. `removeItemSideEffect.test.js` - Xóa Sản Phẩm

**Mục đích:** Test xóa sản phẩm + side effects.

**Các trường hợp test:**
- ✅ Xóa bằng UUID / SKU
- ✅ Cập nhật tổng tiền
- ✅ Hook before: Ngăn xóa
- ✅ Hook after: Thực hiện hành động sau xóa
- ✅ Không xóa item cuối cùng nếu là bắt buộc

---

#### 4. `addItemSideEffect.test.js` - Side Effects Khi Thêm Item

**Mục đích:** Test hooks & processors khi thêm sản phẩm.

**Các trường hợp test:**
- ✅ Hook before: Ngăn thêm item
- ✅ Hook after: Tự động thêm item khác
- ✅ Processor: Sửa đổi item trước thêm
- ✅ Xử lý errors từ hooks
- ✅ Thứ tự thực thi: before → validate → processor → add → after

---

## 🔗 Chi Tiết Integration Tests

### 1. `cartManagement.integration.test.js` - Quản Lý Giỏ Hàng

**Mục đích:** Test toàn bộ quy trình quản lý giỏ từ tạo đến cuối.

**Các kịch bản test:**

#### 1.1 Complete Cart Lifecycle
- ✅ Tạo giỏ rỗng
- ✅ Thêm nhiều sản phẩm
- ✅ Cập nhật số lượng
- ✅ Xóa sản phẩm
- ✅ Áp dụng coupon
- ✅ Lưu trạng thái giỏ

**Ví dụ:**
```
Step 1: Empty cart (0 items)
Step 2: Add item 1 (qty 2) → 1 item total
Step 3: Add item 2 (qty 1) → 2 items total
Step 4: Apply 10% coupon → discount calculated
Step 5: Remove item → 1 item left
```

#### 1.2 Duplicate Item Handling
- ✅ Thêm cùng sản phẩm 2 lần → kết hợp qty
- ✅ Số item không tăng, qty tăng

#### 1.3 Cart Consistency
- ✅ Subtotal giảm khi xóa item
- ✅ Subtotal tăng khi thêm item
- ✅ Giỏ vẫn consistent sau add/remove

#### 1.4 Cart with Discounts and Tax
- ✅ Áp dụng giảm giá → tất cả totals cập nhật
- ✅ Tax giảm khi áp dụng discount
- ✅ Giảm giá không vượt sub total

#### 1.5 Complex Operations
- ✅ Sequential add/remove/update
- ✅ Tất cả totals cập nhật chính xác
- ✅ Tax với cấu hình khác nhau

---

### 2. `checkoutFlow.integration.test.js` - Quy Trình Thanh Toán

**Mục đích:** Test toàn bộ flow từ thêm item → thanh toán.

**Các kịch bản test:**

#### 2.1 Full Checkout Flow
- ✅ Phase 1: Add items → Phase 2: Review → Phase 3: Apply coupon
- ✅ Phase 4: Calculate totals → Phase 5: Add shipping address
- ✅ Phase 6: Add billing address → Phase 7: Select shipping
- ✅ Phase 8: Verify all information

**Timeline:**
```
Add Items → Apply Discount → Add Addresses → 
Select Shipping → Verify All → Ready to Pay
```

#### 2.2 Multi-Step Consistency
- ✅ Totals consistent qua các bước
- ✅ Coupon vẫn apply sau thay đổi
- ✅ Grand total không thay đổi khi add address

#### 2.3 Item Updates During Checkout
- ✅ Cập nhật qty trong quá trình checkout
- ✅ Áp dụng coupon sau update qty

#### 2.4 Discount Application
- ✅ Áp dụng % discount
- ✅ Áp dụng fixed discount
- ✅ Thay đổi coupon → recalculate

#### 2.5 Address Management
- ✅ Shipping & billing address riêng biệt
- ✅ Cho phép dùng địa chỉ giống nhau

#### 2.6 Shipping Method Selection
- ✅ Chọn phương thức giao hàng
- ✅ Thay đổi phương thức khi cần

#### 2.7 End-to-End Validation
- ✅ Tất cả required fields có mặt
- ✅ Có thể complete checkout với minimal info

---

### 3. `orderCreation.integration.test.js` - Tạo Đơn Hàng

**Mục đích:** Test validation & tạo đơn hàng.

**Các kịch bản test:**

#### 3.1 Order Validation
- ✅ Validate giỏ trước tạo order
- ✅ Validate từng item
- ✅ Detect missing required info

#### 3.2 Order Summary Calculation
- ✅ Tính đúng summary với nhiều items
- ✅ Summary với discount
- ✅ Export complete order data

#### 3.3 Order State Transitions
- ✅ Cart transit qua checkout states
- ✅ State consistency qua flow

#### 3.4 Multiple Items with Different Tax Rates
- ✅ Items với tax rate khác nhau
- ✅ Recalculate tax khi thay đổi items

#### 3.5 Order with Promotional Rules
- ✅ Áp dụng promotional discount
- ✅ Prevent discount vượt total
- ✅ Thay đổi discount code

#### 3.6 Order Verification Before Submission
- ✅ Verify checklist trước submit
- ✅ Provide complete order summary

---

## 🚀 Cách Chạy Kiểm Thử

### ✅ Chạy Unit Tests

```bash
# Chạy tất cả unit tests
npm test -- src/modules/checkout/tests/unit

# Chạy 1 unit test file
npm test -- src/modules/checkout/tests/unit/productPrice.test.js

# Chạy tests khớp pattern
npm test -- src/modules/checkout/tests/unit -t "discount"
```

### 🔗 Chạy Integration Tests

```bash
# Chạy tất cả integration tests
npm test -- src/modules/checkout/tests/integration

# Chạy 1 integration test file
npm test -- src/modules/checkout/tests/integration/cartManagement.integration.test.js

# Chạy tests khớp pattern
npm test -- src/modules/checkout/tests/integration -t "checkout flow"
```

### 📊 Chạy Tất Cả Tests (Unit + Integration)

```bash
# Chạy tất cả tests
npm test -- src/modules/checkout/tests

# Chạy với coverage report
npm test -- src/modules/checkout/tests --coverage

# Coverage threshold check (70% minimum)
npm test -- src/modules/checkout/tests --coverage --collectCoverageFrom="src/modules/checkout/**/*.{js,ts}"
```

### 🔄 Watch Mode

```bash
# Chạy tests và tự động rerun khi file thay đổi
npm test -- src/modules/checkout/tests --watch

# Watch unit tests only
npm test -- src/modules/checkout/tests/unit --watch
```

### 🐳 Chạy Trong Docker

```bash
# Khởi động Docker
docker-compose up -d

# Chạy tests trong container
docker-compose exec app npm test -- src/modules/checkout/tests

# Hoặc compile + test
docker-compose exec app npm run compile && npm test -- ./packages/evershop/dist/modules/checkout/tests
```

---

## 📊 Test Coverage & Metrics

### Coverage Yêu Cầu

| Metric | Minimum |
|--------|---------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

### Xem Coverage Report

```bash
npm test -- src/modules/checkout/tests --coverage

# Output example:
# ───────────────────────────────────────────────────
# File                    | % Stmts | % Branch | % Funcs
# ───────────────────────────────────────────────────
# services/cart/Cart.js   | 85.2    | 78.5     | 90.0
# services/discount.js    | 92.1    | 88.3     | 95.5
# ───────────────────────────────────────────────────
```

### Test Counts

```
Unit Tests:        13 files, ~40 test cases
Integration Tests: 3 files,  ~16 test cases
Total Tests:       16 files, ~56 test cases
```

---

## 🏗️ Cấu Trúc Dữ Liệu Test

### Products Mock (`products.js`)

```javascript
[
  { product_id: 1, sku: 'SKU1', price: 100, tax_percent: 10 },
  { product_id: 2, sku: 'SKU2', price: 150, tax_percent: 10 },
  { product_id: 3, sku: 'SKU3', price: 200, tax_percent: 0 },
  { product_id: 4, sku: 'SKU4', price: 300, tax_percent: 0 },
  { product_id: 5, sku: 'SKU5', price: 120, tax_percent: 7.25 }
]
```

### Coupons Mock (`coupons.js`)

```javascript
{
  'ten_percent_discount_to_entire_order': { type: 'percentage', amount: 10 },
  '100_fixed_discount_to_entire_order': { type: 'fixed', amount: 100 },
  '500_fixed_discount_to_entire_order': { type: 'fixed', amount: 500 }
}
```

### Tax Rates Mock (`taxRates.js`)

```javascript
{
  1: { rate: 10, description: 'Standard Tax' },
  2: { rate: 0, description: 'No Tax' }
}
```

### Cart Object

```javascript
{
  status: 1,
  items: [],
  sub_total: 0,
  tax_amount: 0,
  discount_amount: 0,
  grand_total: 0,
  coupon: null,
  shipping_method_code: null,
  shipping_address: null,
  billing_address: null
}
```

### Item Object

```javascript
{
  uuid: 'unique-id',
  product_id: 1,
  product_sku: 'SKU1',
  qty: 2,
  product_price: 100,
  product_price_incl_tax: 110,
  final_price: 100,
  final_price_incl_tax: 110,
  line_total: 200,
  line_total_incl_tax: 220,
  discount_amount: 10,
  tax_amount: 20
}
```

---

## ✅ Best Practices

### Unit Tests

1. **Mỗi test = 1 assertion**
   ```javascript
   // ✅ Tốt
   it('should calculate discount correctly', () => {
     expect(discount).toEqual(10);
   });
   ```

2. **Sử dụng describe để nhóm**
   ```javascript
   describe('discountAmount', () => {
     describe('with percentage', () => { /* tests */ });
     describe('with fixed amount', () => { /* tests */ });
   });
   ```

3. **Mock external dependencies**
   ```javascript
   jest.mock('../../services/database');
   ```

### Integration Tests

1. **Test realistic workflows**
   ```javascript
   // Full flow: add → update → discount → address
   const item = await cart.addItem(1, 2);
   await cart.updateItemQty(item.uuid, 1, 'increase');
   await cart.setData('coupon', 'discount_code');
   await cart.setData('shipping_address', {...});
   ```

2. **Verify state transitions**
   ```javascript
   // Before → After → Verify
   const total_before = cart.getData('grand_total');
   await cart.setData('coupon', code);
   const total_after = cart.getData('grand_total');
   expect(total_after).toBeLessThan(total_before);
   ```

3. **Test edge cases**
   ```javascript
   // Empty cart, single item, max items
   // No discount, 10%, 100%
   // Multiple tax rates
   ```

---

## 🐛 Troubleshooting

### ❌ Tests Không Chạy

```bash
# Kiểm tra naming convention
# ✅ Đúng: *.test.js, *.test.ts, *.integration.test.js
# ❌ Sai: *Test.js, *_test.js

# Xóa cache
npm test -- --clearCache

# Kiểm tra Jest config
cat jest.config.js
```

### ❌ Tests Fail

```bash
# Chạy với verbose
npm test -- --verbose

# Chạy cụ thể file
npm test -- src/modules/checkout/tests/unit/productPrice.test.js

# Xem chi tiết error
npm test -- --no-coverage --detectOpenHandles
```

### ❌ Coverage Không Đủ

```bash
# Xem coverage details
npm test -- --coverage --verbose

# Coverage từng file
npm test -- --coverage --collectCoverageFrom="src/modules/checkout/services/*.js"
```

---

## 📋 Test Execution Flow

```
Tests Execution:
├── Load basicSetup.js
│   ├── Load config (pricing, tax, coupons)
│   ├── Load products mock
│   ├── Reset hooks/processors
│   └── Setup test database
│
├── Run Unit Tests
│   ├── 9 Calculation Tests
│   │   └── Each tests 1 calculation function
│   └── 4 Service Tests
│       └── Each tests 1 service with mocks
│
├── Run Integration Tests
│   ├── cartManagement.integration.test.js
│   │   └── Full cart lifecycle scenarios
│   ├── checkoutFlow.integration.test.js
│   │   └── Complete checkout flow scenarios
│   └── orderCreation.integration.test.js
│       └── Order validation & creation scenarios
│
└── Generate Coverage Report
    └── Show % for branches, functions, lines, statements
```

---

## 📊 Summary

| Aspect | Details |
|--------|---------|
| **Unit Tests** | 13 files, ~40 test cases |
| **Integration Tests** | 3 files, ~16 test cases |
| **Total Tests** | 16 files, ~56 test cases |
| **Coverage Minimum** | 70% (branches, functions, lines, statements) |
| **Test Framework** | Jest |
| **Mocking** | Jest mocks for services and dependencies |
| **Run Command** | `npm test -- src/modules/checkout/tests` |
| **Coverage Command** | `npm test -- src/modules/checkout/tests --coverage` |

---

## 🔗 Quan Hệ Giữa Unit & Integration Tests

```
Unit Tests                          Integration Tests
├── Test hàm tính toán              ├── Test full flow
├── Mỗi test isolate                ├── Nhiều steps kết hợp
├── Test giá trị cụ thể              ├── Test relationships
├── Fast & independent               ├── Slower nhưng realistic
└── ~40 test cases                   └── ~16 test cases
```

**Ví dụ:**
- Unit Test: `productPrice × qty = lineTotal` ✅ Test 1 hàm
- Integration Test: add item → update qty → apply discount → verify all totals update ✅ Test quy trình

---

## 📖 Hướng Dẫn Chi Tiết

Để hiểu chi tiết từng test:
1. Xem **unit/** folder cho individual test cases
2. Xem **integration/** folder cho end-to-end workflows
3. Xem **basicSetup.js** để hiểu test setup
4. Xem **products.js** để hiểu mock data

**Run tests:**
```bash
npm test -- src/modules/checkout/tests
```

**Check coverage:**
```bash
npm test -- src/modules/checkout/tests --coverage
```
