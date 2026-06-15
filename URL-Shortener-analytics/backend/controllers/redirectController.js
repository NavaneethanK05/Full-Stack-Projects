const Url = require('../models/Url');
const Click = require('../models/Click');

/**
 * @route   GET /:shortCode
 * @desc    Redirect to the original URL and log a click for analytics.
 *          This is the public, core redirect logic of the app.
 * @access  Public
 */
const redirectToOriginal = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    if (url.isExpired()) {
      return res.status(410).json({ message: 'This short link has expired' });
    }

    // Log click analytics asynchronously - don't block the redirect on this
    Click.create({
      url: url._id,
      ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
      referrer: req.headers['referer'] || req.headers['referrer'] || null,
    }).catch((err) => console.error('Failed to log click:', err.message));

    url.clickCount += 1;
    url.lastVisitedAt = new Date();
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/public/:shortCode
 * @desc    Public stats page data (bonus feature) - no auth required,
 *          only exposes non-sensitive aggregate info.
 * @access  Public
 */
const getPublicStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    return res.status(200).json({
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      totalClicks: url.clickCount,
      createdAt: url.createdAt,
      lastVisitedAt: url.lastVisitedAt,
      isExpired: url.isExpired(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { redirectToOriginal, getPublicStats };
