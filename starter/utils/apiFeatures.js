/* eslint-disable */
class APIFeatures{
    constructor(query,queryString){
        this.query = query; //查询结果
        this.queryString = queryString; //初始传进来的请求头参数，coming from express
    }

    filter(){
         //Build the query
        //const tour = await Tour.find({duration: 5, difficulty:'easy'}),
        //{duration: 5, difficulty:'easy'} 其实就是req.query的内容
        // 但是注意我们需要用query里面的page=2来分页，而不是过滤数据，所以需要作下列过滤：

        //1.1 filtering
        const queryObj = {...this.queryString} // hard copy,修改对象
        const excludedFields =['page','sort','limit','fields'];
        excludedFields.forEach(el => delete queryObj[el]); 

        //1.2 filtering >= <= 
        let queryStr =  JSON.stringify(queryObj);//将对象转换为JSON字符串
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);//正则表达式增加$符号，符合DB语法
      //  console.log(JSON.parse(queryStr));

        this.query= this.query.find(JSON.parse(queryStr));
        //let query = Tour.find(JSON.parse(queryStr));//解析JSON字符串，构造js对象
        return this; //return entire objects
    }

    sort(){
         //2  sorting
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            //mongoose 对price相同的再用ratingsAverage排：sort('price ratingsAverage')
        }else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v');//-:exclude掉DB的__v字段
        }
        return this;
    }

    paginate(){
        const page = this.queryString.page * 1 || 1; //从string到number，设置默认值
        const limit = this.queryString.limit *1 ||100;
        const skip =(page-1) *limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
module.exports = APIFeatures;