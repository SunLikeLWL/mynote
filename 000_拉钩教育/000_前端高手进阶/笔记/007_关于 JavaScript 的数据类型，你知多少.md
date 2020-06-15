# 关于 JavaScript 的数据类型


### Undefined

引用已声明但未初始化的变量；
引用未定义的对象属性；
执行无返回值函数；
执行 void 表达式；
全局常量 window.undefined 或 undefined。

### Null

Null 数据类型和 Undefined 类似，只有唯一的一个值 null，都可以表示空值，甚至我们通过 “==” 来比较它们是否相等的时候得到的结果都是 true，但 null 是 JavaScript 保留关键字，而 undefined 只是一个常量。


### Boolean

Boolean 数据类型只有两个值：true 和 false，分别代表真和假


### number

NaN（Not a Number）通常在计算失败的时候会得到该值。要判断一个变量是否为 NaN，则可以通过 Number.isNaN 函数进行判断。
Infinity 是无穷大，加上负号 “-” 会变成无穷小，在某些场景下比较有用，比如通过数值来表示权重或者优先级，Infinity 可以表示最高优先级或最大权重。


### String



###  Symbol

Symbol 是 ES6 中引入的新数据类型，它表示一个唯一的常量，通过 Symbol 函数来创建对应的数据类型，创建时可以添加变量描述，该变量描述在传入时会被强行转换成字符串进行存储

避免常亮值重复

避免对象属性覆盖

### Object

深拷贝

```js
function clone(obj) {
  let map = new WeakMap()
  function deep(data) {
    let result = {}
    const keys = [...Object.getOwnPropertyNames(data), ...Object.getOwnPropertySymbols(data)]
    if(!keys.length) return data
    const exist = map.get(data)
    if (exist) return exist
    map.set(data, result)
    keys.forEach(key => {
      let item = data[key]
      if (typeof item === 'object' && item) {
        result[key] = deep(item)
      } else {
        result[key] = item
      }
    })
    return result
  }
  return deep(obj)
}

```