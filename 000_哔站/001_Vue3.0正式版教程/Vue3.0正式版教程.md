# Vue3.0正式版教程



### Vue3.0六大亮点

-Performance：性能比Vue.x快1.2~2倍

-Tree shaking support：按需编译，体积比Vue2.x更小

-Composition API：组合API（类似React Hooks）

-Better TypeScript support：更好的ts支持

-Custom Render API： 暴露了自定义渲染API

-Fragment，Teleport（Protal），Suspense：更先进的组件





### Vue3.0是如何变快的？


- diff算法优化：
  + Vue2.0中的虚拟dom是进行全量的比较
  + Vue3.0新增了静态标记（PatchFlag），
    在与上次虚拟节点进行比对的时候，只比对带有patch flag的节点
    并且可以通过flag的信息得知当前节点要比对的具体内容
- hoistStatic静态提升
  + Vue2中无论元素是否参与更新，每次都会重新创建，然后再渲染
  + Vue3中对于不参与更新的元素，会做静态提升，只会被创建一次，
    在渲染时直接复用即可
- cacheHandlers事件侦听器缓存
  + 默认情况下onClick会被视为动态绑定，所以每次都会去追踪他的变化
    但是因为是同一个函数，所以没有追踪变化，直接缓存起来复用即可
- SSR渲染
 + 当有大量静态的内容的时候，这些内容会被当做纯字符串推进一个buffer里面
   即使存在动态绑定，会通过模板插值嵌入进去。这样会比通过虚拟DOM来渲染的快上很多
 + 当静态内容大到一定量级时候，会用_createStaticVNode方法在客户端去生成一个static node，
   这些静态node，会被直接innerHTML，就不需要创建对象，然后根据对象渲染



### setup执行时机

beforeCreate:表示组件刚刚被创建出来，组件的data和methods还没有初始化好

setup:

created: 表示组件刚刚被创建出来，组件的data和methods已经初始化好




### setup注意点


- 由于在执行setup函数的时候，还没有执行Created生命周期方法，
  所以在setup函数中，是无法使用data和methods
- 由于我们不能在setup函数中使用data和methods，
  所以vue为了避免我们错误的使用，他直接将setup函数中的this修改成了undefined
- setup函数只能是同步的不能是异步的






### ref

，对象复制，修改会影响原对象的数据

### reactive




### toRaw

获取原数据对象


### markRaw

不能改为响应式数据



### shallowRef

只做一层响应式监听 obj.value

### shallowReactive

只做一层响应式监听 obj


### toRef(obj,'name')

将对象某个属性改为响应式，对象引用，修改响应式数据会影响原对象的数据

应用场景：
如果想让响应式数据和以前的数据关联起来，并且更新响应式数据后还不想更新UI



### toRefs

遍历对象属性，分别调用toRef




### customRef

```js

import {ref,customRef} from 'vue';

function myRef(value){
    return customRef((track,trigger)=>{
      return {
        get(){
          track();// 需要依赖追踪
         console.log('get',value)
         return value
        },
        set(newValue){
          console.log('set',newValue);
          value = newValue;
          trigger();// 触发页面更新
        }
      }
    })
}

export default{
  name:'App',
  setup(){
    
  }
}


```



### ref
 
获取DOM元素



### readonly


创建只读对象



### shallowReadOnly

设置一层只读




