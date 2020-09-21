# 03 | 构建提速：如何正确使用 SourceMap？


### 什么是 Source Map


source-map 的基本原理是，在编译处理的过程中，
在生成产物代码的同时生成产物代码中被转换的部分与源代码中相应部分的映射关系表。


1、在开发环境中，通常我们关注的是构建速度快，质量高，以便于提升开发效率，而不关注生成文件的大小和访问方式。


2、在生产环境中，通常我们更关注是否需要提供线上 source map , 
生成的文件大小和访问方式是否会对页面性能造成影响等，其次才是质量和构建速度。




### webpack 中的 source map 预设




### Source Map 名称关键字



#### 1、false：
即不开启 source map 功能，其他不符合上述规则的赋值也等价于 false 。

#### 2、eval：
是指在编译器中使用 EvalDevToolModulePlugin 作为 sourcemap 的处理插件。

#### 3、[xxx-...]source-map：
根据 devtool 对应值中是否有 eval 关键字来决定使用 EvalSourceMapDevToolPlugin 或 SourceMapDevToolPlugin 作为 sourcemap 的处理插件，其余关键字则决定传入到插件的相关字段赋值。

#### 4、inline：
决定是否传入插件的 filename 参数，作用是决定单独生成 source map 文件还是在行内显示，该参数在 eval- 参数存在时无效。

#### 5、hidden：
决定传入插件 append 的赋值，作用是判断是否添加 SourceMappingURL 的注释，该参数在 eval- 参数存在时无效。

#### 6、module：
为 true 时传入插件的 module 为 true ，作用是为加载器（Loaders）生成 source map 。

#### 7、cheap：
这个关键字有两处作用。首先，当 module 为 false 时，它决定插件 module 参数的最终取值，最终取值与 cheap 相反。其次，它决定插件 columns 参数的取值，作用是决定生成的 source map 中是否包含列信息，在不包含列信息的情况下，调试时只能定位到指定代码所在的行而定位不到所在的列。

#### 8、nosource：
nosource 决定了插件中 noSource 变量的取值，作用是决定生成的 source map 中是否包含源代码信息，不包含源码情况下只能显示调用堆栈信息。



### Source Map 处理插件


#### 1、EvalDevToolModulePlugin：
模块代码后添加 sourceURL=webpack:///+ 模块引用路径，不生成 source map 内容，模块产物代码通过 eval() 封装。

#### 2、EvalSourceMapDevToolPlugin：
生成 base64 格式的 source map 并附加在模块代码之后， source map 后添加 sourceURL=webpack:///+ 模块引用路径，
不单独生成文件，模块产物代码通过 eval() 封装。

#### 3、SourceMapDevToolPlugin：
生成单独的 .map 文件，模块产物代码不通过 eval 封装。



### 不同预设的示例结果对比


#### 不同预设的效果总结


1、质量：

生成的 source map 的质量分为 5 个级别，对应的调试便捷性依次降低：


源代码 > 缺少列信息的源代码 > loader 转换后的代码 > 生成后的产物代码 > 无法显示代码（具体参见下面的不同质量的源码示例小节）。

对应对质量产生影响的预设关键字优先级为： 

souce-map = eval-source-map > cheap-module- > cheap- > eval = none > nosource-。



2、构建的速度：

再次构建速度都要显著快于初次构建速度。不同环境下关注的速度也不同：

在开发环境下：一直开着 devServer ，再次构建的速度对我们的效率影响远大于初次构建的速度。从结果中可以看到，eval- 对应的 EvalSourceMapDevToolPlugin 整体要快于不带 eval- 的 SourceMapDevToolPlugin 。尤其在质量最佳的配置下，eval-source-map 的再次构建速度要远快于其他几种。而同样插件配置下，不同质量配置与构建速度成反比，但差异程度有限，更多是看具体项目的大小而定。

在生产环境下：通常不会开启再次构建，因此相比再次构建，初次构建的速度更值得关注，甚至对构建速度以外因素的考虑要优先于对构建速度的考虑，这一部分我们在之后的构建优化的课程里会再次讨论到。



3、包的大小和生成方式：

在开发环境下我们并不需要关注这些因素，正如在开发环境下也通常不考虑使用分包等优化方式。我们需要关注速度和质量来保证我们的高效开发体验，而其他的部分则是在生产环境下需要考虑的问题。




### 开发环境下 Source Map 推荐预设


