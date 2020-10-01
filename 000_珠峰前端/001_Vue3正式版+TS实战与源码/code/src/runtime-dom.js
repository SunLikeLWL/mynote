export default nodeOps = {
    insert(child, parent, anchor) {
        if (anchor) {
            parent.insertBefore(child, anchor);
        }
        else {
            parent.appendChild(child)
        }
    },
    remove(child) {
        const parent = child.parentName;
        parent && parent.removeChild(child);
    },

    createElement(tag) {
        return document.createElement(tag)
    },
    hostSetElementText(el, text) {
        el.textContent = text;
    }
    ,
    hostPatchProps(el, key, value) {
        if (/on[^a-z]/.test(key)) {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, value)
        }
        else {
            if (key == 'style') {
                for (let key in value) {
                    el.style[key] = value[key];
                }
            }
            else {
                el.stAttribute(key, value)
            }
        }
    }


}