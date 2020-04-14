# Vue2.6开发去哪儿网App 从零基础入门到实战项目




new Vue()

beforeCreate

Observe Data

Init Event

Create


if(Has 'el' option){
   if(Has template' options){
      hasTemplateOptions()
   }
   else{
      hasNoTemplateOptions()
   }
}
else{
   if( when vm.$mount(el) is Called){
        if(Has template' options){
         hasTemplateOptions()
      }
      else{
          hasNoTemplateOptions()
      }
   }
}



hasTemplateOptions(){
   Compile template into render function 
}


 
hasNoTemplateOptions(){
   Compile els outerHTML as template
}



beforeMount


Create vm.$el and replace el with it



mounted


mounted         beforeUpdate -> Virtual DOM re-render an patch   ->updated


when vm.$destroy() is called


beforeDestroy



TearDown watchers,child components  and event listener



destroyed


destroyed






v-cloak

解决差值表达式闪烁问题




v-text


v-html


v-bind


用来绑定属性的指令，只能实现数据的单项绑定，从M自动绑定到V
无法实现双向数据绑定

<p v-bind:title="msg"></p>



v-model

唯一一个实现双向数据绑定的指令

只能运用于表单元素中


v-for

注意要加上key值





事件绑定机制

v-on

@


事件修饰符
.stop - 调用 event.stopPropagation()。 // 阻止冒泡
.prevent - 调用 event.preventDefault()。// 组织默认事件

//capture添加事件侦听器时使用事件捕获模式 //事件触发顺序从外往里
.capture - 添加事件侦听器时使用 capture 模式。 

// 只会组织自己身上冒泡行为的触发, 并不会真正阻止冒泡的行为
// self实现只有点击当前元素时候,才会触发事件处理函数
.self - 只当事件是从侦听器绑定的元素本身触发时才触发回调。 

.{keyCode | keyAlias} - 只当事件是从特定键触发时才触发回调。
.native - 监听组件根元素的原生事件。
.once - 只触发一次回调。
.left - (2.2.0) 只当点击鼠标左键时触发。
.right - (2.2.0) 只当点击鼠标右键时触发。
.middle - (2.2.0) 只当点击鼠标中键时触发。
.passive - (2.3.0) 以 { passive: true } 模式添加侦听器
使用方式: 
<p @click.stop="add"></p> // @事件.事件修饰符

 


 watch



 computed

 计算属性的本质就是一个方法，只不过我们在使用这些计算属性的时候是把它们的名称直接当做属性了哎使用的，
并不会把计算属性当做方法去调用


computed属性的结构会被缓存，除非依赖的响应式属性变化才会重新渲染




组件是vue可以复用的vue实例，且带有一个名字




Vue.extend() 创建全局的Vue组件




组件也可以定义数据和属性

但是组件中的data和实例中的data不一样，实例中的data可以为一个对象，但组件中的data必须是一个方法

这个方法内部还必须return一个对象出来才行

组件中data的数据和实例中的data数据的使用方式完全一样





组件通信

组件通信，子组件是无法访问到父组件中的数据和方法的

父组件可以在引用组件的时候，通过属性绑定的形式，把数据传递给子组件使用

父组件通过自定义属性传过来的数据，需要子组件在props属性上接收才能使用




兄弟组件之间数据传递

1、借助中央事件总线




slot元素作为组件模板之中内容分发插槽。slot元素自身将被替换





# vuex


状态管理模式


采用集中式存储管理应用的所有组件状态

