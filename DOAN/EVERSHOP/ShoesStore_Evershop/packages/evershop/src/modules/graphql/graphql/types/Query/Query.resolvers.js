export default {
  Query: {
    hello: () => 'Hello EverShop!',
    myCart: () => ({
      uuid: 'stub-cart',
      items: [],
      totals: {
        subTotal: { value: 0, text: '$0.00' },
        tax: { value: 0, text: '$0.00' },
        discount: { value: 0, text: '$0.00' },
        total: { value: 0, text: '$0.00' }
      },
      addItemApi: '/cart/add',
      removeApi: '/cart/remove',
      updateQtyApi: '/cart/update',
      checkoutApi: '/checkout',
      applyCouponApi: '/cart/coupon',
      removeCouponApi: '/cart/coupon/remove',
      addPaymentMethodApi: '/checkout/payment',
      addShippingMethodApi: '/checkout/shipping',
      addContactInfoApi: '/checkout/contact',
      addAddressApi: '/checkout/address',
      addNoteApi: '/checkout/note',
      availableShippingMethods: [],
      availablePaymentMethods: []
    }),
    currentCustomer: () => ({
      customerId: null,
      uuid: null,
      email: null,
      fullName: null,
      groupId: null,
      addresses: [],
      orders: []
    }),
    themeConfig: () => ({
      copyRight: '© 2025 EverShop. All Rights Reserved.'
    })
  }
};
