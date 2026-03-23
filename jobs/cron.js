const cron = require('node-cron');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AccountStock = require('../models/AccountStock');

// Cancel unpaid orders older than 30 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const expired = await Order.find({
      status: 'pending_payment',
      createdAt: { $lt: thirtyMinAgo },
    });

    for (const order of expired) {
      // Release reserved stock
      for (const item of order.items) {
        await AccountStock.updateMany(
          { order: order._id, status: 'reserved' },
          { status: 'available', order: null }
        );
        const count = await AccountStock.countDocuments({ product: item.product, status: 'available' });
        await Product.updateOne({ _id: item.product }, { stockCount: count });
      }
      order.status = 'cancelled';
      await order.save();
    }

    if (expired.length > 0) {
      console.log(`Cancelled ${expired.length} expired orders`);
    }
  } catch (err) {
    console.error('Cron error (cancel orders):', err);
  }
});

// Stock sync from accszone.com - checks every minute if auto-sync is due
cron.schedule('* * * * *', async () => {
  try {
    const SiteSettings = require('../models/SiteSettings');
    const settings = await SiteSettings.getSettings();

    if (!settings.stockSync || !settings.stockSync.enabled) return;

    const interval = (settings.stockSync.intervalMinutes || 30) * 60 * 1000;
    const lastSync = settings.stockSync.lastSyncAt;

    if (!lastSync || (Date.now() - new Date(lastSync).getTime()) >= interval) {
      console.log('Stock sync: starting auto-sync...');
      const stockSyncService = require('../services/stockSyncService');
      const result = await stockSyncService.runSync('auto');
      if (result.error) {
        console.error('Stock sync failed:', result.error);
      } else {
        console.log(`Stock sync: updated ${result.updated}/${result.matched} products in ${(result.duration / 1000).toFixed(1)}s`);
      }
    }
  } catch (err) {
    console.error('Cron error (stock sync):', err.message);
  }
});

console.log('Cron jobs started');
