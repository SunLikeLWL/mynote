var reverse = function (x) {
    let min = - Math.pow(2, 31)
    let max = Math.pow(2, 31) - 1;

    console.log(min, max)

    let arr = (x + '').split("").reverse();

    let index = arr.indexOf("-");

    if (index > 0) {
        arr = arr.slice(0, index);
        arr.unshift("-")

    }
    let result = parseInt(arr.join(""))

    if (result <= min || result >= max) {
        return 0;
    }

    return result;
};


console.log(reverse(1563847412))