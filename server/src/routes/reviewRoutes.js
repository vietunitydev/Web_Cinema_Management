const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/auth');
const { reviewValidation, validate } = require('../middlewares/validate');

const router = express.Router();

// Routes công khai
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);

// Routes cần đăng nhập
router.use(authMiddleware.protect);

// Tạo đánh giá mới
router.post('/', reviewValidation, validate, reviewController.createReview);

// Lấy đánh giá của bản thân
router.get('/myreviews', reviewController.getMyReviews);

// Cập nhật và xóa đánh giá của mình
router.route('/:id')
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

// Routes chỉ dành cho Admin và Manager
router.use(authMiddleware.restrictTo('admin', 'manager'));

// Quản lý đánh giá
router.get('/pending', reviewController.getPendingReviews);
router.patch('/:id/approve', reviewController.approveReview);
router.patch('/:id/reject', reviewController.rejectReview);

module.exports = router;