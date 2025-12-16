export default async (request, response, next) => {
  response.status(200);
  response.json({
    success: true,
    message: 'Cart module is stubbed - item added',
    data: {
      item: {},
      count: 0,
      cartId: null
    }
  });
};
