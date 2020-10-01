# 023_KeepAlive 组件：如何让组件在内存中缓存和调度？



```html

<keep-alive>
  <comp-a v-if="flag"></comp-a>
  <comp-b v-else></comp-b>
  <button @click="flag=!flag">toggle</button>
</keep-alive>

```

我们可以用模板导出工具看一下它编译后的 render 函数：

```js

import { resolveComponent as _resolveComponent, createVNode as _createVNode, createCommentVNode as _createCommentVNode, KeepAlive as _KeepAlive, openBlock as _openBlock, createBlock as _createBlock } from "vue"
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_comp_a = _resolveComponent("comp-a")
  const _component_comp_b = _resolveComponent("comp-b")
  return (_openBlock(), _createBlock(_KeepAlive, null, [
    (_ctx.flag)
      ? _createVNode(_component_comp_a, { key: 0 })
      : _createVNode(_component_comp_b, { key: 1 }),
    _createVNode("button", {
      onClick: $event => (_ctx.flag=!_ctx.flag)
    }, "toggle", 8 /* PROPS */, ["onClick"])
  ], 1024 /* DYNAMIC_SLOTS */))
}

```

我们使用了 KeepAlive 组件对这两个组件做了一层封装，KeepAlive 是一个抽象组件，
它并不会渲染成一个真实的 DOM，只会渲染内部包裹的子节点，
并且让内部的子组件在切换的时候，不会走一整套递归卸载和挂载 DOM的流程，从而优化了性能。



```js
//  KeepAlive 组件的定义：

const KeepAliveImpl = {
  name: `KeepAlive`,
  __isKeepAlive: true,
  inheritRef: true,
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number]
  },
  setup(props, { slots }) {
    const cache = new Map()
    const keys = new Set()
    let current = null
    const instance = getCurrentInstance()
    const parentSuspense = instance.suspense
    const sharedContext = instance.ctx
    const { renderer: { p: patch, m: move, um: _unmount, o: { createElement } } } = sharedContext
    const storageContainer = createElement('div')
    sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
      const instance = vnode.component
      move(vnode, container, anchor, 0 /* ENTER */, parentSuspense)
      patch(instance.vnode, vnode, container, anchor, instance, parentSuspense, isSVG, optimized)
      queuePostRenderEffect(() => {
        instance.isDeactivated = false
        if (instance.a) {
          invokeArrayFns(instance.a)
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeMounted
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance.parent, vnode)
        }
      }, parentSuspense)
    }
    sharedContext.deactivate = (vnode) => {
      const instance = vnode.component
      move(vnode, storageContainer, null, 1 /* LEAVE */, parentSuspense)
      queuePostRenderEffect(() => {
        if (instance.da) {
          invokeArrayFns(instance.da)
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance.parent, vnode)
        }
        instance.isDeactivated = true
      }, parentSuspense)
    }
    function unmount(vnode) {
      resetShapeFlag(vnode)
      _unmount(vnode, instance, parentSuspense)
    }
    function pruneCache(filter) {
      cache.forEach((vnode, key) => {
        const name = getName(vnode.type)
        if (name && (!filter || !filter(name))) {
          pruneCacheEntry(key)
        }
      })
    }
    function pruneCacheEntry(key) {
      const cached = cache.get(key)
      if (!current || cached.type !== current.type) {
        unmount(cached)
      }
      else if (current) {
        resetShapeFlag(current)
      }
      cache.delete(key)
      keys.delete(key)
    }
    watch(() => [props.include, props.exclude], ([include, exclude]) => {
      include && pruneCache(name => matches(include, name))
      exclude && !pruneCache(name => matches(exclude, name))
    })
    let pendingCacheKey = null
    const cacheSubtree = () => {
      if (pendingCacheKey != null) {
        cache.set(pendingCacheKey, instance.subTree)
      }
    }
    onBeforeMount(cacheSubtree)
    onBeforeUpdate(cacheSubtree)
    onBeforeUnmount(() => {
      cache.forEach(cached => {
        const { subTree, suspense } = instance
        if (cached.type === subTree.type) {
          resetShapeFlag(subTree)
          const da = subTree.component.da
          da && queuePostRenderEffect(da, suspense)
          return
        }
        unmount(cached)
      })
    })
    return () => {
      pendingCacheKey = null
      if (!slots.default) {
        return null
      }
      const children = slots.default()
      let vnode = children[0]
      if (children.length > 1) {
        if ((process.env.NODE_ENV !== 'production')) {
          warn(`KeepAlive should contain exactly one component child.`)
        }
        current = null
        return children
      }
      else if (!isVNode(vnode) ||
        !(vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */)) {
        current = null
        return vnode
      }
      const comp = vnode.type
      const name = getName(comp)
      const { include, exclude, max } = props
      if ((include && (!name || !matches(include, name))) ||
        (exclude && name && matches(exclude, name))) {
        return (current = vnode)
      }
      const key = vnode.key == null ? comp : vnode.key
      const cachedVNode = cache.get(key)
      if (vnode.el) {
        vnode = cloneVNode(vnode)
      }
      pendingCacheKey = key
      if (cachedVNode) {
        vnode.el = cachedVNode.el
        vnode.component = cachedVNode.component
        vnode.shapeFlag |= 512 /* COMPONENT_KEPT_ALIVE */
        keys.delete(key)
        keys.add(key)
      }
      else {
        keys.add(key)
        if (max && keys.size > parseInt(max, 10)) {
          pruneCacheEntry(keys.values().next().value)
        }
      }
      vnode.shapeFlag |= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */
      current = vnode
      return vnode
    }
  }
}

```


 KeepAlive 的实现拆成四个部分：
 
 -组件的渲染
 
 -缓存的设计
 
 -Props 设计
 
 -组件的卸载


