const { SNS } = require("aws-sdk");
const AWS = require("aws-sdk");

const { ORDER_PLACED, RESTAURANT_NOTIFIED } = require("../constants/order");
const { getRecords } = require("../libs/kinesis");

const kinesis = new AWS.Kinesis();
const sns = new AWS.SNS();

const streamName = process.env.orderEventStream;
const topicArn = process.env.restaurantNotificationTopic;

const notifyRestaurant = async (event) => {
  const records = getRecords(event);
  const orderPlaced = records.filter(
    ({ eventType }) => eventType === ORDER_PLACED
  );

  for (let order of orderPlaced) {
    const snsPayload = {
      Message: JSON.stringify(order),
      TopicArn: topicArn,
    };

    await sns.publish(snsPayload).promise();

    const { restaurantName, orderId } = order;

    console.log(
      `notified restaurant [${restaurantName}] of order [${orderId}]`
    );

    const eventType = RESTAURANT_NOTIFIED;

    const data = {
      ...order,
      eventType,
    };

    const kinesisPayload = {
      Data: JSON.stringify(data),
      PartitionKey: orderId,
      StreamName: streamName,
    };

    await kinesis.putRecord(kinesisPayload).promise();

    console.log(`Published ${eventType} event into Kinesis`);
  }
};

module.exports.handler = notifyRestaurant;
