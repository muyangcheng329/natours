const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();
// router
//     .param('id', tourController.checkID); //中间件：处理url的参数

router.use('/:tourId/reviews', reviewRouter); //nested router, same as mounting routers

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours); //设置一个最好评且便宜的快捷route,

//使用pipeline计算得到最繁忙的那个月
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

//prefilling 参数， 计算4.5分以上的tour的平均分、平均价格什么的
router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours) //先运行protect检查是否是
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  ); //chain middleware

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  ); //第一个中间件永远是check用户是否登录

module.exports = router;