### 组件的渲染



```js

return () => {
  pendingCacheKey = null
  if (!slots.default) {
    return null
  }
  const children = slots.default()
  let vnode = children[0]
  if (children.length > 1) {
    if ((process.env.NODE_ENV !== 'production')) {
      warn(`KeepAlive should contain exactly one component child.`)
    }
    current = null
    return children
  }
  else if (!isVNode(vnode) ||
    !(vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */)) {
    current = null
    return vnode
  }
  const comp = vnode.type
  const name = getName(comp)
  const { include, exclude, max } = props
  if ((include && (!name || !matches(include, name))) ||
    (exclude && name && matches(exclude, name))) {
    return (current = vnode)
  }
  const key = vnode.key == null ? comp : vnode.key
  const cachedVNode = cache.get(key)
  if (vnode.el) {
    vnode = cloneVNode(vnode)
  }
  pendingCacheKey = key
  if (cachedVNode) {
    vnode.el = cachedVNode.el
    vnode.component = cachedVNode.component
    // 避免 vnode 节点作为新节点被挂载
    vnode.shapeFlag |= 512 /* COMPONENT_KEPT_ALIVE */
    // 让这个 key 始终新鲜
    keys.delete(key)
    keys.add(key)
  }
  else {
    keys.add(key)
    // 删除最久不用的 key，符合 LRU 思想
    if (max && keys.size > parseInt(max, 10)) {
      pruneCacheEntry(keys.values().next().value)
    }
  }
  // 避免 vnode 被卸载
  vnode.shapeFlag |= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */
  current = vnode
  return vnode
}

```

函数先从 slots.default() 拿到子节点 children，它就是 KeepAlive 组件包裹的子组件，
由于 KeepAlive 只能渲染单个子节点，所以当 children 长度大于 1 的时候会报警告。


我们先不考虑缓存部分，KeepAlive 渲染的 vnode 就是子节点 children 的第一个元素，它是函数的返回值。




### 缓存的设计


组件的递归 patch 过程，主要就是为了渲染 DOM，显然这个递归过程是有一定的性能耗时的，
既然目标是为了渲染 DOM，那么我们是不是可以把 DOM 缓存了，
这样下一次渲染我们就可以直接从缓存里获取 DOM 并渲染，就不需要每次都重新递归渲染了。


实际上 KeepAlive 组件就是这么做的，它注入了两个钩子函数，onBeforeMount 和 onBeforeUpdate，
在这两个钩子函数内部都执行了 cacheSubtree 函数来做缓存：


```js

const cacheSubtree = () => {
  if (pendingCacheKey != null) {
    cache.set(pendingCacheKey, instance.subTree)
  }
}

```

由于 pendingCacheKey 是在 KeepAlive 的 render 函数中才会被赋值，
所以 KeepAlive 首次进入 onBeforeMount 钩子函数的时候是不会缓存的。




着再次执行 KeepAlive 组件的 render 函数，此时就可以从缓存中根据 A 组件的 key 拿到对应的渲染子树 
cachedVNode 的了，然后执行如下逻辑：


```js

if (cachedVNode) {
  vnode.el = cachedVNode.el
  vnode.component = cachedVNode.component
  // 避免 vnode 节点作为新节点被挂载
  vnode.shapeFlag |= 512 /* COMPONENT_KEPT_ALIVE */
  // 让这个 key 始终新鲜
  keys.delete(key)
  keys.add(key)
}
else {
  keys.add(key)
  // 删除最久不用的 key，符合 LRU 思想
  if (max && keys.size > parseInt(max, 10)) {
    pruneCacheEntry(keys.values().next().value)
  }
}

```


有了缓存的渲染子树后，我们就可以直接拿到它对应的 DOM 以及组件实例 component，
赋值给 KeepAlive 的 vnode，并更新 vnode.shapeFlag，以便后续 patch 阶段使用。




那么，对于 KeepAlive 组件的渲染来说，有缓存和没缓存在 patch 阶段有何区别呢，
由于 KeepAlive 缓存的都是有状态的组件 vnode，我们再来回顾一下 patchComponent 函数的实现：


```js

const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
  if (n1 == null) {
    // 处理 KeepAlive 组件
    if (n2.shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
      parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized)
    }
    else {
      // 挂载组件
      mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
    }
  }
  else {
    // 更新组件
  }
}

```



