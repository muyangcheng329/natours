const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  }, //这里是定义的objects
  {
    toJSON: { virtuals: true }, // 这里是可选的objects，设置虚拟字段
    toObject: { virtuals: true },
  }
);

//custom index for the price and rantingsAverage
tourSchema.index({ price: 1, ratingsAverage: -1 }); //1:升序
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//不用存在数据库里，比如千米和英里的换算之类的，直接使用虚拟字段
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //这里不能使用箭头函数，因为需要使用disk key this
}); //由于virtual properties是虚拟的，所以不属于business logic，无法使用find()或者进行其他运算，因此放在model

//virtual populate，使tour的查询结果里看到review的结果，虽然父：tour，子：review，且从子进行的父关联
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//这个 middleware 的目的是在保存文档之前生成一个 URL 友好的 slug，并将其保存在文档的 slug 属性中
//runs before .save() and .create()。 insertMany()不触发
//还可以有post save hook/post middleware，pre和post都可以有多个
//post save hook 的function(doc, next),不能再用this，而是doc，因为处理完了
tourSchema.pre('save', function(next) {
  //console.log(this) //注意这里的this就是documents currently processed，这句话pre，打印save的对象
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function(next) {
  //js正则表达式，匹配findOne()etc.
  this.find({ secreteTour: { $ne: true } }).populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', //去掉查询结果里guide的__v字段和passwordChangedAt字段
  }); //refer方式关联表，填充userSchema的guides,populate('guides');

  next(); //这里的this就是current query
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } }); //用unshift先过滤将进入管道的数据
  next();
});

const Tour = mongoose.model('Tour', tourSchema); //compile schema into a model,model是根据schema编译的构造函数

module.exports = Tour;

//mongoose有四种中间件： document, query, aggregate and model middleware
