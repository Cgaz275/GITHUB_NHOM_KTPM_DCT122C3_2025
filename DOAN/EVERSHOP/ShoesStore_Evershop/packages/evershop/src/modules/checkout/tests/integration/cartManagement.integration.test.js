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

describe('Integration: Cart Management Workflow', () => {
  let cart;

  beforeEach(() => {
    jest.clearAllMocks();
    cart = new Cart({ status: 1 });
  });

  describe('Complete Cart Lifecycle', () => {
    it('should manage cart from creation to final state', async () => {
      // Step 1: Create empty cart
      expect(cart.getItems()).toHaveLength(0);

      // Step 2: Add multiple items
      const item1 = await cart.addItem(1, 2);
      expect(item1.getData('qty')).toEqual(2);
      expect(cart.getItems()).toHaveLength(1);

      const item2 = await cart.addItem(2, 1);
      expect(item2.getData('qty')).toEqual(1);
      expect(cart.getItems()).toHaveLength(2);

      const item3 = await cart.addItem(3, 3);
      expect(item3.getData('qty')).toEqual(3);
      expect(cart.getItems()).toHaveLength(3);

      // Step 3: Verify total calculations
      expect(cart.getData('sub_total')).toBeGreaterThan(0);
      expect(cart.getData('grand_total')).toBeGreaterThan(0);

      // Step 4: Update item quantities
      const items = cart.getItems();
      await cart.updateItemQty(items[0].getData('uuid'), 1, 'decrease', {});
      expect(items[0].getData('qty')).toEqual(1);

      // Step 5: Remove an item
      await cart.removeItem(items[2].getData('uuid'));
      expect(cart.getItems()).toHaveLength(2);

      // Step 6: Apply coupon
      const originalTotal = cart.getData('grand_total');
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');
      expect(cart.getData('discount_amount')).toBeGreaterThan(0);
      expect(cart.getData('grand_total')).toBeLessThan(originalTotal);

      // Step 7: Save cart state
      await cart.setData('status', 1);
      expect(cart.getData('status')).toEqual(1);
    });

    it('should handle duplicate items by combining quantities', async () => {
      // Add same product twice
      await cart.addItem(1, 2);
      const itemsBefore = cart.getItems();
      expect(itemsBefore).toHaveLength(1);
      expect(itemsBefore[0].getData('qty')).toEqual(2);

      // Add same product again
      await cart.addItem(1, 3);
      const itemsAfter = cart.getItems();
      expect(itemsAfter).toHaveLength(1);
      expect(itemsAfter[0].getData('qty')).toEqual(5);
    });

    it('should maintain cart consistency when adding and removing items', async () => {
      // Add multiple different items
      await cart.addItem(1, 2);
      await cart.addItem(2, 1);
      await cart.addItem(3, 1);
      expect(cart.getItems()).toHaveLength(3);

      const subtotalWith3Items = cart.getData('sub_total');

      // Remove middle item
      const items = cart.getItems();
      await cart.removeItem(items[1].getData('uuid'));
      expect(cart.getItems()).toHaveLength(2);

      // Subtotal should be less
      const subtotalWith2Items = cart.getData('sub_total');
      expect(subtotalWith2Items).toBeLessThan(subtotalWith3Items);

      // Add it back
      await cart.addItem(2, 1);
      expect(cart.getItems()).toHaveLength(3);

      // Subtotal should be roughly the same
      const subtotalAfterReAdd = cart.getData('sub_total');
      expect(Math.abs(subtotalAfterReAdd - subtotalWith3Items)).toBeLessThan(1);
    });

    it('should calculate correct totals with multiple quantity updates', async () => {
      await cart.addItem(1, 1);
      const initialTotal = cart.getData('grand_total');

      const items = cart.getItems();
      const itemUuid = items[0].getData('uuid');

      // Increase quantity multiple times
      await cart.updateItemQty(itemUuid, 1, 'increase', {});
      const totalAfterFirstIncrease = cart.getData('grand_total');
      expect(totalAfterFirstIncrease).toBeGreaterThan(initialTotal);

      await cart.updateItemQty(itemUuid, 2, 'increase', {});
      const totalAfterSecondIncrease = cart.getData('grand_total');
      expect(totalAfterSecondIncrease).toBeGreaterThan(totalAfterFirstIncrease);

      // Decrease quantity
      await cart.updateItemQty(itemUuid, 2, 'decrease', {});
      const totalAfterDecrease = cart.getData('grand_total');
      expect(totalAfterDecrease).toBeLessThan(totalAfterSecondIncrease);
    });
  });

  describe('Cart with Discounts and Tax', () => {
    it('should apply discount and recalculate all totals correctly', async () => {
      // Add items
      await cart.addItem(1, 2);
      await cart.addItem(2, 1);

      const subTotalWithoutDiscount = cart.getData('sub_total');
      const discountAmountBefore = cart.getData('discount_amount');
      expect(discountAmountBefore).toEqual(0);

      // Apply discount
      await cart.setData('coupon', '100_fixed_discount_to_entire_order');
      const discountAmountAfter = cart.getData('discount_amount');
      expect(discountAmountAfter).toEqual(100);

      // Verify relationships
      const subTotalWithDiscount = cart.getData('sub_total_with_discount');
      expect(subTotalWithDiscount).toEqual(subTotalWithoutDiscount - 100);

      const grandTotal = cart.getData('grand_total');
      expect(grandTotal).toBeLessThan(cart.getData('sub_total_incl_tax'));
    });

    it('should handle tax calculation with multiple items and discounts', async () => {
      const pricingConfig = config.get('pricing');
      pricingConfig.tax.price_including_tax = false;

      // Add items with different tax rates
      await cart.addItem(1, 1); // 10% tax
      await cart.addItem(5, 1); // 7.25% tax
      await cart.addItem(2, 1); // 10% tax

      const taxAmountWithoutDiscount = cart.getData('tax_amount');
      expect(taxAmountWithoutDiscount).toBeGreaterThan(0);

      // Apply discount
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');

      const taxAmountWithDiscount = cart.getData('tax_amount');
      // Tax should be less after discount
      expect(taxAmountWithDiscount).toBeLessThan(taxAmountWithoutDiscount);

      // Grand total should be: (sub_total - discount) + tax
      const expectedGrandTotal =
        (cart.getData('sub_total') - cart.getData('discount_amount')) +
        taxAmountWithDiscount;
      expect(cart.getData('grand_total')).toBeCloseTo(expectedGrandTotal, 2);
    });

    it('should prevent discount from exceeding cart total', async () => {
      // Add small item
      await cart.addItem(3, 1); // Product 3 with price 200, no tax

      // Try to apply large discount
      await cart.setData('coupon', '500_fixed_discount_to_entire_order');

      // Discount should be capped at cart total
      const discountAmount = cart.getData('discount_amount');
      const subTotal = cart.getData('sub_total');
      expect(discountAmount).toBeLessThanOrEqual(subTotal);

      // Grand total should never be negative
      const grandTotal = cart.getData('grand_total');
      expect(grandTotal).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cart Persistence and State', () => {
    it('should preserve cart state across operations', async () => {
      // Set up cart with items
      await cart.addItem(1, 2);
      await cart.addItem(2, 1);
      const uuid1 = cart.getItems()[0].getData('uuid');

      // Export current state
      const exportedBefore = cart.export();
      expect(exportedBefore.items).toHaveLength(2);

      // Perform operations
      const items = cart.getItems();
      await cart.updateItemQty(items[0].getData('uuid'), 1, 'increase', {});

      // Export new state
      const exportedAfter = cart.export();
      expect(exportedAfter.items).toHaveLength(2);
      expect(exportedAfter.items[0].uuid).toEqual(uuid1);
      expect(exportedAfter.items[0].qty).toEqual(3);
    });

    it('should handle empty cart state correctly', async () => {
      // Start with empty cart
      expect(cart.getItems()).toHaveLength(0);
      expect(cart.getData('sub_total')).toEqual(0);
      expect(cart.getData('grand_total')).toEqual(0);

      // Add then remove item
      await cart.addItem(1, 1);
      expect(cart.getItems()).toHaveLength(1);

      const items = cart.getItems();
      await cart.removeItem(items[0].getData('uuid'));
      expect(cart.getItems()).toHaveLength(0);

      // Empty cart state
      expect(cart.getData('sub_total')).toEqual(0);
      expect(cart.getData('grand_total')).toEqual(0);
      expect(cart.getData('discount_amount')).toEqual(0);
      expect(cart.getData('tax_amount')).toEqual(0);
    });
  });

  describe('Complex Cart Scenarios', () => {
    it('should handle sequential add/remove/update operations', async () => {
      // Sequential operations
      await cart.addItem(1, 1);
      expect(cart.getItems()).toHaveLength(1);

      const items1 = cart.getItems();
      await cart.updateItemQty(items1[0].getData('uuid'), 1, 'increase', {});

      await cart.addItem(2, 2);
      expect(cart.getItems()).toHaveLength(2);

      const items2 = cart.getItems();
      await cart.removeItem(items2[1].getData('uuid'));
      expect(cart.getItems()).toHaveLength(1);

      await cart.addItem(3, 1);
      expect(cart.getItems()).toHaveLength(2);

      // Final state verification
      const finalItems = cart.getItems();
      expect(finalItems[0].getData('product_id')).toEqual(1);
      expect(finalItems[1].getData('product_id')).toEqual(3);
    });

    it('should recalculate all totals correctly after complex operations', async () => {
      await cart.addItem(1, 2);
      await cart.addItem(2, 1);
      await cart.addItem(3, 1);

      let grandTotal = cart.getData('grand_total');
      expect(grandTotal).toBeGreaterThan(0);

      // Apply discount
      await cart.setData('coupon', 'ten_percent_discount_to_entire_order');
      const totalWithDiscount = cart.getData('grand_total');
      expect(totalWithDiscount).toBeLessThan(grandTotal);

      // Update quantities
      const items = cart.getItems();
      await cart.updateItemQty(items[0].getData('uuid'), 1, 'decrease', {});
      const totalAfterQtyUpdate = cart.getData('grand_total');
      expect(totalAfterQtyUpdate).toBeLessThan(totalWithDiscount);

      // Remove item
      await cart.removeItem(items[2].getData('uuid'));
      const finalTotal = cart.getData('grand_total');
      expect(finalTotal).toBeLessThan(totalAfterQtyUpdate);

      // Add new item
      await cart.addItem(4, 1);
      const totalAfterNewItem = cart.getData('grand_total');
      expect(totalAfterNewItem).toBeGreaterThan(finalTotal);
    });

    it('should maintain data consistency with tax setting changes', async () => {
      const pricingConfig = config.get('pricing');

      // Add items with tax excluded
      pricingConfig.tax.price_including_tax = false;
      await cart.addItem(1, 1);

      const item1Price = cart.getItems()[0].getData('product_price');
      const item1PriceInclTax = cart.getItems()[0].getData('product_price_incl_tax');
      expect(item1PriceInclTax).toBeGreaterThan(item1Price);

      // Rebuild with tax included
      pricingConfig.tax.price_including_tax = true;
      const items = cart.getItems();
      for (const item of items) {
        await item.build();
      }
      await cart.build();

      const item1PriceAfterChange = cart.getItems()[0].getData('product_price');
      const item1PriceInclTaxAfterChange = cart.getItems()[0].getData('product_price_incl_tax');
      expect(item1PriceInclTaxAfterChange).toEqual(100);
      expect(item1PriceAfterChange).toBeLessThan(100);
    });
  });
});
