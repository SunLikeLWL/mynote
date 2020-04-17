# 开课吧第九期React视频教程  

笔记


## JSX



## setState


1、不要直接修改state
this.state.name = "Tom";// 不生效

2、setState批量处理，一个生命周期的setState会合并，可以用传入函数形式调用

state = {
    counter:0
}
this.setState({
    counter: counter+1
})

this.setState({
    counter: counter+1
})

this.setState({
    counter: counter+1
})
// counter:2
// 只会执行一次

this.setState((prevState)=>{
    counter: prevState.counter+1
})



## 事件处理

1、




## Styled-Components


使用标签模板来对组件进行样式化。

实际上是创造了一个正常的React组件，样式也附在上面





# 复习
## React和ReactDOM

React逻辑控制，React.createElement()



## JSX
js扩展，使得js可以写HTML

表达式


## 组件

  类

  class ConponentA extends React.Component{

  }




## 属性 props




## 状态  state

## 条件和循环

## 事件




# pureComponent



# React.memo() 高阶组件

const comment = React.memo(function(){
    render(){
        return (
            <h2>memo</h2>
        )
    }
})




## 高阶组件




## 高阶组件装饰器写法

babel-plugin-transform-decorators-legacy



## 组件复合 Composition

复合组件给与你足够的敏捷去定义自定义组件和外观和行为，
而且是以一种明确和安全的方式进行。
如果组件间有公用的非UI逻辑，将他们抽取JS模块导入使用而不是继承他。


// Dialog作为容器不关心内容和逻辑

function Dialog(props){
    return <div style={{border:"4px solid blue"}}>{props.children</div>
}

// WelcomeDialog通过复合提供内容

function WelcomeDialog(){
    return (
        <Dialog>
           <h1>欢迎光临<h1>
           <p>感谢使用react</p>
        </Dialog>
    )
}




## 跨组件通信  context


Context提供了一个无需为每层组件手动添加props，就能在组件树进行数据传递的方法




# Hook API

钩子函数

Hook是React16.8一个新增项，他可以让你在不编写class的情况下使用state以及其他的React特性

Hook的特点：

1、使你在无需修改组件结构的情况下复用状态逻辑

2、可将组件中相互关联的部分拆分成更小的函数，复杂组件将变得更容易理解

3、更简洁、更容易理解的代码


## useState

    // useState(initState)
    const [count, setCount] = useState(0)
    // 多个状态也可以
    const [age] = useState(20);
    const [fruit, setFruit] = useState('banana');
    const [input, setInput] = useState('');
    const [fruits, setFruits] = useState(['apple', 'banana'])


## 副作用钩子-Effect Hook

useEffect 就是一个Effect Hook，给函数组件增加了操作副作用的能力，
他跟组件中的componentDidMount、componentDidUpdate和ComponentWillUnmount具有
相同的用途，只不过被合并成了一个API

### 更新HookTest.js

import React,{useState,useEffect} from 'react';

useEffect(()=>{
    document.title = `您点击了${count}次`;
})



### 自定义钩子函数 Custom Hook

自定义Hook是一个函数，其名称以"use"开头，函数内部可以调用其他的hook。

 

## 其他Hook
useContext

userReducer

useCallback

useDemo






# Context API

组件跨层级通信


上下文提供一种不需要没层设置props就能夸多级组件传递数据的方式

### 相关api

React.createContext

Context.Provider

Class.contextType

Context.Consumer


### 基本用法

const MyContext = React.createContext();

const { Provider, Consumer } = MyContext;


// 获取方式1
// 通过外层嵌套一个Consumer组件来获取数据

function Child1(props) {
    return (
        <Consumer>
            {
                value => <div>
                    {value.foo}
                </div>
            }
        </Consumer>

    )
}

  // 获取方式2
  // 通过useContext()函数接收MyContext
function Child2(props) {
  
    const ctx = useContext(MyContext);
    return (
        <div>
            {ctx.foo}
        </div>
    )
}

// 获取方式3
//在class定义的组件中用静态属性获取
class Child3 extends React.Component {
    
    static contextType = MyContext;
    render() {
        return (
            <div>
                {this.context.foo}
            </div>
        )
    }
}



export default function ContextTest() {
    return (
        <div>
            <Provider value={{ foo: 'bar' }}>
                {/* 使用消费方式1 */}
                <Child1 />
                <Child2 />
                <Child3 />
            </Provider>
        </div>
    )
}

