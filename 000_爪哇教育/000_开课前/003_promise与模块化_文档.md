# Promise 详解

## 历史背景

Javascript是一门单线程语言，所以早期我们解决异步的场景时，大部分情况是通过回调函数来进行。


实例1

var dynamicFunc =  (callback)=>{
    setTimeout(()=>{
        callback();
    },500)
}

dynamicFunc(()=>{
    console.log("done")
})

// 0.5秒后执行callback函数
// 如果后继还有内容需要异步进行处理的话，就需要多个异步函数进行嵌套，不利于后期维护

setTimeout(()=>{
    console.log("1")
    setTimeout(()=>{
    console.log("2")
    },500)
},500)

// 为了能使回调函数以更优雅的方式进行调用，在ES6中js产生了一个名为promise的新规范，
// 他让异步操作编写代码更加像同步代码



## Promise 使用

 在支持ES6高级浏览器环境中，我们可以通过new Promise()即可构造一个promise实例
 这个构造函数接受一个函数作为参数，这个参数函数接收两个参数，分别是resolve和reject，
 代表我们需要改变当前实例的状态到”已完成“或者是”已拒绝“


实例2

const promise1 =()=>{
      return new Promise((resolve,reject)=>{
          // 定义异步内容
          setTimeout(()=>{
              console.log("promise1");
              // 输出完成后，调用函数传入的resolve函数，将该promise实例标记为已完成，
              // 当前promise串行继续执行
              resolve()
          },500)
      })
}

const promise2 = ()=>{
    return new Promise((resolve,reject)=>{
        console.log("promise2");
        resolve()
    },1000)
}

// 串行调用：

promise1().then(()=>{
      return promise2();
})

// 等价于

promise1().then(promise2)



实例3


function promise3(){
    return new Promise((resolve,reject)=>{
        var random = Math.round(Math.random()*1); 生成 0,1
        setTimeout(()=>{
        if(random===0){
            resolve('resolve')
        }
        else{
            reject('reject')
        }
        },1000)
    })
}


var onResolve = (val)=>{
    console.log("resolve",val);
}

var onReject = (val)=>{
    console.log('reject',val)
}

// Promise的then可以接受两个函数，第一个参数为resolve后执行，
// 第二个函数为reject后执行
promise3().then(onResolve,onReject);


// 也可以通过.catch 方法拦截状态边为已拒绝时的promise

promise3().catch(onReject).then(onResolve);

// 也可以通过try catch进行拦截状态变为已拒绝的promise

try{
    promise3().then(onResolve);
}catch(e){
    onReject(e)
}


## 小结

1、promise有三种状态，分别是：进行中（pending），已完成（fulfilled），已拒绝（rejected），进行中状态可以转变为已完成或者已拒绝状态，已经改变过状态后无法继续修改状态

2、ES6中的Promise构造函数，new Promise(resolve,reject)，执行resolve函数的时候状态将变为fulfilled状态，
      执行第二个函数的时候状态将变为rejected状态

3、通过.then 方法，即可在上一个promise达到已完成时继续执行下一个函数或者promise。同时通过resolve和reject时传入参数，
      即可给下一个函数或Promise传入初始值

4、已拒绝的Promise，后继可以通过.catch方法或者是.then方法的第二个参数或是try catch进行捕获



## 异步封装Promise


// 声明
const  ajaxAsync =(url)=>{
      return new Promise((resolve,reject)=>{
          const client =  new XMLHttpRequest();
          client.open('get',ur);

          client.onreadystatechange = ()=>{
                if(this.readyState !== 4){
                    return ;
                }
                if(this.state===200){
                    resolve(this.response);
                }
                else{
                     reject(new Error(this.statusText))
                }
          };
          client.send();
      })
}

// 调用

ajaxAsync('./ajax.json')
.catch(()=>{
    console.log("fail")
})
.then(()=>{
  console.log("done")
})

