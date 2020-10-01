# Vue3正式版+TS实战与源码



# Vue3.0全家桶实战


```js

import {useRoute} from 'vue-router';

import {reactive,toRefs} from 'vue'

import {useStore} from 'vuex'


 

export default {
    setup(){
         
    }
}



```




# Vue3.0源码结构分析


Vue2.0与vue3.0对比


-对Typescript支持不友好（所有的属性都放在了this对象上，难以推倒组件的数据类型）

-大量的API挂载在Vue对象原型上，难以实现TreeShaking

-架构层面对跨平台dom渲染开发支持不友好

-Composition API，受ReactHook启发

-对虚拟DOM进行了重写，对模块的编译进行了优化操作




### diff思想



