//  回文数

let r = isPalindrome(-121)
console.log(r)

function isPalindrome(x) {
    let arr = x.toString().split("");
    let h = arr.shift();
    let t = arr.pop();
    while (h !== undefined || t !== undefined) {
        if (h !== undefined && t !== undefined && h !== t) {
            return false
        }

        h = arr.shift();
        t = arr.pop();
    }
    return true
};