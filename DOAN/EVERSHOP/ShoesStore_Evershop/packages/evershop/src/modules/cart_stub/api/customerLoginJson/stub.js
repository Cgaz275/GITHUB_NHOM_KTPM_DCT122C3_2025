export default async (request, response, next) => {
  response.status(200);
  response.json({
    success: true,
    message: 'Auth module is stubbed',
    data: {
      sid: request.sessionID || 'stub-session-id'
    }
  });
};
