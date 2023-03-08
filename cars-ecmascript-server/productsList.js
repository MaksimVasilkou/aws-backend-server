import AWS from 'aws-sdk';

export const getProductsList = async (event, context, callback) => {
  try {
    console.log(`execution func getProductsList, Event = ${event}, context = ${context}, callback = ${callback}`);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
    const { Items: products } = await dynamodb
      .scan({
        TableName: process.env.PRODUCT_TABLE,
      })
      .promise();

    const { Items: stocks } = await dynamodb
      .scan({
        TableName: process.env.STOCK_TABLE,
      })
      .promise();

    try {
      const productsWithStocks = products.map((product) => {
        const { count } = stocks.find((stock) => stock.product_id === product.id);
        return {
          ...product,
          count
        };
      });
      response.statusCode = 200;
      response.body = JSON.stringify(productsWithStocks);
    } catch (error) {
      console.log('Error', error);
      response.statusCode = 400;
    }

    return callback(null, response);
  } catch (error) {
    console.log('Error in getProductsList', error);
    return callback(error);
  }
};
