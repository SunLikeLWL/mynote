# 10 | 流程分解：Webpack 的完整构建流程


### Webpack 的基本工作流程


1、通过 Webpack 的源码来了解具体函数执行的逻辑。

2、通过 Webpack 对外暴露的声明周期 Hooks，理解整体流程的阶段划分。


通常，在项目中有两种运行 Webpack 的方式：

1、基于命令行的方式
2、基于代码的方式。


```js
//第一种：基于命令行的方式
webpack --config webpack.config.js
//第二种：基于代码的方式
var webpack = require('webpack')
var config = require('./webpack.config')
webpack(config, (err, stats) => {})

```



### webpack.js 中的基本流程


根据配置生成编译器实例 compiler，
然后处理参数，执行 WebpackOptionsApply().process，
根据参数加载不同内部插件。
在有回调函数的情况下，根据是否是 watch 模式来决定要执行 compiler.watch 还是 compiler.run。

为了讲解通用的流程，我们以没有 watch 模式的情况进行分析。简化流程后的代码示例如下：

```js

const webpack = (options, callback) => {
  options = ... //处理options默认值
  let compiler = new Compiler(options.context)
  ... //处理参数中的插件等
  compiler.options = new WebpackOptionsApply().process(options, compiler); //分析参数，加载各内部插件
  ...
  if (callback) {
    ... 
    compiler.run(callback)
  }
  return compiler
}

```


### Compiler.js 中的基本流程


compiler.run(callback) 中的执行逻辑较为复杂，我们把它按流程抽象一下。抽象后的执行流程如下：


1、readRecords：读取构建记录，用于分包缓存优化，在未设置 recordsPath 时直接返回。

2、compile 的主要构建过程，涉及以下几个环节：

    2.1、newCompilationParams：创建 NormalModule 和 ContextModule 的工厂实例，用于创建后续模块实例。

    2.2、newCompilation：创建编译过程 Compilation 实例，传入上一步的两个工厂实例作为参数。

    2.3、compiler.hooks.make.callAsync：触发 make 的 Hook，执行所有监听 make 的插件（例如 SingleEntryPlugin.js 中，会在相应的监听中触发 compilation 的 addEntry 方法）。其中，Hook 的作用，以及其他 Hook 会在下面的小节中再谈到。

    2.4、compilation.finish：编译过程实例的 finish 方法，触发相应的 Hook 并报告构建模块的错误和警告。

    2.5、compilation.seal：编译过程的 seal 方法，下一节中我会进一步分析。

3、emitAssets：调用 compilation.getAssets()，将产物内容写入输出文件中。

4、emitRecords：对应第一步的 readRecords，用于写入构建记录，在未设置 recordsPath 时直接返回。



### Compilation.js 中的基本流程

1、addEntry：从 entry 开始递归添加和构建模块。

2、seal：冻结模块，进行一系列优化，以及触发各优化阶段的 Hooks。


#### 总结

1、创建编译器 Compiler 实例。

2、根据 Webpack 参数加载参数中的插件，以及程序内置插件。

3、执行编译流程：创建编译过程 Compilation 实例，从入口递归添加与构建模块，模块构建完成后冻结模块，并进行优化。

4、构建与优化过程结束后提交产物，将产物内容写到输出文件中。



# 读懂 Webpack 的生命周期


### Webpack 中的插件


Webpack 引擎基于插件系统搭建而成，不同的插件各司其职，
在 Webpack 工作流程的某一个或多个时间点上，对构建流程的某个方面进行处理。


Webpack 就是通过这样的工作方式，在各生命周期中，经一系列插件将源代码逐步变成最后的产物代码。


一个 Webpack 插件是一个包含 apply 方法的 JavaScript 对象。


这个 apply 方法的执行逻辑，通常是注册 Webpack 工作流程中某一生命周期 Hook，
并添加对应 Hook 中该插件的实际处理函数。


```js

class HelloWorldPlugin {
  apply(compiler) {
    compiler.hooks.run.tap("HelloWorldPlugin", compilation => {
      console.log('hello world');
    })
  }
}
module.exports = HelloWorldPlugin;

```


### Hook 的使用方式


1、在构造函数中定义 Hook 类型和参数，生成 Hook 对象。

2、在插件中注册 Hook，添加对应 Hook 触发时的执行函数。

3、生成插件实例，运行 apply 方法。

4、在运行到对应生命周期节点时调用 Hook，执行注册过的插件的回调函数。如下面的代码所示：


```js

// lib/Compiler.js
this.hooks = {
  ...
  make: new SyncHook(['compilation', 'params']), //1. 定义Hook
  ...
}
...
this.hooks.compilation.call(compilation, params); //4. 调用Hook
...
lib/dependencies/CommonJsPlugin.js
//2. 在插件中注册Hook
compiler.hooks.compilation.tap("CommonJSPlugin", (compilation, { contextModuleFactory, normalModuleFactory }) => {
  ...
})
lib/WebpackOptionsApply.js
//3. 生成插件实例，运行apply方法
new CommonJsPlugin(options.module).apply(compiler);

```

