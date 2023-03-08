import AWS from 'aws-sdk';
import {products} from './mocks';
import { v4 as uuid } from 'uuid';

// Create DynamoDB service object

export const fillMockData = (event, context, callback) => {
  try {
    const dynamodb = new AWS.DynamoDB();
    const insertItem = (item) => {
        const itemId = uuid();
        x.putItem({
            TableName: process.env.PRODUCT_TABLE,
            Item: {
                "id": {"S": itemId},
                "title": {"S": String(item.title)},
                "price": {"N": String(item.price)},
                "description": {"S": String(item.description)},
            }
        }, (err, data) => {
            if (err) {
                console.error(`Error during insert in ${process.env.PRODUCT_TABLE}, ${err}`);
                context.fail(`ERROR: during insert into ${process.env.PRODUCT_TABLE}, ${err}`);
            } else {
                console.log(`Item with id ${item.id} inserted successfuly!`);
                context.succeed('SUCCESS');
            }
        })

        dynamodb.putItem({
            TableName: process.env.STOCKS_TABLE,
            Item: {
                "product_id": {"S": itemId},
                "count": {"N": String(item.count)},
            }
        }, (err, data) => {
            if (err) {
                console.error(`Error during insert in ${process.env.STOCKS_TABLE}, ${err}`);
                context.fail(`ERROR: during insert into ${process.env.STOCKS_TABLE}, ${err}`);
            } else {
                console.log(`Item with id ${item.id} inserted successfuly!`);
                context.succeed('SUCCESS');
            }
        })
    }

    products.map((product) => insertItem(product));
    
    const response = {
      statusCode: 200,
      body: JSON.stringify(true),
    };

    return callback ? callback(null, response) : response
  } catch (error) {
    console.log('Error in getProductsById, Product not found ', error);
    return callback(error);
  }
};
