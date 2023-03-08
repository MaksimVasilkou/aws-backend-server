import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

export const createProduct = async (event, context, callback) => {
  try {
    console.log(
      `execution func createProduct, Event = ${event}, context = ${context}, callback = ${callback}`
    );
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const {
      body: productRaw,
    } = event;
    const product = JSON.parse(productRaw);
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };


    if (product && product.description && product.title && product.price) {
      try {
        const productId = uuid();
        const productResult = await dynamodb
          .put({
            TableName: process.env.PRODUCT_TABLE,
            Item: {
              id: productId,
              description: product.description,
              title: product.title,
              price: product.price,
            },
          })
          .promise();
        const countResult = await dynamodb
          .put({
            TableName: process.env.STOCK_TABLE,
            Item: {
              product_id: productId,
              count: product.count
            },
          })
          .promise();

        response.body = JSON.stringify({
          productId: productId
        });
      } catch (error) {
        console.log(`Error during createProduct, ${error}`);
        return callback(new Error(`[400] product fields invalid`));
      }
    } else {
      return callback(new Error(`[400] product object empty or fields absent`));
    }

    return callback(null, response);
  } catch (error) {
    console.log('Error in createProduct', error);
    return callback(new Error(`[500] Internal error, ${error.errorMessage}`));
  }
};
