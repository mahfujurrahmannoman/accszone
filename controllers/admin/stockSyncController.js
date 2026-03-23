const SiteSettings = require('../../models/SiteSettings');
const SyncLog = require('../../models/SyncLog');
const stockSyncService = require('../../services/stockSyncService');

exports.index = async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSettings();
    const syncLogs = await SyncLog.find().sort({ startedAt: -1 }).limit(20).lean();

    res.render('admin/stock-sync/index', {
      layout: 'layouts/admin',
      title: 'Stock Sync',
      settings,
      syncLogs,
    });
  } catch (err) {
    next(err);
  }
};

exports.triggerSync = async (req, res, next) => {
  try {
    const result = await stockSyncService.runSync('manual');

    if (result.error) {
      req.flash('error', `Sync failed: ${result.error}`);
    } else {
      req.flash('success', `Sync completed! Scraped ${result.scraped} products, matched ${result.matched}, updated ${result.updated} stock counts in ${(result.duration / 1000).toFixed(1)}s`);
    }

    res.redirect('/admin/stock-sync');
  } catch (err) {
    req.flash('error', `Sync error: ${err.message}`);
    res.redirect('/admin/stock-sync');
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { syncEnabled, syncInterval } = req.body;

    await SiteSettings.updateOne({ key: 'main' }, {
      'stockSync.enabled': syncEnabled === 'on',
      'stockSync.intervalMinutes': parseInt(syncInterval) || 30,
    });

    req.flash('success', 'Sync settings updated');
    res.redirect('/admin/stock-sync');
  } catch (err) {
    next(err);
  }
};
