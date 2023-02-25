import { products } from './mocks/mocks';

export const getProductsList = async (event, context, callback) => {
  try {
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(products),
    };

    return callback(null, response);
  } catch (error) {``
    console.log('Error in getProductsList, Product not found ', error)
    return callback(e);
  }
};
