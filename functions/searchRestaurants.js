const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const defaultCountResults = process.env.defaulCounttResults || 8;
const tableName = process.env.restaurantTable;

const findRestaurantsByTheme = async (theme, count) => {
  const request = {
    TableName: tableName,
    Limit: count,
    FilterExpression: "contains(themes, :theme)",
    ExpressionAttributeValues: { ":theme": theme }
  };

  const result = await dynamodb.scan(request).promise();

  return result.Items;
};

const handler = async (event, context) => {
  const { theme } = JSON.parse(event.body);
  const restaurants = await findRestaurantsByTheme(theme, defaultCountResults);

  return {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };
};

module.exports.handler = handler;
