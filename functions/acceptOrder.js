const AWS = require("aws-sdk");
const { ORDER_ACCEPTED } = require("../constants/order");

const streamName = process.env.orderEventStream;

const kinesis = new AWS.Kinesis();

const acceptOrder = async (event) => {
  const { body } = event;
  const { restaurantName, orderId, userEmail } = JSON.parse(body);

  console.log(
    `Restaurant [${restaurantName}] accepted order ID [${orderId}] from user [${userEmail}]`
  );

  const eventType = ORDER_ACCEPTED;

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

  console.log(`Published ${ORDER_ACCEPTED} event into Kinesis`);

  return {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };
};

module.exports.handler = acceptOrder;
