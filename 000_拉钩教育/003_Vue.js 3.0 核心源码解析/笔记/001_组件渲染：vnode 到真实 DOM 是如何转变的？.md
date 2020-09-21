# 组件渲染：vnode 到真实 DOM 是如何转变的？


组件是一个抽象的概念，它是对一棵 DOM 树的抽象


创建 vnode - 渲染 vnode - 生成 DOM  这几个步骤：


1、创建vnode

2、渲染vnode

3、生成DOM



## 应用程序初始化


因为整个组件树是由根组件开始渲染的，为了找到根组件的渲染入口，
我们需要从应用程序的初始化过程开始分析。

```js

// 在 Vue.js 2.x 中，初始化一个应用的方式如下
import Vue from 'vue'
import App from './App'
const app = new Vue({
  render: h => h(App)
})
app.$mount('#app')


// 在 Vue.js 3.0 中，初始化一个应用的方式如下
import { createApp } from 'vue'
import App from './app'
const app = createApp(App)
app.mount('#app')

```




### 1. 创建 app 对象

```js

const app = ensureRenderer().createApp(...args);


// 渲染相关的一些配置，比如更新属性的方法，操作 DOM 的方法
const rendererOptions = {
  patchProp,
  ...nodeOps
}
let renderer
// 延时创建渲染器，当用户只依赖响应式包的时候，可以通过 tree-shaking 移除核心渲染逻辑相关的代码
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}
function createRenderer(options) {
  return baseCreateRenderer(options)
}
function baseCreateRenderer(options) {
  function render(vnode, container) {
    // 组件渲染的核心逻辑
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}
function createAppAPI(render) {
  // createApp createApp 方法接受的两个参数：根组件的对象和 prop
  return function createApp(rootComponent, rootProps = null) {
    const app = {
      _component: rootComponent,
      _props: rootProps,
      mount(rootContainer) {
        // 创建根组件的 vnode
        const vnode = createVNode(rootComponent, rootProps)
        // 利用渲染器渲染 vnode
        render(vnode, rootContainer)
        app._container = rootContainer
        return vnode.component.proxy
      }
    }
    return app
  }
}


```



可以看到，这里先用 ensureRenderer() 来延时创建渲染器，
这样做的好处是当用户只依赖响应式包的时候，就不会创建渲染器，
因此可以通过 tree-shaking 的方式移除核心渲染逻辑相关的代码。



### 2. 重写 app.mount 方法


```js

mount(rootContainer) {
  // 创建根组件的 vnode
  const vnode = createVNode(rootComponent, rootProps)
  // 利用渲染器渲染 vnode
  render(vnode, rootContainer)
  app._container = rootContainer
  return vnode.component.proxy
}

```



```js

app.mount = (containerOrSelector) => {
  // 标准化容器
  const container = normalizeContainer(containerOrSelector)
  if (!container)
    return
  const component = app._component
   // 如组件对象没有定义 render 函数和 template 模板，则取容器的 innerHTML 作为组件模板内容
  if (!isFunction(component) && !component.render && !component.template) {
    component.template = container.innerHTML
  }
  // 挂载前清空容器内容
  container.innerHTML = ''
  // 真正的挂载
  return mount(container)
}

```



## 核心渲染流程：创建 vnode 和渲染 vnode


### 1. 创建 vnode

```js


onst vnode = {
  type: 'button',
  props: { 
    'class': 'btn',
    style: {
      width: '100px',
      height: '50px'
    }
  },
  children: 'click me'
}

```


组件 vnode 其实是对抽象事物的描述，这是因为我们并不会在页面上真正渲染一个 <custom-component> 标签，
而是渲染组件内部定义的 HTML 标签。


### vnode 有什么优势

1、首先是抽象，引入 vnode，可以把渲染过程抽象化，从而使得组件的抽象能力也得到提升。


2、其次是跨平台，因为 patch vnode 的过程不同平台可以有自己的实现，
基于 vnode 再做服务端渲染、Weex 平台、小程序平台的渲染都变得容易了很多。




### 创建这些 vnode 

```js

const vnode = createVNode(rootComponent, rootProps)

function createVNode(type, props = null,children = null) {
  if (props) {
    // 处理 props 相关逻辑，标准化 class 和 style
  }
  // 对 vnode 类型信息编码
  const shapeFlag = isString(type)
    ? 1 /* ELEMENT */
    : isSuspense(type)
      ? 128 /* SUSPENSE */
      : isTeleport(type)
        ? 64 /* TELEPORT */
        : isObject(type)
          ? 4 /* STATEFUL_COMPONENT */
          : isFunction(type)
            ? 2 /* FUNCTIONAL_COMPONENT */
            : 0
  const vnode = {
    type,
    props,
    shapeFlag,
    // 一些其他属性
  }
  // 标准化子节点，把不同数据类型的 children 转成数组或者文本类型
  normalizeChildren(vnode, children)
  return vnode
}

```
通过上述代码可以看到，其实 createVNode 做的事情很简单，就是：

对 props 做标准化处理、

对 vnode 的类型信息编码、创建 vnode 对象，

标准化子节点 children 。



### 2. 渲染 vnode

