/*
1、函数的返回值为promise，成功的结果为response，异常的结果为error
2、能处理多种类型的请求：GET/POST/PUT/DELETE
3、函数参数为一个配置对象 
{
    url:'',//请求地址
    methods:"",//请求方式GET等
    params:"",//query参数
    data:{},// 
}
4、响应json数据自动解析为js
*/

function axios(config) {
    // 结构参数
    const { url, method = 'GET', params = {}, data = {} } = config;
    // 返回一个promise
    return new Promise((resolve, reject) => {
        //  1、执行异步ajax请求
        //   创建xhr对象
        const request = new XMLHttpRequest();
        //   打开链接(初始化请求，没有请求)
        request.open(method, url, true);
        // 发送请求
        request.send()
        //  2、如果请求成功了，调用resolve()
        //  3、如果请求失败了，调用reject()
    })
}

axios({ url: "http://127.0.1:8001/get" }) 