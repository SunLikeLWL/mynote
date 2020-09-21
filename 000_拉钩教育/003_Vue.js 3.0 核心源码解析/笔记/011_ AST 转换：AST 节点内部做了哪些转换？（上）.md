#  AST 转换：AST 节点内部做了哪些转换？


通过 getBaseTransformPreset 方法获取节点和指令转换的方法，
然后调用 transform 方法做 AST 转换，并且把这些节点和指令的转换方法作为配置的属性参数传入。



```js


// 获取节点和指令转换的方法
const [nodeTransforms, directiveTransforms] = getBaseTransformPreset()
// AST 转换
transform(ast, extend({}, options, {
  prefixIdentifiers,
  nodeTransforms: [
    ...nodeTransforms,
    ...(options.nodeTransforms || []) // 用户自定义  transforms
  ],
  directiveTransforms: extend({}, directiveTransforms, options.directiveTransforms || {} // 用户自定义 transforms
  )
}))


```



```js

function getBaseTransformPreset(prefixIdentifiers) {
  return [
    [
      transformOnce,
      transformIf,
      transformFor,
      transformExpression,
      transformSlotOutlet,
      transformElement,
      trackSlotScopes,
      transformText
    ],
    {
      on: transformOn,
      bind: transformBind,
      model: transformModel
    }
  ]
}

```




```js

function transform(root, options) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  if (options.hoistStatic) {
    hoistStatic(root, context)
  }
  if (!options.ssr) {
    createRootCodegen(root, context)
  }
  root.helpers = [...context.helpers]
  root.components = [...context.components]
  root.directives = [...context.directives]
  root.imports = [...context.imports]
  root.hoists = context.hoists
  root.temps = context.temps
  root.cached = context.cached
}

```

transform 的核心流程主要有四步：

创建 transform 上下文、

遍历 AST 节点、

静态提升、

创建根代码生成节点。 





### 创建 transform 上下文


```js

function createTransformContext(root, { prefixIdentifiers = false, hoistStatic = false, cacheHandlers = false, nodeTransforms = [], directiveTransforms = {}, transformHoist = null, isBuiltInComponent = NOOP, expressionPlugins = [], scopeId = null, ssr = false, onError = defaultOnError }) {
  const context = {
    // 配置
    prefixIdentifiers,
    hoistStatic,
    cacheHandlers,
    nodeTransforms,
    directiveTransforms,
    transformHoist,
    isBuiltInComponent,
    expressionPlugins,
    scopeId,
    ssr,
    onError,
    // 状态数据
    root,
    helpers: new Set(),
    components: new Set(),
    directives: new Set(),
    hoists: [],
    imports: new Set(),
    temps: 0,
    cached: 0,
    identifiers: {},
    scopes: {
      vFor: 0,
      vSlot: 0,
      vPre: 0,
      vOnce: 0
    },
    parent: null,
    currentNode: root,
    childIndex: 0,
    // methods
    helper(name) {
      context.helpers.add(name)
      return name
    },
    helperString(name) {
      return `_${helperNameMap[context.helper(name)]}`
    },
    replaceNode(node) {
      context.parent.children[context.childIndex] = context.currentNode = node
    },
    removeNode(node) {
      const list = context.parent.children
      const removalIndex = node
        ? list.indexOf(node)
        : context.currentNode
          ? context.childIndex
          : -1
      if (!node || node === context.currentNode) {
        // 移除当前节点
        context.currentNode = null
        context.onNodeRemoved()
      }
      else {
        // 移除兄弟节点
        if (context.childIndex > removalIndex) {
          context.childIndex--
          context.onNodeRemoved()
        }
      }
      // 移除节点
      context.parent.children.splice(removalIndex, 1)
    },
    onNodeRemoved: () => { },
    addIdentifiers(exp) {
    },
    removeIdentifiers(exp) {
    },
    hoist(exp) {
      context.hoists.push(exp)
      const identifier = createSimpleExpression(`_hoisted_${context.hoists.length}`, false, exp.loc, true)
      identifier.hoisted = exp
      return identifier
    },
    cache(exp, isVNode = false) {
      return createCacheExpression(++context.cached, exp, isVNode)
    }
  }
  return context
}


```



### 遍历 AST 节点


