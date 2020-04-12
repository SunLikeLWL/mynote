function isValid(s){
    let l;
    do{
         l = s.length;
         s = s.replace("()","").replace("[]","").replace("{}","");
    }while(l!=s.length)
    return s.length ===0;
}

console.log(isValid("{[()]}"));
console.log(isValid("{[([)]}"));