module.exports= fn =>{
    return (req,res,next)=>{
        fn(req, res,next).catch(err=>next(err));//catch(next); 通过这个函数将createTour包裹起来，捕获异常
    }
}