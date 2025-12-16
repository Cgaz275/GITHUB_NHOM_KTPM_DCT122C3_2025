import { select } from '@evershop/postgres-query-builder';
import { pool } from '../../../../../lib/postgres/connection.js';

export default async (request, response, next) => {
  const { customerID } = request.session || {};
  
  // Load the customer from the database if logged in
  if (customerID) {
    const customer = await select()
      .from('customer')
      .where('customer_id', '=', customerID)
      .and('status', '=', 1)
      .load(pool);

    if (customer) {
      // Delete sensitive fields
      delete customer.password;
      request.locals.customer = customer;
    }
  }

  // For frontStore, we always continue regardless of login status
  next();
};
