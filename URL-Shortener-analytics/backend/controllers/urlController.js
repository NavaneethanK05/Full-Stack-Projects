const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const Url = require('../models/Url');
const Click = require('../models/Click');
const { isValidUrl, isValidAlias, RESERVED_CODES } = require('../utils/validators');

const SHORT_CODE_LENGTH = 7;

/**
 * Generate a unique short code, retrying on the rare chance of a collision.
 */
const generateUniqueShortCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = nanoid(SHORT_CODE_LENGTH);
    exists = await Url.exists({ shortCode: code });
  }

  return code;
};

/**
 * @route   POST /api/urls
 * @desc    Create a new shortened URL
 * @access  Private
 */
const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ message: 'Please provide a valid URL (including http:// or https://)' });
    }

    let shortCode;
    let isCustomAlias = false;

    if (customAlias) {
      if (!isValidAlias(customAlias)) {
        return res.status(400).json({
          message: 'Custom alias must be 3-20 characters and contain only letters, numbers, hyphens or underscores',
        });
      }

      if (RESERVED_CODES.includes(customAlias.toLowerCase())) {
        return res.status(400).json({ message: 'This alias is reserved, please choose another' });
      }

      const aliasExists = await Url.exists({ shortCode: customAlias });
      if (aliasExists) {
        return res.status(409).json({ message: 'This alias is already taken' });
      }

      shortCode = customAlias;
      isCustomAlias = true;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    let parsedExpiry = null;
    if (expiresAt) {
      parsedExpiry = new Date(expiresAt);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({ message: 'Invalid expiry date' });
      }
      if (parsedExpiry <= new Date()) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
      }
    }

    const url = await Url.create({
      user: req.user._id,
      originalUrl,
      shortCode,
      isCustomAlias,
      expiresAt: parsedExpiry,
    });

    return res.status(201).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      isCustomAlias: url.isCustomAlias,
      clickCount: url.clickCount,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/urls
 * @desc    Get all URLs belonging to the logged-in user
 * @access  Private
 */
const getUrls = async (req, res, next) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });

    const formatted = urls.map((url) => ({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      isCustomAlias: url.isCustomAlias,
      clickCount: url.clickCount,
      lastVisitedAt: url.lastVisitedAt,
      expiresAt: url.expiresAt,
      isExpired: url.isExpired(),
      createdAt: url.createdAt,
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/urls/:id
 * @desc    Get a single URL's details (must belong to the user)
 * @access  Private
 */
const getUrlById = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    return res.status(200).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      isCustomAlias: url.isCustomAlias,
      clickCount: url.clickCount,
      lastVisitedAt: url.lastVisitedAt,
      expiresAt: url.expiresAt,
      isExpired: url.isExpired(),
      createdAt: url.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/urls/:id
 * @desc    Update the destination URL or expiry date (bonus feature)
 * @access  Private
 */
const updateUrl = async (req, res, next) => {
  try {
    const { originalUrl, expiresAt } = req.body;

    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    if (originalUrl) {
      if (!isValidUrl(originalUrl)) {
        return res.status(400).json({ message: 'Please provide a valid URL (including http:// or https://)' });
      }
      url.originalUrl = originalUrl;
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null) {
        url.expiresAt = null;
      } else {
        const parsedExpiry = new Date(expiresAt);
        if (isNaN(parsedExpiry.getTime())) {
          return res.status(400).json({ message: 'Invalid expiry date' });
        }
        url.expiresAt = parsedExpiry;
      }
    }

    await url.save();

    return res.status(200).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      isCustomAlias: url.isCustomAlias,
      clickCount: url.clickCount,
      lastVisitedAt: url.lastVisitedAt,
      expiresAt: url.expiresAt,
      isExpired: url.isExpired(),
      createdAt: url.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/urls/:id
 * @desc    Delete a shortened URL (and its click history)
 * @access  Private
 */
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    await Click.deleteMany({ url: url._id });
    await url.deleteOne();

    return res.status(200).json({ message: 'Short URL deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/urls/:id/analytics
 * @desc    Get analytics for a single short URL
 * @access  Private
 */
const getAnalytics = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Most recent visits (latest first), capped at 50
    const recentVisits = await Click.find({ url: url._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('timestamp ipAddress userAgent referrer -_id');

    // Daily click trend for the last 14 days (for charts - bonus feature)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrend = await Click.aggregate([
      { $match: { url: url._id, timestamp: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      totalClicks: url.clickCount,
      lastVisitedAt: url.lastVisitedAt,
      createdAt: url.createdAt,
      recentVisits,
      dailyTrend,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/urls/:id/qrcode
 * @desc    Generate a QR code (as a data URL) for the short link (bonus feature)
 * @access  Private
 */
const getQrCode = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    const shortUrl = `${process.env.BASE_URL}/${url.shortCode}`;
    const qrDataUrl = await QRCode.toDataURL(shortUrl, { width: 300, margin: 1 });

    return res.status(200).json({ qrCode: qrDataUrl, shortUrl });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/urls/bulk
 * @desc    Bulk create shortened URLs from an array of long URLs (bonus - CSV upload)
 * @access  Private
 */
const bulkCreateUrls = async (req, res, next) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ message: 'Please provide a non-empty array of URLs' });
    }

    if (urls.length > 100) {
      return res.status(400).json({ message: 'A maximum of 100 URLs can be processed at once' });
    }

    const results = [];

    for (const originalUrl of urls) {
      if (!isValidUrl(originalUrl)) {
        results.push({ originalUrl, status: 'failed', message: 'Invalid URL' });
        continue;
      }

      try {
        const shortCode = await generateUniqueShortCode();
        const url = await Url.create({ user: req.user._id, originalUrl, shortCode });
        results.push({
          originalUrl,
          status: 'success',
          shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        });
      } catch (err) {
        results.push({ originalUrl, status: 'failed', message: 'Could not create short URL' });
      }
    }

    return res.status(201).json({ results });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUrl,
  getUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getAnalytics,
  getQrCode,
  bulkCreateUrls,
};
