const express = require('express');
const {
  createUrl,
  getUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getAnalytics,
  getQrCode,
  bulkCreateUrls,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.route('/').get(getUrls).post(createUrl);
router.post('/bulk', bulkCreateUrls);
router
  .route('/:id')
  .get(getUrlById)
  .put(updateUrl)
  .delete(deleteUrl);
router.get('/:id/analytics', getAnalytics);
router.get('/:id/qrcode', getQrCode);

module.exports = router;
