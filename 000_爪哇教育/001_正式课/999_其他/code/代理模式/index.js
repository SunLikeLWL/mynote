const { Question } = require('./request')
let totalCount = 0;
const question = new Question();
const proxyQuestion = new Proxy(question, {
    get: function (target, key, receiver) {
        console.log('fetching...', totalCount)
        return Reflect.get(target, key, receiver)
    }
})
main();
async function main() {
    await proxyQuestion.all();
    await proxyQuestion.all();
    await proxyQuestion.all();
    console.log('totalCount', totalCount)
}
// 通过代理模式，我们将代码很好的解耦。有着很⾼的拓展性，此处通过封装了⼀层
proxyQuestion, 在不改动Question模块的前提下新增了很多功能