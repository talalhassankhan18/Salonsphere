export async function sendPushNotification(userId: string, message: string) {
  // Integrate with Firebase Cloud Messaging or another push service
  console.log(`Sending push to ${userId}: ${message}`);
  // Example: await fcm.send({ userId, message });
}
