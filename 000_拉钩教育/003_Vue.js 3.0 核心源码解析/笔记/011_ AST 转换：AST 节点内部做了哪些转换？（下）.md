# 011_ AST 转换：AST 节点内部做了哪些转换？(下)



### 遍历 AST 节点



### Text 节点转换函数


```js

const transformText = (node, context) => {
  if (node.type === 0 /* ROOT */ ||
    node.type === 1 /* ELEMENT */ ||
    node.type === 11 /* FOR */ ||
    node.type === 10 /* IF_BRANCH */) {
    // 在节点退出时执行转换，保证所有表达式都已经被处理
    return () => {
      const children = node.children
      let currentContainer = undefined
      let hasText = false
      // 将相邻文本节点合并
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          hasText = true
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                // 创建复合表达式节点
                currentContainer = children[i] = {
                  type: 8 /* COMPOUND_EXPRESSION */,
                  loc: child.loc,
                  children: [child]
                }
              }
              currentContainer.children.push(` + `, next)
              children.splice(j, 1)
              j--
            }
            else {
              currentContainer = undefined
              break
            }
          }
        }
      }
      if (!hasText ||
        // 如果是一个带有单个文本子元素的纯元素节点，什么都不需要转换，因为这种情况在运行时可以直接设置元素的 textContent 来更新文本。
        (children.length === 1 &&
          (node.type === 0 /* ROOT */ ||
            (node.type === 1 /* ELEMENT */ &&
              node.tagType === 0 /* ELEMENT */)))) {
        return
      }
      // 为子文本节点创建一个调用函数表达式的代码生成节点
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child) || child.type === 8 /* COMPOUND_EXPRESSION */) {
          const callArgs = []
          // 为 createTextVNode 添加执行参数
          if (child.type !== 2 /* TEXT */ || child.content !== ' ') {
            callArgs.push(child)
          }
          // 标记动态文本
          if (!context.ssr && child.type !== 2 /* TEXT */) {
            callArgs.push(`${1 /* TEXT */} /* ${PatchFlagNames[1 /* TEXT */]} */`)
          }
          children[i] = {
            type: 12 /* TEXT_CALL */,
            content: child,
            loc: child.loc,
            codegenNode: createCallExpression(context.helper(CREATE_TEXT), callArgs)
          }
        }
      }
    }
  }
}

```


```js

function createCallExpression(callee, args = [], loc = locStub) {
  return {
    type: 14 /* JS_CALL_EXPRESSION */,
    loc,
    callee,
    arguments: args
  }
}

```


#### v-if 节点转换函数


```js

const transformIf = createStructuralDirectiveTransform(/^(if|else|else-if)$/, (node, dir, context) => {
  return processIf(node, dir, context, (ifNode, branch, isRoot) => {
    return () => {
      // 退出回调函数，当所有子节点转换完成执行
    }
  })
})

```


```js

function createStructuralDirectiveTransform(name, fn) {
  const matches = isString(name)
    ? (n) => n === name
    : (n) => name.test(n)
  return (node, context) => {
    // 只处理元素节点
    if (node.type === 1 /* ELEMENT */) {
      const { props } = node
      // 结构化指令的转换与插槽无关，插槽相关处理逻辑在 vSlot.ts 中
      if (node.tagType === 3 /* TEMPLATE */ && props.some(isVSlot)) {
        return
      }
      const exitFns = []
      for (let i = 0; i < props.length; i++) {
        const prop = props[i]
        if (prop.type === 7 /* DIRECTIVE */ && matches(prop.name)) {
          // 删除结构指令以避免无限递归
          props.splice(i, 1)
          i--
          const onExit = fn(node, prop, context)
          if (onExit)
            exitFns.push(onExit)
        }
      }
      return exitFns
    }
  }
}

```



```js

function processIf(node, dir, context, processCodegen) {
  if (dir.name === 'if') {
    // 创建分支节点
    const branch = createIfBranch(node, dir)
    // 创建 IF 节点，替换当前节点
    const ifNode = {
      type: 9 /* IF */,
      loc: node.loc,
      branches: [branch]
    }
    context.replaceNode(ifNode)
    if (processCodegen) {
      return processCodegen(ifNode, branch, true)
    }
  }
  else {
    // 处理 v-if 相邻节点，比如 v-else-if 和 v-else
  }
}

```


