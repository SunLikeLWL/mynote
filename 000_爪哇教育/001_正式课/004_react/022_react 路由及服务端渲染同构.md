# React 路由及服务端渲染同构




### 前端路由原理及实现


当我们说前端路由，也就是客户端路由时，更多的是在说当url变化时，
不会使当前的变化触发到后端而是在前端内部处理


早起的浏览器我们可以使用hash来做路由标识，使用hash的好处也非常明显：

1、hash有非常好的兼容性，大部分老浏览器都支持hash模式

2、通过监听onhashchange可以判断路由变化，从而判断需要渲染的组件

3、hash默认不会发送到后端


HTML5 之后新增了history相关的api，我们可以通过pushState和replaceState来控制url的变化，
同时处理组件的变化


1、history相关的api改变时url中的pathname，刷新新后将这部分url发送到后端去


```html 


<body>
<a href='/#home'>Home</a>
<a href='/#about'>About</a>


<a onClick="clickRoute('home')">Home</a>
<a onClick="clickRoute('about')">About</a>

<div id='#app'></div> 
<script>
  const $app = document.getElementById("app");

  const map = {
      home:function(){
          $app.innerHTML = "Home";
      },
      about:function(){
           $app.innerHTML = "About";
      }
  }

  window.onhashchange = function(){
      const path = window.location.hash.replace("#","");
      const renderFunc = map[path];
      renderFunc()
  }


  function clickRoute(route){
      history.pushState(route)
      const renderFunc = map[route];
      renderFunc()
  }


</script>
</body>


```



### 前端路由的优势


1、状态保留，可以通过url的变化获取当前用户的状态，
下次渲染的时候，就可以基于url来决定初始化渲染的组件

2、url变化不出发后端路由，体验更好同时能达到更新页面的效果

3、hash的兼容性好，同时hash存储的内容不会发送到服务端去




### React router详解


React router 主要实现了两个组件，一个是Route组件，一个是Link组件


Route组件主要是定义了规定的路由渲染组件

Link组件主要是渲染的a标签进行跳转


主要需要以下三点内容：


1、Route组件监听url变化，确定渲染的子组件

2、Link组件触发url变化


```js
// Route组件
export class Route extends React.Component {
    componentWillMount() {
        const unlisten =
            history.listen((location, action) => {
                console.log('history change listen',
                    location, action);
                this.forceUpdate();
            });
        this.setState({ unlisten });
    }
    componentWillUnmount() {
        const { unlisten } = this.state;
        unlisten();
    }
    render() {
        const {
            render,
            path,
            component: ChildComponent,
        } = this.props;
        const match = matchPath(path);
        const matchResult =
            match(window.location.pathname);
        if (!matchResult) return null;
        if (ChildComponent) {
            return (<ChildComponent match={matchResult} />);
        }
        if (render && typeof render ===
            'function') {
            return render({ matchResult });
        }
        return null;
    }
}


```



```js
// Link 组件

export class Link extends React.Component {
    handleClick = (e) => {
        const {
            replace,
            to,
        } = this.props;
        e.preventDefault();
        replace ? history.replace(to) :
            history.push(to);
    }
    render() {
        const {
            to,
            children,
        } = this.props;
        return (
            <a href={to} onClick={this.handleClick}>{children}</a>
        );
    }
}
import React from 'react';
import { createBrowserHistory } from
    'history';
import { match as matchPath } from 'pathto-regexp';
const history = createBrowserHistory();


```



我们主要使⽤ history 这个库，来对我们的路由进⾏统
⼀封装，它的内部帮助我们处理了第⼀⼩节讲的三种情况：



1、hashHistory：hash 的路由
2、browserHistory：浏览器 HTML5 中 history 的路由
3、memoryHistory：内存⾥⾃⼰记录⼀下路由情况

同时我们也使⽤了 path-to-regexp 这个库，来对我们的
路径进⾏处理，由它来确认我们当前的路由是否是符合
定义的路由格式。




### 服务端渲染及同构


服务端有的参数内容：

req: HTTP请求对象
res: HTTP响应对象
pathname: URL中的路径部分
query：URL中的查询字符串部分解析出的对象
err：错误对象，如果在渲染时发⽣了错误客户端渲染有的参数内容：
xhr：XMLHttpRequest对象（客户端渲染独有）


客户端渲染有的参数内容：

1、xhr：XMLHttpRequest对象（客户端渲染独有）
2、pathname: URL中的路径部分
3、query：URL中的查询字符串部分解析出的对象
4、err：错误对象，如果在渲染时发⽣了错误