```js

function traverseNode(node, context) {
  context.currentNode = node
  // 节点转换函数
  const { nodeTransforms } = context
  const exitFns = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    // 有些转换函数会设计一个退出函数，在处理完子节点后执行
    const onExit = nodeTransforms[i](node, context)
    if (onExit) {
      if (isArray(onExit)) {
        exitFns.push(...onExit)
      }
      else {
        exitFns.push(onExit)
      }
    }
    if (!context.currentNode) {
      // 节点被移除
      return
    }
    else {
      // 因为在转换的过程中节点可能被替换，恢复到之前的节点
      node = context.currentNode
    }
  }
  switch (node.type) {
    case 3 /* COMMENT */:
      if (!context.ssr) {
        // 需要导入 createComment 辅助函数
        context.helper(CREATE_COMMENT)
      }
      break
    case 5 /* INTERPOLATION */:
      // 需要导入 toString 辅助函数
      if (!context.ssr) {
        context.helper(TO_DISPLAY_STRING)
      }
      break
    case 9 /* IF */:
      // 递归遍历每个分支节点
      for (let i = 0; i < node.branches.length; i++) {
        traverseNode(node.branches[i], context)
      }
      break
    case 10 /* IF_BRANCH */:
    case 11 /* FOR */:
    case 1 /* ELEMENT */:
    case 0 /* ROOT */:
      // 遍历子节点
      traverseChildren(node, context)
      break
  }
  // 执行转换函数返回的退出函数
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

```



Vue.js 内部大概内置了八种转换函数，分别处理

指令、
表达式、
元素节点、
文本节点

等不同的特性。 



### Element 节点转换函数


```js

const transformElement = (node, context) => {
  if (!(node.type === 1 /* ELEMENT */ &&
    (node.tagType === 0 /* ELEMENT */ ||
      node.tagType === 1 /* COMPONENT */))) {
    return
  }
  // 返回退出函数，在所有子表达式处理并合并后执行
  return function postTransformElement() {
    // 转换的目标是创建一个实现 VNodeCall 接口的代码生成节点
    const { tag, props } = node
    const isComponent = node.tagType === 1 /* COMPONENT */
    const vnodeTag = isComponent
      ? resolveComponentType(node, context)
      : `"${tag}"`
    const isDynamicComponent = isObject(vnodeTag) && vnodeTag.callee === RESOLVE_DYNAMIC_COMPONENT
    // 属性
    let vnodeProps
    // 子节点
    let vnodeChildren
    // 标记更新的类型标识，用于运行时优化
    let vnodePatchFlag
    let patchFlag = 0
    // 动态绑定的属性
    let vnodeDynamicProps
    let dynamicPropNames
    let vnodeDirectives
    // 动态组件、svg、foreignObject 标签以及动态绑定 key prop 的节点都被视作一个 Block
    let shouldUseBlock =
      isDynamicComponent ||
      (!isComponent &&
        (tag === 'svg' ||
          tag === 'foreignObject' ||
          findProp(node, 'key', true)))
    // 处理 props
    if (props.length > 0) {
      const propsBuildResult = buildProps(node, context)
      vnodeProps = propsBuildResult.props
      patchFlag = propsBuildResult.patchFlag
      dynamicPropNames = propsBuildResult.dynamicPropNames
      const directives = propsBuildResult.directives
      vnodeDirectives =
        directives && directives.length
          ? createArrayExpression(directives.map(dir => buildDirectiveArgs(dir, context)))
          : undefined
    }
    // 处理 children
    if (node.children.length > 0) {
      if (vnodeTag === KEEP_ALIVE) {
        // 把 KeepAlive 看做是一个 Block，这样可以避免它的子节点的动态节点被父 Block 收集
        shouldUseBlock = true
        // 2. 确保它始终更新
        patchFlag |= 1024 /* DYNAMIC_SLOTS */
        if ((process.env.NODE_ENV !== 'production') && node.children.length > 1) {
          context.onError(createCompilerError(42 /* X_KEEP_ALIVE_INVALID_CHILDREN */, {
            start: node.children[0].loc.start,
            end: node.children[node.children.length - 1].loc.end,
            source: ''
          }))
        }
      }
      const shouldBuildAsSlots = isComponent &&
        // Teleport不是一个真正的组件，它有专门的运行时处理
        vnodeTag !== TELEPORT &&
        vnodeTag !== KEEP_ALIVE
      if (shouldBuildAsSlots) {
        // 组件有 children，则处理插槽
        const { slots, hasDynamicSlots } = buildSlots(node, context)
        vnodeChildren = slots
        if (hasDynamicSlots) {
          patchFlag |= 1024 /* DYNAMIC_SLOTS */
        }
      }
      else if (node.children.length === 1 && vnodeTag !== TELEPORT) {
        const child = node.children[0]
        const type = child.type
        const hasDynamicTextChild = type === 5 /* INTERPOLATION */ ||
          type === 8 /* COMPOUND_EXPRESSION */
        if (hasDynamicTextChild && !getStaticType(child)) {
          patchFlag |= 1 /* TEXT */
        }
        // 如果只是一个普通文本节点、插值或者表达式，直接把节点赋值给 vnodeChildren
        if (hasDynamicTextChild || type === 2 /* TEXT */) {
          vnodeChildren = child
        }
        else {
          vnodeChildren = node.children
        }
      }
      else {
        vnodeChildren = node.children
      }
    }
    // 处理 patchFlag 和 dynamicPropNames
    if (patchFlag !== 0) {
      if ((process.env.NODE_ENV !== 'production')) {
        if (patchFlag < 0) {
          vnodePatchFlag = patchFlag + ` /* ${PatchFlagNames[patchFlag]} */`
        }
        else {
          // 获取 flag 对应的名字，生成注释，方便理解生成代码对应节点的 pathFlag
          const flagNames = Object.keys(PatchFlagNames)
            .map(Number)
            .filter(n => n > 0 && patchFlag & n)
            .map(n => PatchFlagNames[n])
            .join(`, `)
          vnodePatchFlag = patchFlag + ` /* ${flagNames} */`
        }
      }
      else {
        vnodePatchFlag = String(patchFlag)
      }
      if (dynamicPropNames && dynamicPropNames.length) {
        vnodeDynamicProps = stringifyDynamicPropNames(dynamicPropNames)
      }
    }
    node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren, vnodePatchFlag, vnodeDynamicProps, vnodeDirectives, !!shouldUseBlock, false /* disableTracking */, node.loc)
  }
}


```



