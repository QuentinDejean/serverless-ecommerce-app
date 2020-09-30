const AWS = require("aws-sdk");

const { ORDER_FULFILLED } = require("../constants/order");

const streamName = process.env.orderEventStream;

const kinesis = new AWS.Kinesis();

const fulfillOrder = async (event) => {
  const { body } = event;
  const { restaurantName, orderId, userEmail } = JSON.parse(body);

  console.log(
    `Restaurant [${restaurantName}] accepted order ID [${orderId}] from user [${userEmail}]`
  );

  const eventType = ORDER_FULFILLED;

  const data = {
    orderId,
    userEmail,
    restaurantName,
    eventType,
  };

  const payload = {
    Data: JSON.stringify(data),
    PartitionKey: orderId,
    StreamName: streamName,
  };

  await kinesis.putRecord(payload).promise();

  console.log(`Published ${ORDER_FULFILLED} event into Kinesis`);

  return {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };
};

module.exports.handler = fulfillOrder;