KeepAlive 首次渲染某一个子节点时，和正常的组件节点渲染没有区别，但是有缓存后，
由于标记了 shapeFlag，所以在执行processComponent函数时会走到处理 KeepAlive 组件的逻辑中，
执行 KeepAlive 组件实例上下文中的 activate 函数，我们来看它的实现：

```js

sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
  const instance = vnode.component
  move(vnode, container, anchor, 0 /* ENTER */, parentSuspense)
  patch(instance.vnode, vnode, container, anchor, instance, parentSuspense, isSVG, optimized)
  queuePostRenderEffect(() => {
    instance.isDeactivated = false
    if (instance.a) {
      invokeArrayFns(instance.a)
    }
    const vnodeHook = vnode.props && vnode.props.onVnodeMounted
    if (vnodeHook) {
      invokeVNodeHook(vnodeHook, instance.parent, vnode)
    }
  }, parentSuspense)
}

```


可以看到，由于此时已经能从 vnode.el 中拿到缓存的 DOM 了，所以可以直接调用 move 方法挂载节点，
然后执行 patch 方法更新组件，以防止 props 发生变化的情况。


接下来，就是通过 queuePostRenderEffect 的方式，在组件渲染完毕后，执行子节点组件定义的 activated 钩子函数。




### Props 设计


KeepAlive 一共支持了三个 Props，分别是 include、exclude 和 max。


```js

props: {
  include: [String, RegExp, Array],
  exclude: [String, RegExp, Array],
  max: [String, Number]
}


// include 和 exclude 对应的实现逻辑如下：

const { include, exclude, max } = props
if ((include && (!name || !matches(include, name))) ||
  (exclude && name && matches(exclude, name))) {
  return (current = vnode)
}

```


很好理解，如果子组件名称不匹配 include 的 vnode ，
以及子组件名称匹配 exclude 的 vnode 都不应该被缓存，而应该直接返回。


当然，由于 props 是响应式的，在 include 和 exclude props 发生变化的时候也应该有相关的处理逻辑，如下：


```js

watch(() => [props.include, props.exclude], ([include, exclude]) => {
  include && pruneCache(name => matches(include, name))
  exclude && !pruneCache(name => matches(exclude, name))
})

```


监听的逻辑也很简单，当 include 发生变化的时候，
从缓存中删除那些 name 不匹配 include 的 vnode 节点；
当 exclude 发生变化的时候，从缓存中删除那些 name 匹配 exclude 的 vnode 节点。




### 组件的卸载

我们先来分析 KeepAlive 内部包裹的子组件的卸载过程，
前面我们提到 KeepAlive 渲染的过程实际上是渲染它的第一个子组件节点，并且会给渲染的 vnode 打上如下标记：


```js

vnode.shapeFlag |= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */

```


这个时候会执行 B 组件的渲染，以及 A 组件的卸载，我们知道组件的卸载会执行 unmount 方法，
其中有一个关于 KeepAlive 组件的逻辑，如下：

```js

const unmount = (vnode, parentComponent, parentSuspense, doRemove = false) => {
  const { shapeFlag  } = vnode
  if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
    parentComponent.ctx.deactivate(vnode)
    return
  }
  // 卸载组件
}

```

如果 shapeFlag 满足 KeepAlive 的条件，则执行相应的 deactivate 函数，它的定义如下：


```js

sharedContext.deactivate = (vnode) => {
  const instance = vnode.component
  move(vnode, storageContainer, null, 1 /* LEAVE */, parentSuspense)
  queuePostRenderEffect(() => {
    if (instance.da) {
      invokeArrayFns(instance.da)
    }
    const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted
    if (vnodeHook) {
      invokeVNodeHook(vnodeHook, instance.parent, vnode)
    }
    instance.isDeactivated = true
  }, parentSuspense)
}

```

函数首先通过 move 方法从 DOM 树中移除该节点，
接着通过 queuePostRenderEffect 的方式执行定义的 deactivated 钩子函数。



注意，这里我们只是移除了 DOM，并没有真正意义上的执行子组件的整套卸载流程。

那么除了点击按钮引起子组件的卸载之外，当 KeepAlive 所在的组件卸载时，由于卸载的递归特性，
也会触发 KeepAlive 组件的卸载，在卸载的过程中会执行 onBeforeUnmount 钩子函数，如下：


```js

onBeforeUnmount(() => {
  cache.forEach(cached => {
    const { subTree, suspense } = instance
    if (cached.type === subTree.type) {
      resetShapeFlag(subTree)
      const da = subTree.component.da
      da && queuePostRenderEffect(da, suspense)
      return
    }
    unmount(cached)
  })
})  

```
它会遍历所有缓存的 vnode，并且比对缓存的 vnode 是不是当前 KeepAlive 组件渲染的 vnode。



### 总结

KeepAlive 实际上是一个抽象节点，渲染的是它的第一个子节点，并了解它的缓存设计、Props 设计和卸载过程。



