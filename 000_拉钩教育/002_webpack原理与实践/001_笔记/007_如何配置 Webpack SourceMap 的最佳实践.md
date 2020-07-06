# 如何配置 Webpack SourceMap 的最佳实践 


### Source Map 


作用：映射转换后的代码与源代码之间的关系



### 属性


1、version 是指定所使用的 Source Map 标准版本；
2、sources 中记录的是转换前的源文件名称，因为有可能出现多个文件打包转换为一个文件的情况，所以这里是一个数组；
3、names 是源代码中使用的一些成员名称，我们都知道一般压缩代码时会将我们开发阶段编写的有意义的变量名替换为一些简短的字符，这个属性中记录的就是原始的名称；
4、mappings 属性，这个属性最为关键，它是一个叫作 base64-VLQ 编码的字符串，里面记录的信息就是转换后代码中的字符与转换前代码中的字符之间的映射关系



### Webpack 中配置 Source Map


```json

module.exports = {
  "devtool": 'source-map' // source map 设置
}

```




### 配置模式


```js

const allModes = [
  'eval',
  'cheap-eval-source-map',
  'cheap-module-eval-source-map',
  'eval-source-map',
  'cheap-source-map',
  'cheap-module-source-map',
  'inline-cheap-source-map',
  'inline-cheap-module-source-map',
  'source-map',
  'inline-source-map',
  'hidden-source-map',
  'nosources-source-map'
]


```


