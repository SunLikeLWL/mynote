# 为什么说 JavaScript 不适合大型项目


### 类型声明


### 动态类型

动态类型是指在运行期间才做数据类型检查的语言，
即动态类型语言编程时，不用给任何变量指定数据类型


### 弱类型

弱类型是指一个变量可以被赋予不同数据类型。


### 类型与接口

Typescript让javascript变成静态类型，变量需要严格声明的语言，
为此定义了两个重要概念：类型（type）和接口（interface）

1、元祖

let x:[string,number];

2、枚举

枚举指的是带有名字的常量，可以分为数字枚举、字符串枚举和异构枚举（字符串和数字的混合）3 种。
比较适用于前后端通用的枚举值，比如通过 AJAX 请求获取的数据状态，
对于仅在前端使用的枚举值还是推荐使用 Symbol。

3、any

any 类型代表可以是任何一种类型，所以会跳过类型检查，相当于让变量或返回值又变成弱类型。
因此建议尽量减少 any 类型的使用。


4、void

void 表示没有任何类型，常用于描述无返回值的函数。

5、never

never 类型表示的是那些永不存在的值的类型，对于一些特殊的校验场景比较有用，比如代码的完整性检查。




### 类型抽象

泛型是对类型的一种抽象，一般用于函数，能让调用者动态地指定部分数据类型。
type Admin = Teacher & Student    

### 组合类型

类型组合就是把现有的多种类型叠加到一起，组合成一种新的类型，具体有两种方式。


### 交叉


交叉就是将多个类型合并为一个类型，操作符为 “&” 。
下面的代码定义了一个 Admin 类型，它同时是类型 Student 和类型 Teacher 的交叉类型。 
就是说 Admin 类型的对象同时拥有了这 2 种类型的成员。


### 联合

联合就是表示符合多种类型中的任意一个，不同类型通过操作符“|”连接。
下面代码定义的类型是 AorB，表示该类型值可以是类型 A，也可以是类型 B。


### 类型引用

1、索引
索引类型的目的是让 TypeScript 编译器检查出使用了动态属性名的类型，
需要通过索引类型查询和索引类型访问来实现。


2、映射

映射类型是指从已有类型中创建新的类型。TypeScript 预定义了一些类型，比如最常用的 Pick 和 Omit。



``` ts

const debounce = <T extends Function, U, V extends any[]>(func: T, wait: number = 0) => {
  let timeout: number | null = null;
  let args: V;
  function debounced(...arg: V): Promise<U> {
    args = arg;
    if(timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    // 以 Promise 的形式返回函数执行结果
    return new Promise((res, rej) => {
      timeout = setTimeout(async () => {
        try {
          const result: U = await func.apply(this, args);
          res(result);
        } catch(e) {
          rej(e);
        }
      }, wait)
    })
  }
  // 允许取消
  function cancel() {
    clearTimeout(timeout);
    timeout = null;
  }
  // 允许立即执行
  function flush(): U {
    cancel();
    return func.apply(this, args);
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

```