```js

render(vnode, rootContainer)

const render = (vnode, container) => {
  if (vnode == null) {
    // 销毁组件
    if (container._vnode) {
      unmount(container._vnode, null, null, true)
    }
  } else {
    // 创建或者更新组件
    patch(container._vnode || null, vnode, container)
  }
  // 缓存 vnode 节点，表示已经渲染
  container._vnode = vnode
}

const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, optimized = false) => {
  // 如果存在新旧节点, 且新旧节点类型不同，则销毁旧节点
  if (n1 && !isSameVNodeType(n1, n2)) {
    anchor = getNextHostNode(n1)
    unmount(n1, parentComponent, parentSuspense, true)
    n1 = null
  }
  const { type, shapeFlag } = n2
  switch (type) {
    case Text:
      // 处理文本节点
      break
    case Comment:
      // 处理注释节点
      break
    case Static:
      // 处理静态节点
      break
    case Fragment:
      // 处理 Fragment 元素
      break
    default:
      if (shapeFlag & 1 /* ELEMENT */) {
        // 处理普通 DOM 元素
        processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
      }
      else if (shapeFlag & 6 /* COMPONENT */) {
        // 处理组件
        processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
      }
      else if (shapeFlag & 64 /* TELEPORT */) {
        // 处理 TELEPORT
      }
      else if (shapeFlag & 128 /* SUSPENSE */) {
        // 处理 SUSPENSE
      }
  }
}


```


第一个参数 n1 表示旧的 vnode，当 n1 为 null 的时候，表示是一次挂载的过程；

第二个参数 n2 表示新的 vnode 节点，后续会根据这个 vnode 类型执行不同的处理逻辑；

第三个参数 container 表示 DOM 容器，也就是 vnode 渲染生成 DOM 后，会挂载到 container 下面。



```js

const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
  // 创建响应式的副作用渲染函数
  instance.update = effect(function componentEffect() {
    if (!instance.isMounted) {
      // 渲染组件生成子树 vnode
      const subTree = (instance.subTree = renderComponentRoot(instance))
      // 把子树 vnode 挂载到 container 中
      patch(null, subTree, container, anchor, instance, parentSuspense, isSVG)
      // 保留渲染生成的子树根 DOM 节点
      initialVNode.el = subTree.el
      instance.isMounted = true
    }
    else {
      // 更新组件
    }
  }, prodEffectOptions)
}

```



初始渲染主要做两件事情：

渲染组件生成 subTree、

把 subTree 挂载到 container 中。



### 对普通 DOM 元素的处理流程。

```js

const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
  isSVG = isSVG || n2.type === 'svg'
  if (n1 == null) {
    //挂载元素节点
    mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
  }
  else {
    //更新元素节点
    patchElement(n1, n2, parentComponent, parentSuspense, isSVG, optimized)
  }
}


const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
  let el
  const { type, props, shapeFlag } = vnode
  // 创建 DOM 元素节点
  el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is)
  if (props) {
    // 处理 props，比如 class、style、event 等属性
    for (const key in props) {
      if (!isReservedProp(key)) {
        hostPatchProp(el, key, null, props[key], isSVG)
      }
    }
  }
  if (shapeFlag & 8 /* TEXT_CHILDREN */) {
    // 处理子节点是纯文本的情况
    hostSetElementText(el, vnode.children)
  }
  else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
    // 处理子节点是数组的情况
    mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== 'foreignObject', optimized || !!vnode.dynamicChildren)
  }
  // 把创建的 DOM 元素节点挂载到 container 上
  hostInsert(el, container, anchor)
}

function setElementText(el, text) {
  el.textContent = text
}

const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, optimized, start = 0) => {
  for (let i = start; i < children.length; i++) {
    // 预处理 child
    const child = (children[i] = optimized
      ? cloneIfMounted(children[i])
      : normalizeVNode(children[i]))
    // 递归 patch 挂载 child
    patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
  }
}


function insert(child, parent, anchor) {
  if (anchor) {
    parent.insertBefore(child, anchor)
  }
  else {
    parent.appendChild(child)
  }
}

```


### 知识延伸：嵌套组件



在 mountChildren 的时候递归执行的是 patch 函数，而不是 mountElement 函数，这是因为子节点可能有其他类型的 vnode，比如组件 vnode。




本节课的相关代码在源代码中的位置如下：
packages/runtime-dom/src/index.ts
packages/runtime-core/src/apiCreateApp.ts
packages/runtime-core/src/vnode.ts
packages/runtime-core/src/renderer.ts
packages/runtime-dom/src/nodeOps.ts



并不是拆分粒度越小越好。


原因：1、在我的日常开发中，有两种情况会去拆分组件，

第一种是根据页面的布局或功能，将整个页面拆分成不同的模块组件，最后将这些模块组件拼起来形成页面；

第二种是在实现第一部拆分出来的这些模块组件的时候，发现其中有一些模块组件具有相同或相似的功能点，将这些相似的功能点抽离出来写成公共组件，然后在各个模块中引用。

无论是模块组件还是公共组件，拆分组件的出发点都和组件的大小粒度无关。可维护性和复用性才是拆分组件的出发点。



2、对于组件的渲染，会先通过renderComponentRoot去生成组件的子树vnode，再递归patch去处理这个子树vnode。

也就是说，对于同样一个div，如果将其封装成组件的话，会比直接渲染一个div要多执行一次生成组件的子树vnode的过程。

并且还要设置并运行带副作用的渲染函数。

也就是说渲染组件比直接渲染元素要耗费更多的性能。

如果组件过多，这些对应的过程就越多。

如果按照组件粒度大小去划分组件的话会多出很多没有意义的渲染子树和设置并运行副作用函数的过程。

综上所述，并不是拆分粒度越小越好，只要按照可维护性和复用性去划分组件就好。