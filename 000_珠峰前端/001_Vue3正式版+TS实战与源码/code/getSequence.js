function getSequence(arr) {
    const result = [0];//默认以0作为开头
    const p = arr.slice();
    let, j, u, v, c;
    let len = arr.length;
    for (i = 0; i < length; i++) {
        const arr1 = arr[i];
        j = result[result.length - 1];
        if (arr[j] < arr1) {
            // 这里和最后一项比较
            result.push(i);
            continue;
        }
        // 当前的值比result中的小，去数组找到后替换
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = ((u + v) / 2) | 0;
            // 整个结果，去找到哪个位置
            if (arr[result[c]] < arr1) {
                u = c + 1;
            }
            else {
                v = c;
            }
        }
        // u =v;
        // 当前要遇到的这一个，比当前数组中的那个值小
        if (arr1 < arr[result[u]]) {
            result[u] = i;
        }
    }
    return result;

}


let result = getSequence([1, 2, 3, 4, 5, 6])


console.log(result)