import AWS from 'aws-sdk';

export const getProductsById = async (event, context, callback) => {
  try {
    console.log(
      `execution func getProductsById, Event = ${event}, context = ${context}, callback = ${callback}`
    );
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const {
      pathParameters: { productId },
    } = event;
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };

    const getItemFromTable = ({ tableName, fieldName, itemId }) =>
      dynamodb
        .query({
          TableName: tableName,
          KeyConditionExpression: `${fieldName} = :id`,
          ExpressionAttributeValues: { ':id': String(itemId) },
        })
        .promise()
        .then((result) => {
          return result.Items[0];
        });

    const count = await getItemFromTable({
      tableName: process.env.STOCK_TABLE,
      fieldName: 'product_id',
      itemId: productId,
    });
    const product = await getItemFromTable({
      tableName: process.env.PRODUCT_TABLE,
      fieldName: 'id',
      itemId: productId,
    });

    if (count && product) {
      response.body = JSON.stringify({
        ...product,
        count: count.count,
      });
    } else {
      response.statusCode = 400;
    }

    return callback(null, response);
  } catch (error) {
    console.log('Error in getProductsById', error);
    return callback(error);
  }
};
