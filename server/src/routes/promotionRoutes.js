const express = require('express');
const promotionController = require('../controllers/promotionController');
const authMiddleware = require('../middlewares/auth');
const { promotionValidation, validate } = require('../middlewares/validate');
const {isLoggedIn} = require("../middlewares/auth");

const router = express.Router();

// Routes công khai
router.get('/', promotionController.getAllPromotions);
router.get('/permission', isLoggedIn, promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotion);

// Routes cần đăng nhập
router.use(authMiddleware.protect);

// Kiểm tra mã khuyến mãi
router.post('/check-coupon', promotionController.checkCoupon);
router.get('/coupon/:couponCode', promotionController.getPromotionByCoupon);

// Routes chỉ dành cho Admin và Manager
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Quản lý khuyến mãi
router.route('/')
    .post(promotionValidation, validate, promotionController.createPromotion);

router.route('/:id')
    .patch(promotionController.updatePromotion)
    .delete(promotionController.deletePromotion);

// Cập nhật trạng thái tất cả khuyến mãi
router.patch('/update-status', promotionController.updatePromotionStatus);

module.exports = router;