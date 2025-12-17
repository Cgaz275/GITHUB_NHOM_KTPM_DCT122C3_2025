import { translate } from '../../../../lib/locale/translate/translate.js';

export default async (request, response, next) => {
  if (response.statusCode !== 404) {
    next();
  } else {
    next();
  }
};
