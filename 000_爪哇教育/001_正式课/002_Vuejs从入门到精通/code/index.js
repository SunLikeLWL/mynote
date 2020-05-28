// 笔记

// package
// 整个项目源代码

// module
// 某个依赖模块

// bundle
// 打包出来的结果

// thunk
// 代码分割
// 子包






// ES module
import('./module.js').then(function (res) {
    console.log(res)
})


//webpack

require.ensure(['./module'], (require) => {
    const result = require("./module");
    console.log(result)
})
