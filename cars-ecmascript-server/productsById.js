import { products } from './mocks/mocks';

export const getProductsById = (event, context, callback) => {
  try {
    const {pathParameters: { productId }} = event;
    const searchResult = products.find((elem) => elem.id === Number(productId));

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(searchResult),
    };
    return callback(null, response);
  } catch (error) {
    console.log('Error in getProductsById, Product not found ', error);
    return callback(error);
  }
};
