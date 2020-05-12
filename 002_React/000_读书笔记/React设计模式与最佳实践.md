# React设计模式与最佳实践


# 第一章 React基础


React是最流行的UI开发库之一，
因高性能而为人所熟知，
这得得益于他的操作DOM的方式很巧妙

关注点分离是软件设计原则之一，前端开发一般指文档结构、
样式表现以及脚本行为的分离

### 声明式编程

代码简洁，利于大型代码的维护
无需使用变量，也不用执行过程中持续更新的值，
事实上，声明式编程往往避免了创建和修改状态



# 第二章 整理代码

### JSX


### Babel

npm install -g babel-cli

npm install -g babel-preset-es2015 babel-preset-react




### ESlint


npm install eslint -g

npm install -g eslint-plugin-react



# 第三章 开发真正可复用的组件


### 创建类

1、createClass 工厂方法

createClass有一项非常方便的特性，this会指向组件本身




# 第四章 组合一切


### 容器组件
1、更关心行为部分
2、负责渲染对应的表现组件
3、发起API请求并操作数据
4、定义事件处理器
5、写作类的形式

### UI组件
1、更关心视觉表现
2、负责渲染HTML标记（或者其他组件）
3、以props的形式从父组件接收数据
4、通常写作无状态函数组件



### mixin



### 高阶组件



### recompose

提供很多有用的高阶组件，而且可以优雅地组合他们





### context



# 恰当地获取数据


### 数据流

React允许数据从根节点流向叶节点。
这种模式成为单项数据流模式




### react-refetch


# 第六章 为浏览器编写代码


## 表单

### 自由组件


### 受控组件

表单组件的值受到state控制的组件




### 事件

合成事件会被回收，并且存在唯一的全局处理器



### ref


