

function Player() {
    this.name = 'Player';
}

function newObject() {
    let o = new Object();
    let FunctionConstructor = [].shift.call(arguments);
    o.__proto__ = FunctionConstructor.prototype;
    let resultObj = FunctionConstructor.apply(o, arguments);
    console.log(arguments)
    return typeof resultObj === 'object' ? resultObj : o;
}


const p1 = newObject(Player, "demo")


console.log(p1)