首先，判断这个节点是不是一个 Block 节点。


其次，是处理节点的 props。


接着，是处理节点的 children。


然后，会对前面解析 props 求得的 patchFlag 和 dynamicPropNames 做进一步处理。




```js


function createVNodeCall(context, tag, props, children, patchFlag, dynamicProps, directives, isBlock = false, disableTracking = false, loc = locStub) {
  if (context) {
    if (isBlock) {
      context.helper(OPEN_BLOCK)
      context.helper(CREATE_BLOCK)
    }
    else {
      context.helper(CREATE_VNODE)
    }
    if (directives) {
      context.helper(WITH_DIRECTIVES) 
    }
  }
  return {
    type: 13 /* VNODE_CALL */,
    tag,
    props,
    children,
    patchFlag,
    dynamicProps,
    directives,
    isBlock,
    disableTracking,
    loc
  }
}

```




### 表达式节点转换函数



```js

const transformExpression = (node, context) => {
  if (node.type === 5 /* INTERPOLATION */) {
    // 处理插值中的动态表达式
    node.content = processExpression(node.content, context)
  }
  else if (node.type === 1 /* ELEMENT */) {
    // 处理元素指令中的动态表达式
    for (let i = 0; i < node.props.length; i++) {
      const dir = node.props[i]
      // v-on 和 v-for 不处理，因为它们都有各自的处理逻辑
      if (dir.type === 7 /* DIRECTIVE */ && dir.name !== 'for') {
        const exp = dir.exp
        const arg = dir.arg
        if (exp &&
          exp.type === 4 /* SIMPLE_EXPRESSION */ &&
          !(dir.name === 'on' && arg)) {
          dir.exp = processExpression(exp, context, dir.name === 'slot')
        }
        if (arg && arg.type === 4 /* SIMPLE_EXPRESSION */ && !arg.isStatic) {
          dir.arg = processExpression(arg, context)
        }
      }
    }
  }
}


```



