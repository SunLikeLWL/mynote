# 深入React技术栈

# 第一章 初入React世界

## 1.1简介

React把用户界面抽象成一个个组件
通过jsx语法，复用组件变得非常容易，同时也能保证组件结构清晰


##  专注于视图层

##  Virtual DOM
真是页面对应一个DOM树

##  函数式编程

函数式编程 -> 声明式编程

命令式编程 -> 


 
## 1.2 jsx

1、定义标签时，只允许被一个标签包裹

2、标签一定要闭合


## 1.3 React 组件


狭义上的组件：又称为UI组

广义上的组件：带有业务含义和数据的UI组件组合
 
 规范标准：
  1、基本的封装性
  2、简单的生命周期
  3、明确的数据流动


  React组件基本上由组件的构建方式、组件内的属性状态与生命周期方法组成。


   构建方式：

   1、React.createClass
   2、ES6 class
   3、无状态函数


## 1.4 数据流

  在React中，数据是自顶向下单向流动的，即从父组件到子组件。

  state：组件内部的属性

  setState：是一个异步方法，一个生命周期内所有的setState方法合并操作。
 
  props：

  子组件prop：

  propTypes





## 1.5 React生命周期  

  React生命周期氛围两类：

  ### 1、当组件在挂载或卸载时；
  挂载：

  componentWillMount

  render

  componentDidmount


 卸载：

 componentWillUnmount

 


  ### 2、当组件接收新的数据时，即组件更新时


    componentWillReceiveProps

    shouldComponentUpdate

    componentWillUpdate

    render

    componentDidUpdate


  ## 1.6 React与DOM

  少有的几个API：

  1、findDOMNode：
  

  import ReactDOM from 'react-dom';
  ReactDOD.findDOMNode(this);// 当前组件

  
  2、unmoutConponentAtNode



  3、render



# 第二章 漫谈React


## 2.1 事件系统

  Virtual DOM在内存中是以对象的形式存在的

  React基于Virtual DOM 实现了一个SyntheticEvent（合成事件）层

  所有事件都自动绑定在最外层

 
 ### 事件委托

    所有事件都自动绑定在结构最外层，使用一个统一的事件监听器，
    这个时间监听器上维持了一个映射来保存所有组件内部的事件监听和处理函数

  
 ### 自动绑定
 在React组件中，每个方法的上下文会指向该组件的实例，即自动绑定this为当前组件。
 
    1、constructor里面bind
    2、事件绑定到节点时使用bind
    3、箭头函数


  ## 2.2 表单

  在React中，一切数据都是状态，当然也包括表单数据。
  

  ### 受控组件
   
   每当表单的状态发生改变的时，都会被写入到组件的state中，
   这种组件在React中被称为受控组件（controlled component）。
  ### 受控组件更新state流程

  1、可以通过初始化state中的设置表单的默认值

  2、每当表单的值发生变化时，调用onChange事件处理器

  3、事件处理器通过合成事件对象e拿到改变后的状态，并更新应用的state

  4、setState触发视图的重新渲染，完成表单组件的更新


  ### 非受控组件
  如果一个表单组件没有value props（单选按钮和复选框对应的是checked prop）时，就可以被称为非受控组件

  

## 2.3、 样式处理

  1、自定义组件支持className prop，以让用户使用时添加自定义样式

  2、设置行内样式时要使用对象

  const style =  {
      color:'white'
  }

  3、使用classnames库

  不使用classnames库
  render(){
    let btnClass = 'btn';
    if(this.state.isPressed){
      btnClass+='btn-pressed'
    }
    else if(this.state.isHovered){
      btnClass += 'btn-over';
    }
  }

  使用classnames库

  render(){
    const btnClass = classNames({
      'btn':true,
      'btn-pressed':this.state.isPressed,
      'btn-over':this.state.isHovered&&!this.state.isPressed
    })
  }


## CSS modules

1、Inline Style

2、css Mudules
依旧使用CSS，但是使用Javascript管理样式依赖
最大化的结合现有的CSS生态和Javascript的模块化能力


3、遇到问题

  全局污染：
  CSS使用全局选择器机制来设置样式，优点是方便重写样式
  缺点就是所有的样式都是全局生效的
  
  命名混乱：

  依赖管理不彻底：
  组件应该相互独立，引入一个组件时，应该只引入他所需要的的CSS样式
  
  无法共享变量：


  代码压缩不彻底：


  4、解决方案

  CSS Mudule

  1、所有样式都是局部化的，解决了命名冲突和全局污染问题

  2、class名的生成规则配置灵活，可以以此来压缩class名

  3、只需引入组件的Javascript，就能搞定组件所有的javascript和CSS
 
  4、依然还是CSS，学习成本为0


  5、全局和局部样式

  默认是局部样式：
    .nomal{

    }
   等同于
   :local(.nomal){

   }

  全局样式：

  :global(.nomal){

  }


  6、使用composes来组合样式

  .base{

  }

  .nomal{
    composes:base;
  }



  ## CSS Module  使用技巧

   1、不使用选择器，值使用class名来定义样式

   2、不层叠多个class，只使用一个class把所有样式定义好

   3、所有样式通过composes组合来实现复用

   4、不嵌套



## 2.4 组件间通信

  1、父组件与子组件通信

  props

  2、子组件与父组件通信
    
    利用回调函数，以参数的形式回传数据

    利用自定义事件机制


  3、跨组件通信 context
  
   list:
   static childContextTypes = {
     color: PropTypes.string
   },
   getChildContext(){
     return {
       color:'red',
     }
   }

   listItem:

   static contextTypes = {
      color: PropTypes.string
   }

 
  在父组件定义了childContextTyps定义color属性
  在子组件就可以通过contextType获取父组件的color属性


 4、没有嵌套关系的组件通信

   只能通过可以影响全局的自定义事件机制实现

    
  import {EventEmitter} from 'events';

  export default new EventEmitter();


  listItem:




  ## 2.5 组件间抽象

  1、minxin

  对于广义的mixin方法，就是用赋值的方式将mixin对象里的方法都挂到原对象上，
  来实现对对象的混入

  @mixin(func1,func2,...)
  class MyComponent extends Component{

  }
  
  2、问题
    破坏元组件的封装
    
    命名冲突

    增加复杂性

## 高阶组件 HOC

 实现方法：

 1、属性代理props proxy
  通过组件被包裹的React组件来操作props

  const MyComponent = (WrappedComponet)=>{
     class extends Component{
        render()
        {
          return <WrappedComponet {...this.props}/>
        }
     }
  }






 2、反向继承 inheritance inversion
 高阶组件继承于被包裹的React组件


  const MyContainer = (wrappedComponent)=>{
     class extends WrappedComponent{
       render(){
           return super.render();
       }
     }
  }

  高阶组件返回的组件继承于WrappedComponent。
  因为被动地继承了WrappedComponent，所有的调用都会反向，
  这就是这种方法的由来








































