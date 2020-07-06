# 探索 Webpack 运行机制与核心工作原理


### Webpack 在整个打包的过程


1、通过 Loader 处理特殊类型资源的加载，例如加载样式、图片；
2、通过 Plugin 实现各种自动化的构建任务，例如自动压缩、自动发布。



 Webpack 会遍历（递归）这个依赖树，找到每个节点对应的资源文件，
 然后根据配置选项中的 Loader 配置，交给对应的 Loader 去加载这个模块，
 最后将加载的结果放入 bundle.js（打包结果）中




 ### Webpack 核心工作过程中的关键环节


1、Webpack CLI 启动打包流程；
2、载入 Webpack 核心模块，创建 Compiler 对象；
3、使用 Compiler 对象开始编译整个项目；
4、从入口文件开始，解析模块依赖，形成依赖关系树；
5、递归依赖树，将每个模块交给对应的 Loader 处理；
6、合并 Loader 处理完的结果，将打包结果输出到 dist 目录。



### webpack-cli


从 Webpack 4 开始 Webpack 的 CLI 部分就被单独抽到了 webpack-cli 模块中，
目的是为了增强 Webpack 本身的灵活性。所以这一部分的内容我们需要找到 webpack-cli 所对应的源码。




### 创建Compiler对象

在创建了 Compiler 对象过后，Webpack 就开始注册我们配置中的每一个插件了，
因为再往后 Webpack 工作过程的生命周期就要开始了，
所以必须先注册，这样才能确保插件中的每一个钩子都能被命中。



### 开始构建


完成 Compiler 对象的创建过后，紧接着这里的代码开始判断配置选项中是否启用了监视模式



1、如果是监视模式就调用 Compiler 对象的 watch 方法，以监视模式启动构建，但这不是我们主要关心的主线。
2、如果不是监视模式就调用 Compiler 对象的 run 方法，开始构建整个应用。


compile 方法内部主要就是创建了一个 Compilation 对象，这个对象我们在 04 课时中有提到，
Compilation 字面意思是“合集”，实际上，你就可以理解为一次构建过程中的上下文对象，
里面包含了这次构建中全部的资源和信息。


创建完 Compilation 对象过后，紧接着触发了一个叫作 make 的钩子，进入整个构建过程最核心的 make 阶段。




### make阶段


make 阶段主体的目标就是：根据 entry 配置找到入口模块，
开始依次递归出所有依赖，形成依赖关系树，然后将递归到的每个模块交给不同的 Loader 处理。



### make 阶段后续的流程


1、SingleEntryPlugin 中调用了 Compilation 对象的 addEntry 方法，开始解析入口；
2、addEntry 方法中又调用了 _addModuleChain 方法，将入口模块添加到模块依赖列表中；
3、紧接着通过 Compilation 对象的 buildModule 方法进行模块构建；
4、buildModule 方法中执行具体的 Loader，处理特殊资源加载；
5、build 完成过后，通过 acorn 库生成模块代码的 AST 语法树；
6、根据语法树分析这个模块是否还有依赖的模块，如果有则继续循环 build 每个依赖；
7、所有依赖解析完成，build 阶段结束；
8、最后合并生成需要输出的 bundle.js 写入 dist 目录。