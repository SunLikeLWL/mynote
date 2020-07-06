# 如何利用插件机制横向扩展 Webpack 的构建能力


### 插件应用场景

1、实现自动在打包之前清除 dist 目录（上次的打包结果）；
2、自动生成应用所需要的 HTML 文件；
3、根据不同环境为代码注入类似 API 地址这种可能变化的部分；
4、拷贝不需要参与打包的资源文件到输出目录；
5、压缩 Webpack 打包完成后输出的文件；
6、自动发布打包结果到服务器实现自动部署。


### clean-webpack-plugin


清除上次打包dist文件



### html-webpack-plugin


生成index.html文件


###  copy-webpack-plugin

用于指定需要拷贝的文件路径




### 开发插件

clean-webpack-plugin


```js

class RemoveCommentPlugin{
    apply(compiler){
        compiler.hooks.emit.tap("removeCommentPlugin",compilation=>{
            //   compilation理解为此次打包的上下文 
              for(let name in compilation.asserts){
                  if(name.endsWidth('.js')){
                      let contents = compilation.asserts[name].source();
                      let noComments = contents.replace(/\/\/{2,}\/\s?/g,'');
                      compilation.asserts[name]= {
                          source:()=>noComments,
                          size:()=>noComments.length
                      }
                  }
              }
        })
    }
}



```