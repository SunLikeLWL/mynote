

import nodeOps from './nodeOps';
import { effect } from './reactivity';
export function render(vnode, container) {
    patch(null, vnode, container)
}


function patch(n1, n2, container) {
    if (typeof n2.tag == 'string') {
        // 标签
        mountElement(n2, container);
    }
    else if (typeof n2.tag == 'object') {
        //  组件
    }
}


function mountComponent(vnode, container) {
    // 根据组件创建一个实例
    const instance = {
        vnode,
        render: null,// 当前setup的返回值
        subTree: null,//render方法的返回结果

    }
    const Component = vnode.tag;
    instance.render = Component.setup(vnode.props, instance);
    effect(() => {
        // 如果返回的是对象，template=> render方法 把render方法在挂载对象上
        // 如果可以做vue2兼容 拿到vue2中的options API 和setup的返回值
        instance.subTree = instance.render && instance.render();
        patch(null, instance, subTree, container);// 将组件插入到容器中
    })

}


function mountElement(vnode, container) {
    const { tag, children, props } = vnode;
    let el = (vnode.el = nodeOps.createElement(tag))


    if (props) {
        for (let key in props) {
            nodeOps.hostPatchProps(el, key, props[key])
        }
    }


    if (Array.isArray(children)) {
        mountChildren(children, el)
    }
    else {
        el.hostSetElementText(el, children)
    }
    nodeOps.insert(el, container)
}



function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        patch(null, child, container)
    }
}

