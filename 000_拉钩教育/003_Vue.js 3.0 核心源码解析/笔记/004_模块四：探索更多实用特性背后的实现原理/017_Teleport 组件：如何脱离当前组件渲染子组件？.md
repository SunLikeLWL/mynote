# Teleport 组件：如何脱离当前组件渲染子组件？



### Teleport 实现原理


可以看到，对于 teleport 标签，它是直接创建了 Teleport 内置组件，我们接下来来看它的实现：


```js

const Teleport = {
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized, internals) {
    if (n1 == null) {
      // 创建逻辑
    }
    else {
      // 更新逻辑
    }
  },
  remove(vnode, { r: remove, o: { remove: hostRemove } }) {
    // 删除逻辑
  },
  move: moveTeleport,
  hydrate: hydrateTeleport
}

```

Teleport 组件的实现就是一个对象，对外提供了几个方法。
其中 process 方法负责组件的创建和更新逻辑，
remove 方法负责组件的删除逻辑，
接下来我们就从这三个方面来分析 Teleport 的实现原理。



### Teleport 组件创建


```js

const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, optimized = false) => {
  if (n1 && !isSameVNodeType(n1, n2)) {
    // 如果存在新旧节点, 且新旧节点类型不同，则销毁旧节点
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
      }
      else if (shapeFlag & 6 /* COMPONENT */) {
        // 处理组件
      }
      else if (shapeFlag & 64 /* TELEPORT */) {
        // 处理 TELEPORT
        type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized, internals);
      }
      else if (shapeFlag & 128 /* SUSPENSE */) {
        // 处理 SUSPENSE
      }
  }
}

```


可以看到，在 patch 阶段，会判断如果 type 是一个 Teleport 组件，
则会执行它的 process 方法，接下来我们来看 process 方法关于 Teleport 组件创建部分的逻辑：


```js

function process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized, internals) {
  const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment } } = internals
  const disabled = isTeleportDisabled(n2.props)
  const { shapeFlag, children } = n2
  if (n1 == null) {
    // 在主视图里插入注释节点或者空白文本节点
    const placeholder = (n2.el = (process.env.NODE_ENV !== 'production')
      ? createComment('teleport start')
      : createText(''))
    const mainAnchor = (n2.anchor = (process.env.NODE_ENV !== 'production')
      ? createComment('teleport end')
      : createText(''))
    insert(placeholder, container, anchor)
    insert(mainAnchor, container, anchor)
    // 获取目标移动的 DOM 节点
    const target = (n2.target = resolveTarget(n2.props, querySelector))
    const targetAnchor = (n2.targetAnchor = createText(''))
    if (target) {
      insert(targetAnchor, target)
    }
    else if ((process.env.NODE_ENV !== 'production')) {
      // 查找不到 target 则报警告
      warn('Invalid Teleport target on mount:', target, `(${typeof target})`)
    }
    const mount = (container, anchor) => {
      if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        // 挂载子节点
        mountChildren(children, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
      }
    }
    if (disabled) {
      // disabled 情况就在原先的位置挂载
      mount(container, mainAnchor)
    }
    else if (target) {
      // 挂载到 target 的位置
      mount(target, targetAnchor)
    }
  }
}

```

Teleport 组件创建部分主要分为三个步骤，

第一步在主视图里插入注释节点或者空白文本节点，
第二步获取目标元素节点，
第三步往目标元素插入 Teleport 组件的子节点。


### Teleport 组件更新


当然，Teleport 包裹的子节点渲染后并不是一成不变的，当组件发生更新的时候，
仍然会执行 patch 逻辑走到 Teleport 的 process 方法，
去处理 Teleport 组件的更新，我们来看一下这部分的实现：


```js

function process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized, internals) {
  const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment } } = internals
  const disabled = isTeleportDisabled(n2.props)
  const { shapeFlag, children } = n2
  if (n1 == null) {
    // 创建逻辑
  }
  else {
    n2.el = n1.el
    const mainAnchor = (n2.anchor = n1.anchor)
    const target = (n2.target = n1.target)
    const targetAnchor = (n2.targetAnchor = n1.targetAnchor)
    // 之前是不是 disabled 状态
    const wasDisabled = isTeleportDisabled(n1.props)
    const currentContainer = wasDisabled ? container : target
    const currentAnchor = wasDisabled ? mainAnchor : targetAnchor
    // 更新子节点
    if (n2.dynamicChildren) {
      patchBlockChildren(n1.dynamicChildren, n2.dynamicChildren, currentContainer, parentComponent, parentSuspense, isSVG)
      if (n2.shapeFlag & 16 /* ARRAY_CHILDREN */) {
        const oldChildren = n1.children
        const children = n2.children
        for (let i = 0; i < children.length; i++) {
          if (!children[i].el) {
            children[i].el = oldChildren[i].el
          }
        }
      }
    }
    else if (!optimized) {
      patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, isSVG)
    }
    if (disabled) {
      if (!wasDisabled) {
        // enabled -> disabled
        // 把子节点移动回主容器
        moveTeleport(n2, container, mainAnchor, internals, 1 /* TOGGLE */)
      }
    }
    else {
      if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
        // 目标元素改变
        const nextTarget = (n2.target = resolveTarget(n2.props, querySelector))
        if (nextTarget) {
          // 移动到新的目标元素
          moveTeleport(n2, nextTarget, null, internals, 0 /* TARGET_CHANGE */)
        }
        else if ((process.env.NODE_ENV !== 'production')) {
          warn('Invalid Teleport target on update:', target, `(${typeof target})`)
        }
      }
      else if (wasDisabled) {
        // disabled -> enabled
        // 移动到目标元素位置
        moveTeleport(n2, target, targetAnchor, internals, 1 /* TOGGLE */)
      }
    }
  }
}

```

Teleport 组件更新无非就是做几件事情：

更新子节点，

处理 disabled 属性变化的情况，

处理 to 属性变化的情况。



### Teleport 组件移除


前面我们学过，当组件移除的时候会执行 unmount 方法，
它的内部会判断如果移除的组件是一个 Teleport 组件，就会执行组件的 remove 方法：


```js

if (shapeFlag & 64 /* TELEPORT */) {
  vnode.type.remove(vnode, internals);
}
if (doRemove) {
  remove(vnode);
}

function remove(vnode, { r: remove, o: { remove: hostRemove } }) {
  const { shapeFlag, children, anchor } = vnode
  hostRemove(anchor)
  if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
    for (let i = 0; i < children.length; i++) {
      remove(children[i])
    }
  }
}

```

Teleport 的 remove 方法实现很简单，
首先通过 hostRemove 移除主视图渲染的锚点 teleport start 注释节点，
然后再去遍历 Teleport 的子节点执行 remove 移除。



