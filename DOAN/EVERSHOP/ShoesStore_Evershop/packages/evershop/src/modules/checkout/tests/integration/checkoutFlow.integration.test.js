process.env.ALLOW_CONFIG_MUTATIONS = 'true';
import config from 'config';
import '../basicSetup.js';
import { Cart } from '../../services/cart/Cart.js';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

config.util.setModuleDefaults('pricing', {
  tax: {
    price_including_tax: false
  }
});

describe('Integration: Complete Checkout Flow', () => {
  let cart;

  beforeEach(() => {
    jest.clearAllMocks();
    cart = new Cart({ status: 1 });
  });

  describe('Shopping Cart to Order Creation', () => {
    it('should complete a full checkout flow from adding items to order validation', async () => {
      // Phase 1: Shopping - Add items to cart
      const item1 = await cart.addItem(1, 1);
      expect(item1).toBeDefined();
      expect(item1.getData('product_id')).toEqual(1);

      const item2 = await cart.addItem(2, 2);
      expect(item2).toBeDefined();
      expect(item2.getData('qty')).toEqual(2);

      expect(cart.getItems()).toHaveLength(2);
      expect(cart.getData('sub_total')).toBeGreaterThan(0);

      // Phase 2: Review Cart
      const cartItems = cart.getItems();
      expect(cartItems[0].getData('product_sku')).toBeDefined();
      expect(cartItems[1].getData('qty')).toEqual(2);

      // Phase 3: Apply Coupon
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');
      const discountApplied = cart.getData('discount_amount');
      expect(discountApplied).toBeGreaterThan(0);

      // Phase 4: Calculate Totals
      const subTotal = cart.getData('sub_total');
      const taxAmount = cart.getData('tax_amount');
      const discountAmount = cart.getData('discount_amount');
      const grandTotal = cart.getData('grand_total');

      expect(subTotal).toBeGreaterThan(0);
      expect(taxAmount).toBeGreaterThan(0);
      expect(grandTotal).toBeGreaterThan(0);
      expect(grandTotal).toBeLessThan(subTotal + taxAmount);

      // Phase 5: Add Shipping Address
      await cart.setData('shipping_address', {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
        address: '123 Main St',
        postcode: '94103'
      });
      expect(cart.getData('shipping_address')).toBeDefined();

      // Phase 6: Add Billing Address
      await cart.setData('billing_address', {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
        address: '123 Main St',
        postcode: '94103'
      });
      expect(cart.getData('billing_address')).toBeDefined();

      // Phase 7: Select Shipping Method
      await cart.setData('shipping_method_code', 'standard');
      expect(cart.getData('shipping_method_code')).toEqual('standard');

      // Phase 8: Verify All Information
      const exportedCart = cart.export();
      expect(exportedCart.items).toHaveLength(2);
      expect(exportedCart.coupon).toEqual('ten_percent_discount_to_entire_order');
      expect(exportedCart.shipping_address).toBeDefined();
      expect(exportedCart.billing_address).toBeDefined();
    });

    it('should maintain consistency throughout multi-step checkout', async () => {
      // Add items
      await cart.addItem(1, 1);
      const grandTotalAfterItem1 = cart.getData('grand_total');

      await cart.addItem(2, 1);
      const grandTotalAfterItem2 = cart.getData('grand_total');
      expect(grandTotalAfterItem2).toBeGreaterThan(grandTotalAfterItem1);

      // Apply coupon
      const grandTotalBeforeCoupon = cart.getData('grand_total');
      await cart.setData('coupon', '100_fixed_discount_to_entire_order');
      const grandTotalAfterCoupon = cart.getData('grand_total');
      expect(grandTotalAfterCoupon).toBeLessThan(grandTotalBeforeCoupon);

      // Verify discount is still applied after setting addresses
      await cart.setData('shipping_address', {
        firstname: 'John',
        lastname: 'Doe'
      });
      expect(cart.getData('discount_amount')).toBeGreaterThan(0);

      // Verify total hasn't changed unexpectedly
      const grandTotalAfterAddress = cart.getData('grand_total');
      expect(grandTotalAfterAddress).toEqual(grandTotalAfterCoupon);
    });
  });

  describe('Multiple Item Management During Checkout', () => {
    it('should handle item updates while in checkout flow', async () => {
      // Add initial items
      await cart.addItem(1, 1);
      await cart.addItem(2, 1);
      const initialTotal = cart.getData('grand_total');

      // Get item references
      const items = cart.getItems();
      const firstItemUuid = items[0].getData('uuid');

      // Update quantity during checkout
      await cart.updateItemQty(firstItemUuid, 1, 'increase', {});
      const totalAfterQtyUpdate = cart.getData('grand_total');
      expect(totalAfterQtyUpdate).toBeGreaterThan(initialTotal);

      // Apply coupon after updating quantity
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');
      const totalAfterCoupon = cart.getData('grand_total');
      expect(totalAfterCoupon).toBeLessThan(totalAfterQtyUpdate);

      // Continue with checkout
      await cart.setData('shipping_method_code', 'express');
      // Coupon should still be applied
      expect(cart.getData('discount_amount')).toBeGreaterThan(0);
    });

    it('should validate cart state at each checkout stage', async () => {
      // Stage 1: Empty cart validation
      expect(cart.getItems()).toHaveLength(0);

      // Stage 2: Add items and validate
      await cart.addItem(1, 1);
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getData('sub_total')).toBeGreaterThan(0);

      // Stage 3: Multiple items validation
      await cart.addItem(2, 1);
      expect(cart.getItems()).toHaveLength(2);
      const itemCount = cart.getItems().length;
      expect(itemCount).toEqual(2);

      // Stage 4: Discount validation
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');
      expect(cart.getData('discount_amount')).toBeGreaterThan(0);

      // Stage 5: Final total validation
      const grandTotal = cart.getData('grand_total');
      expect(grandTotal).toBeGreaterThan(0);
      expect(grandTotal).toBeLessThan(cart.getData('sub_total_incl_tax'));
    });
  });

  describe('Discount Application During Checkout', () => {
    it('should apply and update discount through checkout steps', async () => {
      // Add items
      await cart.addItem(1, 2);
      await cart.addItem(2, 1);

      const subTotalBeforeDiscount = cart.getData('sub_total');
      expect(cart.getData('discount_amount')).toEqual(0);

      // Apply discount
      await cart.setData('coupon', '100_fixed_discount_to_entire_order');
      const discountAmount = cart.getData('discount_amount');
      expect(discountAmount).toEqual(100);

      // Verify calculation
      const grandTotalWithDiscount = cart.getData('grand_total');
      const expectedGrandTotal =
        (subTotalBeforeDiscount - discountAmount) + cart.getData('tax_amount');
      expect(grandTotalWithDiscount).toBeCloseTo(expectedGrandTotal, 2);

      // Continue checkout with discount
      await cart.setData('shipping_method_code', 'standard');
      expect(cart.getData('discount_amount')).toEqual(discountAmount);

      // Change coupon
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');
      const newDiscountAmount = cart.getData('discount_amount');
      expect(newDiscountAmount).not.toEqual(discountAmount);
      expect(newDiscountAmount).toBeGreaterThan(0);
    });

    it('should handle invalid discounts gracefully', async () => {
      await cart.addItem(1, 1);
      const originalTotal = cart.getData('grand_total');

      // Apply invalid coupon (should not exist)
      await cart.setData('coupon', 'invalid_coupon_code');
      // Cart should remain unchanged
      expect(cart.getData('grand_total')).toEqual(originalTotal);
    });
  });

  describe('Tax Calculation During Checkout', () => {
    it('should calculate and update tax through checkout stages', async () => {
      const pricingConfig = config.get('pricing');
      pricingConfig.tax.price_including_tax = false;

      // Stage 1: Single item
      await cart.addItem(1, 1); // 10% tax
      const taxWithItem1 = cart.getData('tax_amount');
      expect(taxWithItem1).toBeGreaterThan(0);

      // Stage 2: Add another item
      await cart.addItem(5, 1); // 7.25% tax
      const taxWithItem2 = cart.getData('tax_amount');
      expect(taxWithItem2).toBeGreaterThan(taxWithItem1);

      // Stage 3: Apply discount
      const taxBeforeDiscount = cart.getData('tax_amount');
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');
      const taxAfterDiscount = cart.getData('tax_amount');
      expect(taxAfterDiscount).toBeLessThan(taxBeforeDiscount);

      // Stage 4: Update quantity
      const items = cart.getItems();
      const taxBeforeQtyUpdate = cart.getData('tax_amount');
      await cart.updateItemQty(items[0].getData('uuid'), 1, 'increase', {});
      const taxAfterQtyUpdate = cart.getData('tax_amount');
      expect(taxAfterQtyUpdate).toBeGreaterThan(taxBeforeQtyUpdate);
    });

    it('should maintain tax consistency with tax-included pricing', async () => {
      const pricingConfig = config.get('pricing');
      pricingConfig.tax.price_including_tax = true;

      await cart.addItem(1, 1);
      const item = cart.getItems()[0];

      // With tax-included pricing
      const productPrice = item.getData('product_price');
      const productPriceInclTax = item.getData('product_price_incl_tax');

      // Price included tax should equal the set price
      expect(productPriceInclTax).toEqual(100);
      expect(productPrice).toBeLessThan(100);
    });
  });

  describe('Address Management During Checkout', () => {
    it('should handle shipping and billing address separately', async () => {
      await cart.addItem(1, 1);

      const shippingAddress = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
        address: '123 Main St',
        postcode: '94103'
      };

      const billingAddress = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane@example.com',
        country: 'US',
        state: 'NY',
        city: 'New York',
        address: '456 Oak Ave',
        postcode: '10001'
      };

      // Set addresses
      await cart.setData('shipping_address', shippingAddress);
      await cart.setData('billing_address', billingAddress);

      // Verify addresses are stored correctly
      const storedShipping = cart.getData('shipping_address');
      const storedBilling = cart.getData('billing_address');

      expect(storedShipping.city).toEqual('San Francisco');
      expect(storedBilling.city).toEqual('New York');
      expect(storedShipping).not.toEqual(storedBilling);
    });

    it('should allow same address for both shipping and billing', async () => {
      await cart.addItem(1, 1);

      const address = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
        address: '123 Main St',
        postcode: '94103'
      };

      // Use same address for both
      await cart.setData('shipping_address', address);
      await cart.setData('billing_address', address);

      expect(cart.getData('shipping_address')).toEqual(address);
      expect(cart.getData('billing_address')).toEqual(address);
      expect(cart.getData('shipping_address')).toEqual(cart.getData('billing_address'));
    });
  });

  describe('Shipping Method Selection During Checkout', () => {
    it('should set and verify shipping method', async () => {
      await cart.addItem(1, 1);

      // Try different shipping methods
      const shippingMethods = ['standard', 'express', 'overnight'];

      for (const method of shippingMethods) {
        await cart.setData('shipping_method_code', method);
        expect(cart.getData('shipping_method_code')).toEqual(method);
      }
    });

    it('should allow changing shipping method during checkout', async () => {
      await cart.addItem(1, 1);
      const initialTotal = cart.getData('grand_total');

      // Select standard shipping
      await cart.setData('shipping_method_code', 'standard');
      const methodAfterStandard = cart.getData('shipping_method_code');
      expect(methodAfterStandard).toEqual('standard');

      // Change to express shipping
      await cart.setData('shipping_method_code', 'express');
      const methodAfterExpress = cart.getData('shipping_method_code');
      expect(methodAfterExpress).toEqual('express');
    });
  });

  describe('End-to-End Checkout Validation', () => {
    it('should have all required fields for order creation', async () => {
      // Add items
      await cart.addItem(1, 1);
      await cart.addItem(2, 1);

      // Add addresses
      await cart.setData('shipping_address', {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
        address: '123 Main St',
        postcode: '94103'
      });

      await cart.setData('billing_address', {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
        address: '123 Main St',
        postcode: '94103'
      });

      // Select shipping method
      await cart.setData('shipping_method_code', 'standard');

      // Verify all required data
      const exported = cart.export();
      expect(exported.items.length).toBeGreaterThan(0);
      expect(exported.items[0].product_id).toBeDefined();
      expect(exported.items[0].qty).toBeGreaterThan(0);
      expect(exported.shipping_address).toBeDefined();
      expect(exported.billing_address).toBeDefined();
      expect(exported.shipping_method_code).toBeDefined();
      expect(exported.grand_total).toBeGreaterThan(0);
    });

    it('should allow completing checkout with minimal required information', async () => {
      // Minimal checkout
      await cart.addItem(1, 1);

      // Just need items
      expect(cart.getItems().length).toBeGreaterThan(0);
      expect(cart.getData('grand_total')).toBeGreaterThan(0);

      // Optional but can be set
      await cart.setData('shipping_address', {
        firstname: 'John',
        lastname: 'Doe'
      });

      const exported = cart.export();
      expect(exported).toBeDefined();
      expect(exported.items).toBeDefined();
      expect(exported.grand_total).toBeDefined();
    });
  });
});