以上就是 Webpack 中 Hook 的一般使用方式。
正是通过这种方式，Webpack 将编译器和编译过程的生命周期节点提供给外部插件，从而搭建起弹性化的工作引擎。


Hook 的类型按照同步或异步、是否接收上一插件的返回值等情况分为 9 种。不



### Compiler Hooks

构建器实例的生命周期可以分为 3 个阶段：初始化阶段、构建过程阶段、产物生成阶段。


#### 初始化阶段

1、environment、afterEnvironment：
在创建完 compiler 实例且执行了配置内定义的插件的 apply 方法后触发。

2、entryOption、afterPlugins、afterResolvers：
在 WebpackOptionsApply.js 中，这 3 个 Hooks 分别在执行 EntryOptions 插件和其他 Webpack 内置插件，以及解析了 resolver 配置后触发。

#### 构建过程阶段

1、normalModuleFactory、contextModuleFactory：
在两类模块工厂创建后触发。

2、beforeRun、run、watchRun、beforeCompile、compile、thisCompilation、compilation、make、afterCompile：
在运行构建过程中触发。

#### 产物生成阶段

1、shouldEmit、emit、assetEmitted、afterEmit：
在构建完成后，处理产物的过程中触发。

2、failed、done：
在达到最终结果状态时触发。




### Compilation Hooks


#### 构建阶段

1、addEntry、failedEntry、succeedEntry：
在添加入口和添加入口结束时触发（Webpack 5 中移除）。

2、buildModule、rebuildModule、finishRebuildingModule、failedModule、succeedModule：
在构建单个模块时触发。

3、finishModules：
在所有模块构建完成后触发。


#### 优化阶段

1、seal、needAdditionalSeal、unseal、afterSeal：
分别在 seal 函数的起始和结束的位置触发。

2、optimizeDependencies、afterOptimizeDependencies：
触发优化依赖的插件执行，例如FlagDependencyUsagePlugin。

3、beforeChunks、afterChunks：
分别在生成 Chunks 的过程的前后触发。

4、optimize：
在生成 chunks 之后，开始执行优化处理的阶段触发。

5、optimizeModule、afterOptimizeModule：
在优化模块过程的前后触发。

6、optimizeChunks、afterOptimizeChunks：
在优化 Chunk 过程的前后触发，用于 Tree Shaking。

7、optimizeTree、afterOptimizeTree：
在优化模块和 Chunk 树过程的前后触发。

8、optimizeChunkModules、afterOptimizeChunkModules：
在优化 ChunkModules 的过程前后触发，例如 ModuleConcatenationPlugin，利用这一 Hook 来做Scope Hoisting的优化。

9、shouldRecord、recordModules、recordChunks、recordHash：
在 shouldRecord 返回为 true 的情况下，依次触发 recordModules、recordChunks、recordHash。

10、reviveModules、beforeModuleIds、moduleIds、optimizeModuleIds、afterOptimizeModuleIds：
在生成模块 Id 过程的前后触发。

11、reviveChunks、beforeChunkIds、optimizeChunkIds、afterOptimizeChunkIds：
在生成 Chunk id 过程的前后触发。

12、beforeHash、afterHash：
在生成模块与 Chunk 的 hash 过程的前后触发。

beforeModuleAssets、moduleAsset：
在生成模块产物数据过程的前后触发。

shouldGenerateChunkAssets、beforeChunkAssets、chunkAsset：
在创建 Chunk 产物数据过程的前后触发。

additionalAssets、optimizeChunkAssets、afterOptimizeChunkAssets、optimizeAssets、afterOptimizeAssets：
在优化产物过程的前后触发，例如在 TerserPlugin 的压缩代码插件的执行过程中，就用到了 optimizeChunkAssets。



### 代码实践：编写一个简单的统计插件

编写一个统计构建过程生命周期耗时的插件，这类插件会作为后续优化构建效率的准备工作。

```js

class SamplePlugin {
  apply(compiler) {
    var start = Date.now()
    var statsHooks = ['environment', 'entryOption', 'afterPlugins', 'compile']
    var statsAsyncHooks = [
      'beforeRun',
      'beforeCompile',
      'make',
      'afterCompile',
      'emit',
      'done',
    ]

    statsHooks.forEach((hookName) => {
      compiler.hooks[hookName].tap('Sample Plugin', () => {
        console.log(`Compiler Hook ${hookName}, Time: ${Date.now() - start}ms`)
      })
    })
    ...
  }
})
module.exports = SamplePlugin;

```