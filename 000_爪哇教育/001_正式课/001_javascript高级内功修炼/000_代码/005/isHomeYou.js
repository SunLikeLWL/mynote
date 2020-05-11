var isHomeYou = {
    cursor: 0,
    next() {
        const actions = ['抖音', '荣耀', '吃饭', '睡觉'];
        if (this.cursor > 7) {
            return {
                done: true
            };
        }
        return {
            done: false,
            value: actions[this.cursor++ % actions.length]
        }
    },
    [Symbol.iterator]: function () {
        return this;
    }
}


for (var i = 0; i < 10; i++) {
    console.log(i)
    console.log(isHomeYou.next())
}
