/* eslint-disable */
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const handlerFactory = require("./handlerFactory")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require("./handlerFactory");
const User = require("../models/userModel");


exports.getOverview = catchAsync(async (req, res, next) => {
  //1.get tour data collection
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours', //传入参数，pug里叫locals
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: 'tour',
    tour
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
});

exports.getSignupForm = catchAsync(async (req,res)=>{
  res.status(200).render('signup',{
    title: 'Sign up'
  })
})

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIDs = bookings.map(el => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours
  });
});

exports.getMyReviews = catchAsync(async (req, res, next)=>{
  const reviews = await Review.find({user:req.user.id});
  res.status(200).render('review',{
    title: 'My reviews',
  reviews,
  })
})

exports.getAllReviews = catchAsync(async (req, res, next)=>{
  const reviews = await Review.find({});
  res.status(200).render('allreview',{
    title: 'All reviews',
    reviews,
  })
})

exports.getProfile = catchAsync(async (req, res)=>{
  const guide = await User.findById(req.params.id);

  const tourNum = 3;

  console.log(tourNum);

  res.status(200).render('profile',{
    title: 'Guides',
    guide,
    tourNum
  })
})