```js

(node, dir, context) => {
  return processIf(node, dir, context, (ifNode, branch, isRoot) => {
    // 退出回调函数，当所有子节点转换完成执行
    return () => {
      if (isRoot) {
        // v-if 节点的退出函数
        // 创建 IF 节点的 codegenNode
        ifNode.codegenNode = createCodegenNodeForBranch(branch, 0, context)
      }
      else {
        // v-else-if、v-else 节点的退出函数
        // 将此分支的 codegenNode 附加到 上一个条件节点的 codegenNode 的 alternate 中
        let parentCondition = ifNode.codegenNode
        while (parentCondition.alternate.type ===
        19 /* JS_CONDITIONAL_EXPRESSION */) {
          parentCondition = parentCondition.alternate
        }
        // 更新候选节点
        parentCondition.alternate = createCodegenNodeForBranch(branch, ifNode.branches.length - 1, context)
      }
    }
  })
}

```




```js

function createCodegenNodeForBranch(branch, index, context) {
  if (branch.condition) {
    return createConditionalExpression(branch.condition, createChildrenCodegenNode(branch, index, context),
      createCallExpression(context.helper(CREATE_COMMENT), [
        (process.env.NODE_ENV !== 'production') ? '"v-if"' : '""',
        'true'
      ]))
  }
  else {
    return createChildrenCodegenNode(branch, index, context)
  }
}

```





```js

function createChildrenCodegenNode(branch, index, context) {
  const { helper } = context
  // 根据 index 创建 key 属性
  const keyProperty = createObjectProperty(`key`, createSimpleExpression(index + '', false))
  const { children } = branch
  const firstChild = children[0]
  const needFragmentWrapper = children.length !== 1 || firstChild.type !== 1 /* ELEMENT */
  if (needFragmentWrapper) {
    if (children.length === 1 && firstChild.type === 11 /* FOR */) {
      const vnodeCall = firstChild.codegenNode
      injectProp(vnodeCall, keyProperty, context)
      return vnodeCall
    }
    else {
      return createVNodeCall(context, helper(FRAGMENT), createObjectExpression([keyProperty]), children, `${64 /* STABLE_FRAGMENT */} /* ${PatchFlagNames[64 /* STABLE_FRAGMENT */]} */`, undefined, undefined, true, false, branch.loc)
    }
  } 
  else {
    const vnodeCall = firstChild
      .codegenNode;
    // 把 createVNode 改变为 createBlock
    if (vnodeCall.type === 13 /* VNODE_CALL */ &&
      // 组件节点的 children 会被视为插槽，不需要添加 block
      (firstChild.tagType !== 1 /* COMPONENT */ ||
        vnodeCall.tag === TELEPORT)) {
      vnodeCall.isBlock = true
      // 创建 block 的辅助代码
      helper(OPEN_BLOCK)
      helper(CREATE_BLOCK)
    }
    // 给 branch 注入 key 属性
    injectProp(vnodeCall, keyProperty, context)
    return vnodeCall
  }
}

```



###  静态提升

因为这些静态节点不依赖动态数据，一旦创建了就不会改变，所以只有静态节点才能被提升到外部创建。


