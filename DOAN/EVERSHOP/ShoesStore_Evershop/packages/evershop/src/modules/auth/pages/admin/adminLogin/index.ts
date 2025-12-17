import { buildUrl } from '../../../../../lib/router/buildUrl.js';

export default (request, response, next) => {
  // Check if the user is logged in
  const user = request.getCurrentUser();
  if (user) {
    // Redirect to admin dashboard
    response.redirect(buildUrl('dashboard'));
  } else {
    next();
  }
};
