function isValid(s) {
    let stack = [];
    map = { ')': '(', ']': '[', '}': '{' };
    for (let i = 0; i < s.length; i++) {
        console.log(s[i],(s[i] in map))
        if (!(s[i] in map)) {
            stack.push(s[i])
        }
        else {
            if (map[s[i]] !== stack.pop()) {
                return false;
            }

        }
    }
    console.log(stack)
    if (stack.length===0) {
        return true
    }
    return false;
}

console.log(isValid('([{])'))