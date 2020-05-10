// 8.写一个正则，根据name取cookie中的值。
function get(name) {
    var reg = new RegExp(name + '=([^;]*)?(;|$)');
    var res = reg.exec(document.cookie);
    if (!res || !res[1]) return '';
    try {
        if (/(%[0-9A-F]{2}){2,}/.test(res)) {//utf8编码
            return decodeURIComponent(res);
        } else {//unicode编码
            return unescape(res);
        }
    } catch (e) {
        return unescape(res);
    }
}

console.log(get('id'))
