import cron from 'node-cron';
import User from '../mongoose-models/User';
import { sendReminderEmail } from '../lib/emailService';
import logger from '../lib/logger';

const checkIncompleteRegistrations = async (): Promise<void> => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const incompleteUsers = await User.find({
      registrationStatus: 'salon-info-added',
      lastActiveAt: { $lte: twoDaysAgo },
      reminderSentAt: { $exists: false }
    });
    
    for (const user of incompleteUsers) {
      try {
        await sendReminderEmail(user);
        user.reminderSentAt = new Date();
        await user.save();
        logger.info(`Reminder sent to ${user.email}`);
      } catch (error) {
        logger.error(`Failed to send reminder to ${user.email}:`, error);
      }
    }
  } catch (error) {
    logger.error('Registration reminder job error:', error);
  }
};

// Run daily at 10 AM
cron.schedule('0 10 * * *', checkIncompleteRegistrations);

export default checkIncompleteRegistrations;