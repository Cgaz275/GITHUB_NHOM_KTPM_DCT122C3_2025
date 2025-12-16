export default async (request, response, next) => {
  response.status(200);
  response.json({
    success: true,
    message: 'Customer module is stubbed',
    data: {
      customer_id: null,
      email: request.body?.email || 'stub@example.com'
    }
  });
};
