export const throttle = (timeout = 1000) => (targetPrototype, propName) => {
    const oldMethod = targetPrototype[propName];
    let prevTime = 0;
    targetPrototype[propName] = function () {
        const curTime = +new Date();
        if (curTime - prevTime > timeout) {
            oldMethod.call(this);
            prevTime = curTime;
        }
    }
}