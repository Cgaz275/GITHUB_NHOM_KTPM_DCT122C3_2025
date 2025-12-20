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

describe('Integration: Order Validation and Creation', () => {
  let cart;

  beforeEach(() => {
    jest.clearAllMocks();
    cart = new Cart({ status: 1 });
  });

  describe('Order Validation', () => {
    it('should validate cart before order creation', async () => {
      // Add items
      await cart.addItem(1, 1);
      await cart.addItem(2, 2);

      // Check cart has items
      expect(cart.getItems().length).toBeGreaterThan(0);

      // Verify each item is valid
      const items = cart.getItems();
      for (const item of items) {
        expect(item.getData('product_id')).toBeDefined();
        expect(item.getData('qty')).toBeGreaterThan(0);
        expect(item.getData('product_sku')).toBeDefined();
      }

      // Verify totals are calculated
      expect(cart.getData('sub_total')).toBeGreaterThan(0);
      expect(cart.getData('grand_total')).toBeGreaterThan(0);
    });

    it('should validate cart with addresses and shipping', async () => {
      // Setup cart
      await cart.addItem(1, 1);

      // Add required address information
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

      await cart.setData('shipping_address', address);
      await cart.setData('billing_address', address);

      // Validate addresses
      expect(cart.getData('shipping_address')).toBeDefined();
      expect(cart.getData('shipping_address').firstname).toEqual('John');
      expect(cart.getData('billing_address')).toBeDefined();
      expect(cart.getData('billing_address').firstname).toEqual('John');

      // Set shipping method
      await cart.setData('shipping_method_code', 'standard');
      expect(cart.getData('shipping_method_code')).toBeDefined();
    });

    it('should detect missing required information', async () => {
      // Empty cart should fail validation
      expect(cart.getItems().length).toEqual(0);

      // Add item to pass first validation
      await cart.addItem(1, 1);
      expect(cart.getItems().length).toBeGreaterThan(0);

      // Missing addresses should be detectable
      expect(cart.getData('shipping_address')).toBeUndefined();
      expect(cart.getData('billing_address')).toBeUndefined();
    });

    it('should validate item data integrity', async () => {
      const item = await cart.addItem(1, 2);

      // Verify all required item data
      const itemData = {
        product_id: item.getData('product_id'),
        product_sku: item.getData('product_sku'),
        qty: item.getData('qty'),
        product_price: item.getData('product_price'),
        line_total: item.getData('line_total')
      };

      expect(itemData.product_id).toEqual(1);
      expect(itemData.product_sku).toBeDefined();
      expect(itemData.qty).toEqual(2);
      expect(itemData.product_price).toBeGreaterThan(0);
      expect(itemData.line_total).toBeGreaterThan(0);
    });
  });

  describe('Order Summary Calculation', () => {
    it('should calculate accurate order summary with multiple items', async () => {
      await cart.addItem(1, 1);
      await cart.addItem(2, 2);
      await cart.addItem(3, 1);

      const orderSummary = {
        items: cart.getItems(),
        sub_total: cart.getData('sub_total'),
        tax_amount: cart.getData('tax_amount'),
        discount_amount: cart.getData('discount_amount'),
        grand_total: cart.getData('grand_total')
      };

      expect(orderSummary.items.length).toEqual(3);
      expect(orderSummary.sub_total).toBeGreaterThan(0);
      expect(orderSummary.tax_amount).toBeGreaterThan(0);
      expect(orderSummary.grand_total).toBeGreaterThan(0);

      // Verify grand total calculation
      const expectedGrandTotal =
        orderSummary.sub_total + orderSummary.tax_amount - orderSummary.discount_amount;
      expect(orderSummary.grand_total).toBeCloseTo(expectedGrandTotal, 2);
    });

    it('should generate correct order summary with applied discount', async () => {
      await cart.addItem(1, 2);
      await cart.addItem(2, 1);

      const subTotalBeforeDiscount = cart.getData('sub_total');

      // Apply discount
      await cart.setData('coupon', '100_fixed_discount_to_entire_order');

      const orderSummary = {
        sub_total: cart.getData('sub_total'),
        discount_amount: cart.getData('discount_amount'),
        tax_amount: cart.getData('tax_amount'),
        sub_total_with_discount: cart.getData('sub_total_with_discount'),
        grand_total: cart.getData('grand_total')
      };

      expect(orderSummary.discount_amount).toEqual(100);
      expect(orderSummary.sub_total).toEqual(subTotalBeforeDiscount);
      expect(orderSummary.grand_total).toBeLessThan(
        orderSummary.sub_total + orderSummary.tax_amount
      );
    });

    it('should export complete order data', async () => {
      // Build complete order
      await cart.addItem(1, 1);
      await cart.addItem(2, 2);

      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');

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

      await cart.setData('shipping_method_code', 'standard');

      // Export complete data
      const exportedData = cart.export();

      expect(exportedData).toHaveProperty('items');
      expect(exportedData).toHaveProperty('sub_total');
      expect(exportedData).toHaveProperty('tax_amount');
      expect(exportedData).toHaveProperty('discount_amount');
      expect(exportedData).toHaveProperty('grand_total');
      expect(exportedData).toHaveProperty('coupon');
      expect(exportedData).toHaveProperty('shipping_address');
      expect(exportedData).toHaveProperty('billing_address');
      expect(exportedData).toHaveProperty('shipping_method_code');

      expect(exportedData.items.length).toEqual(2);
      expect(exportedData.coupon).toEqual('ten_percent_discount_to_entire_order');
    });
  });

  describe('Order State Transitions', () => {
    it('should transition cart through checkout states', async () => {
      // Initial state: pending
      expect(cart.getData('status')).toEqual(1);

      // Add items
      await cart.addItem(1, 1);
      expect(cart.getData('status')).toEqual(1);

      // Add address
      await cart.setData('shipping_address', {
        firstname: 'John',
        lastname: 'Doe'
      });
      expect(cart.getData('status')).toEqual(1);

      // Set shipping
      await cart.setData('shipping_method_code', 'standard');
      expect(cart.getData('status')).toEqual(1);

      // Ready for payment
      const isReadyForPayment = cart.getItems().length > 0 &&
        cart.getData('shipping_address') &&
        cart.getData('shipping_method_code');
      expect(isReadyForPayment).toBe(true);
    });

    it('should maintain state consistency during order creation flow', async () => {
      const initialStatus = cart.getData('status');

      // Add items
      const item1 = await cart.addItem(1, 2);
      const statusAfterItem1 = cart.getData('status');

      const item2 = await cart.addItem(2, 1);
      const statusAfterItem2 = cart.getData('status');

      // Status should remain consistent
      expect(initialStatus).toEqual(statusAfterItem1);
      expect(statusAfterItem1).toEqual(statusAfterItem2);

      // But totals should change
      const items = cart.getItems();
      expect(items.length).toEqual(2);
    });
  });

  describe('Multiple Items with Different Tax Rates', () => {
    it('should correctly handle items with different tax rates in order', async () => {
      // Add items with different tax rates
      await cart.addItem(1, 1); // 10% tax
      await cart.addItem(5, 1); // 7.25% tax
      await cart.addItem(2, 1); // 10% tax

      const items = cart.getItems();
      expect(items.length).toEqual(3);

      // Each item should calculate its own tax
      for (const item of items) {
        const taxAmount = item.getData('tax_amount');
        expect(taxAmount).toBeGreaterThanOrEqual(0);
      }

      // Total tax should be sum of all item taxes
      const totalTax = cart.getData('tax_amount');
      expect(totalTax).toBeGreaterThan(0);

      // Grand total should include all taxes
      const grandTotal = cart.getData('grand_total');
      expect(grandTotal).toBeGreaterThan(0);
    });

    it('should recalculate tax correctly when changing items in order', async () => {
      await cart.addItem(1, 1); // 10% tax
      const taxAfterItem1 = cart.getData('tax_amount');

      await cart.addItem(5, 1); // 7.25% tax
      const taxAfterItem2 = cart.getData('tax_amount');
      expect(taxAfterItem2).toBeGreaterThan(taxAfterItem1);

      await cart.addItem(2, 1); // 10% tax
      const taxAfterItem3 = cart.getData('tax_amount');
      expect(taxAfterItem3).toBeGreaterThan(taxAfterItem2);

      // Remove middle item
      const items = cart.getItems();
      await cart.removeItem(items[1].getData('uuid'));
      const taxAfterRemove = cart.getData('tax_amount');
      expect(taxAfterRemove).toBeLessThan(taxAfterItem3);
    });
  });

  describe('Order with Promotional Rules', () => {
    it('should apply promotional discount to final order', async () => {
      // Create order
      await cart.addItem(1, 3);
      const grandTotalWithoutPromo = cart.getData('grand_total');

      // Apply promotional discount
      await cart.setData('coupon', '100_fixed_discount_to_entire_order');
      const grandTotalWithPromo = cart.getData('grand_total');

      expect(grandTotalWithPromo).toBeLessThan(grandTotalWithoutPromo);

      // Verify discount amount
      const discountAmount = cart.getData('discount_amount');
      expect(discountAmount).toEqual(100);

      // Expected: (sub_total - discount) + tax
      const expectedTotal =
        (cart.getData('sub_total') - 100) + cart.getData('tax_amount');
      expect(grandTotalWithPromo).toBeCloseTo(expectedTotal, 2);
    });

    it('should prevent discount from exceeding order total', async () => {
      await cart.addItem(3, 1); // Price 200
      const subTotal = cart.getData('sub_total');

      // Apply excessive discount
      await cart.setData('coupon', '500_fixed_discount_to_entire_order');

      const discountAmount = cart.getData('discount_amount');
      expect(discountAmount).toBeLessThanOrEqual(subTotal);

      // Grand total should never be negative
      const grandTotal = cart.getData('grand_total');
      expect(grandTotal).toBeGreaterThanOrEqual(0);
    });

    it('should allow changing discount code before order creation', async () => {
      await cart.addItem(1, 2);

      // Apply first discount
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');
      const discountWith10Percent = cart.getData('discount_amount');

      // Change to different discount
      await cart.setData('coupon', '100_fixed_discount_to_entire_order');
      const discountWith100Fixed = cart.getData('discount_amount');

      expect(discountWith10Percent).not.toEqual(discountWith100Fixed);

      // Verify new discount is applied
      const currentDiscount = cart.getData('discount_amount');
      expect(currentDiscount).toEqual(discountWith100Fixed);
    });
  });

  describe('Order Verification Before Submission', () => {
    it('should verify all order data before submission', async () => {
      // Build complete order
      await cart.addItem(1, 1);
      await cart.addItem(2, 2);

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

      await cart.setData('shipping_method_code', 'standard');

      // Verification checklist
      const orderVerification = {
        has_items: cart.getItems().length > 0,
        has_valid_total: cart.getData('grand_total') > 0,
        has_shipping_address: cart.getData('shipping_address') !== undefined,
        has_billing_address: cart.getData('billing_address') !== undefined,
        has_shipping_method: cart.getData('shipping_method_code') !== undefined,
        items_count: cart.getItems().length,
        grand_total: cart.getData('grand_total')
      };

      expect(orderVerification.has_items).toBe(true);
      expect(orderVerification.has_valid_total).toBe(true);
      expect(orderVerification.has_shipping_address).toBe(true);
      expect(orderVerification.has_billing_address).toBe(true);
      expect(orderVerification.has_shipping_method).toBe(true);
      expect(orderVerification.items_count).toEqual(2);
      expect(orderVerification.grand_total).toBeGreaterThan(0);
    });

    it('should provide complete order summary for confirmation', async () => {
      await cart.addItem(1, 1);
      await cart.addItem(2, 1);
      await cart.addItem(3, 1);

      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');

      const orderSummaryForConfirmation = {
        items: cart.getItems().map(item => ({
          product_id: item.getData('product_id'),
          product_sku: item.getData('product_sku'),
          qty: item.getData('qty'),
          price: item.getData('product_price'),
          line_total: item.getData('line_total')
        })),
        pricing: {
          sub_total: cart.getData('sub_total'),
          tax_amount: cart.getData('tax_amount'),
          discount_amount: cart.getData('discount_amount'),
          grand_total: cart.getData('grand_total')
        }
      };

      expect(orderSummaryForConfirmation.items.length).toEqual(3);
      expect(orderSummaryForConfirmation.pricing.grand_total).toBeGreaterThan(0);
      expect(orderSummaryForConfirmation.pricing.discount_amount).toBeGreaterThan(0);
    });
  });
});
