export default async (request, response, next) => {
  response.status(200);
  response.json({
    success: true,
    message: 'Logout successful'
  });
};