```js
function hoistStatic(root, context) {
  walk(root, context, new Map(),
    // Root node is unfortunately non-hoistable due to potential parent fallthrough attributes.
    isSingleElementRoot(root, root.children[0]));
}

function walk(node, context, resultCache, doNotHoistNode = false) {
  let hasHoistedNode = false
  // 是否包含运行时常量
  let hasRuntimeConstant = false
  const { children } = node
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    // 只有普通元素和文本节点才能被静态提升
    if (child.type === 1 /* ELEMENT */ &&
      child.tagType === 0 /* ELEMENT */) {
      let staticType
      if (!doNotHoistNode &&
        // 获取静态节点的类型，如果是元素，则递归检查它的子节点
        (staticType = getStaticType(child, resultCache)) > 0) {
        if (staticType === 2 /* HAS_RUNTIME_CONSTANT */) {
          hasRuntimeConstant = true
        }
        // 更新 patchFlag
        child.codegenNode.patchFlag =
          -1 /* HOISTED */ + ((process.env.NODE_ENV !== 'production') ? ` /* HOISTED */` : ``)
        // 更新节点的 codegenNode
        child.codegenNode = context.hoist(child.codegenNode)
        hasHoistedNode = true
        continue
      }
      else {
        // 节点可能会包含一些动态子节点，但它的静态属性还是可以被静态提升
        const codegenNode = child.codegenNode
        if (codegenNode.type === 13 /* VNODE_CALL */) {
          const flag = getPatchFlag(codegenNode)
          if ((!flag ||
            flag === 512 /* NEED_PATCH */ ||
            flag === 1 /* TEXT */) &&
            !hasDynamicKeyOrRef(child) &&
            !hasCachedProps()) {
            const props = getNodeProps(child)
            if (props) {
              codegenNode.props = context.hoist(props)
            }
          }
        }
      }
    }
    else if (child.type === 12 /* TEXT_CALL */) {
      // 文本节点也可以静态提升
      const staticType = getStaticType(child.content, resultCache)
      if (staticType > 0) {
        if (staticType === 2 /* HAS_RUNTIME_CONSTANT */) {
          hasRuntimeConstant = true
        }
        child.codegenNode = context.hoist(child.codegenNode)
        hasHoistedNode = true
      }
    }
    if (child.type === 1 /* ELEMENT */) {
      // 递归遍历子节点
      walk(child, context, resultCache)
    }
    else if (child.type === 11 /* FOR */) {
      walk(child, context, resultCache, child.children.length === 1)
    }
    else if (child.type === 9 /* IF */) {
      for (let i = 0; i < child.branches.length; i++) {
        walk(child.branches[i], context, resultCache, child.branches[i].children.length === 1)
      }
    }
  }
  if (!hasRuntimeConstant && hasHoistedNode && context.transformHoist) {
    // 如果编译配置了 transformHoist，则执行
    context.transformHoist(children, context, node)
  }
}

```

hoistStatic 主要就是从根节点开始，通过递归的方式去遍历节点，
只有普通元素和文本节点才能被静态提升，所以针对这些节点，
这里通过 getStaticType 去获取静态类型，如果节点是一个元素类型，
getStaticType 内部还会递归判断它的子节点的静态类型。

如果 getStaticType 返回的 staticType 的值是 2，则表明它是一个运行时常量，
由于它的值在运行时才能被确定，所以是不能静态提升的。


#### createRootCodegen


完成静态提升后，我们来到了 AST 转换的最后一步，即创建根节点的代码生成节点。
 

```js

function createRootCodegen(root, context) {
  const { helper } = context;
  const { children } = root;
  const child = children[0];
  if (children.length === 1) {
    // 如果子节点是单个元素节点，则将其转换成一个 block
    if (isSingleElementRoot(root, child) && child.codegenNode) {
      const codegenNode = child.codegenNode;
      if (codegenNode.type === 13 /* VNODE_CALL */) {
        codegenNode.isBlock = true;
        helper(OPEN_BLOCK);
        helper(CREATE_BLOCK);
      }
      root.codegenNode = codegenNode;
    }
    else {
      root.codegenNode = child;
    }
  }
  else if (children.length > 1) {
    // 如果子节点是多个节点，则返回一个 fragement 的代码生成节点
    root.codegenNode = createVNodeCall(context, helper(FRAGMENT), undefined, root.children, `${64 /* STABLE_FRAGMENT */} /* ${PatchFlagNames[64 /* STABLE_FRAGMENT */]} */`, undefined, undefined, true);
  }
}

```


createRootCodegen 做的事情很简单，就是为 root 这个虚拟的 AST 根节点创建一个代码生成节点，
如果 root 的子节点 children 是单个元素节点，则将其转换成一个 Block，
把这个 child 的 codegenNode 赋值给 root 的 codegenNode。