## 小结

  1、我们可以轻松地把任何一个函数或者是异步函数改为promise，尤其是异步函数，
  改为Promise之后即可进行链式调用，增强可读性

  2、将带有回调函数的异步改为promise也很简单，只需在内部实现实例化promise之后，在原来执行回调函数的地方
 执行对应的更改promise状态的函数即可



 # Promise规范解读

待定
*
*
*
*


# Promise构造函数上的静态方法



### Promise.resolve

返回一个Promise实例，
并将他的状态设置为已完成，
同时将他的结果作为传入Promise实例的值

实例：

const promise = Promise.resolve("done");

promise.then((val)=>{
    console.log("done",val)
})

// done done



### Promise.reject

返回一个Promise实例，
并将他的状态设置为已拒绝，
同时将他的结果作为原因传入OnRejected函数



const promise = Promise.reject("fail");

promise.then(null,(val)=>{
    console.log("fail",val)
})

// fail fail


### Promise.all

返回一个Promise实例，
接受一个数组，里面含有一个或多个Promise实例，
当所有实例都称为已完成状态时，进入已完成状态，否则进入已拒绝状态

const promise1 = ()=>{
    return new Promise((resolve,reject)=>{
          setTimeout(()=>{
             console.log("promise1");
             resolve("promise1");
          },1000)
    })
}

const promise2 = ()=>{
    return new Promise((resolve,reject)=>{
          setTimeout(()=>{
             console.log("promise2");
             resolve("promise2");
          },1000)
    })
}


Promise.all([promise1,promise2]).then(()=>{
    console.log("all done");
})



### Promise.race

返回一个Promise实例，
接受一个数组，里面含有一个或多个Promise实例，
当有个Promise实例状态改变时，就进入该状态且不可改变。
这里的所有Promise实例为竞争关系，只选择第一个进入改变状态的Promise的值



const promise1 = ()=>{
    return new Promise((resolve,reject)=>{
          setTimeout(()=>{
             console.log("promise1");
             resolve("promise1");
          },1000)
    })
}

const promise2 = ()=>{
    return new Promise((resolve,reject)=>{
          setTimeout(()=>{
             console.log("promise2");
             resolve("promise2");
          },1000)
    })
}


Promise.race([promise1,promise2]).then(()=>{
    console.log("one done");
})



# 实现一个简易的Promise






# Javascript 中的模块化


## 模块化实现的功能

1、每个模块都要有自己的变量作用域，两个模块之间的内部变量不会产生冲突；

2、不同模块之间保留相互导入和导出的方式方法，模块之间能够相互通信。
      模块的执行与加载遵循一定的规范，能保证彼此之间的依赖关系



## CommonJS

每个JS文件就是一个模块，每个模块内部是可以使用require函数和module.exports对象来对模块进行导入和导出的


实例：

const moduleA = require("./moduleA");

module.exports = moduleA;

### 优点：

1、模块之间内部即使有相同变量名，他们运行时没有冲突。
这说明他有处理模块变量作用域的能力。

2、通过require函数和module.exports对象能实现模块的导入导出，
说明他有导入导出模块的方式，同时能够处理基本的依赖关系

3、在不同模块调用的某个模块，得到相同的结果，说明他保证了模块单例


## AMD

Asynchronous module definition 异步模块定义


// moduleA 

define((require)=>{
     const m = require("moduleB");
})


// moduleB

define((require)=>{
       return 'moduleB'
})

// index.js

require(['moduleA','moduleB'],(moduleA,moduleB)=>{
      
})




## UMD Universal Module Definition 

作为一个同构的模块化解决方案出现，他能让我们只需在一个地方定义模块内容，
并同时兼容AMD和CommonJS语法





## ES Module规范


CommonJS规范和AMD规范特点：

1、语言上层的运行环境中实现模块化规范，模块化规范由环境自己定义；

2、相互之间不能共用模块。例如不能在Node.js运行AMD模块，不能直接在浏览器运行Commonjs模块


