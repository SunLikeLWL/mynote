# promise与模块化


## promise 详解


### 为什么需要promise

javascript是一门单线程语言，所以早期我们解决异步的场景时，
大部分是通过回调函数来进行。


var promisify = function(func){
    return function(...args){
            new Promise(function(resolve,reject){
                args.push(function(err,result){
                    if(err){
                        reject(err)
                    }
                    resolve(result)
                });
                func.apply(func,args)
            })
    }
}




