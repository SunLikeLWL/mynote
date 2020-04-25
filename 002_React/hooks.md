# hooks


# React 组件

1、功能（无状态）组件

用function定义的组件
一般只负责渲染
UI组件


2、类（有状态）组件
容器组件
一般有交互逻辑和业务逻辑






## 总结

1、函数组件一定是无状态组件，展示型组件一般是无状态组件
2、类组件既可以是有状态组件，也可以是无状态组件
3、容器组件一般是有状态组件
4、划分原则概括为：分而治之、高内聚、低耦合




4、高阶组件

HOC
HOC主要是抽离状态，将重复的受控组件的逻辑抽离到高阶组件，以新的props传给受控组件中，
高阶组件中可以操作props传入受控组件。
常见高阶组件：
1、Redux的connect，react-router的withRouter



HOC不足：
1、HOC产生了许多无用组件，加深了组件层级，性能和调试受影响
2、多个HOC同时嵌套，劫持props，命名可能会冲突，切内无法判断Props是来源于哪个HOC




# React Hooks

1、避免地狱式嵌套，可读性高
2、函数式编程，比class更容易理解
3、class组件生命周期太多太复杂，使函数组件存在状态
4、解决HOC和render Props的缺点
5、UI和逻辑更容易分离


1、setState


2、useEffect

在render函数执行完成之后执行，可以写入异步请求数据，
组件已经挂载，不会堵塞页面渲染


总结：
1、effect在render后按照前后顺序执行
2、effect在没有任何依赖的情况下，render后每次都按顺序执行
3、effect内部执行是异步的
4、依赖[]可以实现类似componentDidMount的作用


1、effect回调函数是按照先后顺序同时执行的
2、effect的回调函数返回一个匿名函数，相当于componentUnmount的钩子函数，一般是remove
eventListener、clear timeId等，主要是组件卸载后防止内存泄漏



# useContent


跨组件共享数据的钩子函数

1、创建 Mycontext

const MyContext = createContext();


2、创建容器组件


<MyContext.Provider value={value}>
  <Child1/>
</MyContext.Provider>


const Child1 = function(){
    return (
       <div>{{value}}</div>
    )
}

3、


1、 const value = useContext(MyContext);



# useRef

useRef 返回一个可变的 ref 对象, 和自建一个 {current:} 对象的唯一区别是，useRef 会在每次渲染时返回同一个 ref 对象, 在整个组件的生命周期内是唯一的。
useRef 可以保存任何可变的值。其类似于在 class 中使用实例字段的方式。


总结：
useRef 可以存储那些不需要引起页面重新渲染的数据。
如果你刻意地想要从某些异步回调中读取 /最新的/ state，你可以用  一个 ref  来保存它，修改它，并从中读取。





 