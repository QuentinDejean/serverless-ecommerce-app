const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const defaultCountResults = process.env.defaulCounttResults || 8;
const tableName = process.env.restaurantTable;

const getRestaurants = async (count) => {
    const request = {
      TableName: tableName,
      Limit: count,
    };

    const result = await dynamodb.scan(request).promise();

    return result.Items;
} 

const handler = async (event, context) => {
    const restaurants = await getRestaurants(defaultCountResults);

    return {
        statusCode: 200,
        body: JSON.stringify(restaurants)
    };
}

module.exports.handler = handler;