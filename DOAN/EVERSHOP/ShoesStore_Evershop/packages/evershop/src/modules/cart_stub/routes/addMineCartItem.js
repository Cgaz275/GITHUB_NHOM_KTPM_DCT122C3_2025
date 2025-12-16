export default {
  id: 'addMineCartItem',
  method: 'POST',
  path: '/cart/add',
  handler: async (req, res) => {
    res.json({
      success: false,
      message: 'Cart module is disabled'
    });
  }
};