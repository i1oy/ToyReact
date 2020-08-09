let childrenSymbol = Symbol("children");
class ElementWrapper {
    constructor(type) {
        // this.root = document.createElement(type);
        this.type = type;
        this.props = {};
        this[childrenSymbol] = [];
        this.children = [];
    }

    setAttribute(name, value) {
        // console.log("3. setAttrs...");
        // if (name.match(/^on([\s\S]+)$/)) {
        //     // debugger;
        //     // console.log(RegExp.$1);
        //     let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
        //     this.root.addEventListener(eventName, value);
        // }
        // if (name === "className") this.root.setAttribute("class", value);
        // this.root.setAttribute(name, value);
        this.props[name] = value;
    }

    appendChild(vChild) {
        this[childrenSymbol].push(vChild);
        this.children.push(vChild.vDom);
        // let range = document.createRange();
        // if (this.root.children.length) {
        //     range.setStartAfter(this.root.lastChild);
        //     range.setEndAfter(this.root.lastChild);
        // } else {
        //     range.setStart(this.root, 0);
        //     range.setEnd(this.root, 0);
        // }
        // vChild.mountTo(range);
    }
    get vDom() {
        return this;
        // let vChidren = this.children.map(child => child.vDom);
        // return {
        //     type: this.type,
        //     props: this.props,
        //     children: vChidren
        // };
    }

    // get children() {
    //     return this[childrenSymbol].map(child => child.vDom);
    // }
    mountTo(range) {
        this.range = range;

        let placeholder = document.createComment("pl");
        let endRange = document.createRange();
        endRange.setStart(range.endContainer, range.endOffset);
        endRange.setEnd(range.endContainer, range.endOffset);
        endRange.insertNode(placeholder);
        // console.log("4. mountTo...", parent.nodeName, parent.id);
        // parent.appendChild(this.root);
        range.deleteContents();
        let element = document.createElement(this.type);
        for (const name in this.props) {
            if (this.props.hasOwnProperty(name)) {
                const value = this.props[name];

                if (name.match(/^on([\s\S]+)$/)) {
                    let eventName = RegExp.$1.replace(/^[\s\S]/, s =>
                        s.toLowerCase()
                    );
                    element.addEventListener(eventName, value);
                }
                if (name === "className") element.setAttribute("class", value);
                element.setAttribute(name, value);
            }
        }

        for (const child of this.children) {
            let range = document.createRange();
            if (element.children.length) {
                range.setStartAfter(element.lastChild);
                range.setEndAfter(element.lastChild);
            } else {
                range.setStart(element, 0);
                range.setEnd(element, 0);
            }
            child.mountTo(range);
        }

        range.insertNode(element);
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
        this.type = "#text";
        this.children = [];
        this.props = {};
    }
    get vDom() {
        return this;
        // return {
        //     type: "#text",
        //     props: this.props,
        //     children: []
        // };
    }
    mountTo(range) {
        this.range = range;
        range.deleteContents();
        range.insertNode(this.root);
        // parent.appendChild(this.root);
    }
}

export class Component {
    constructor() {
        this.children = [];
        this.props = Object.create(null);
    }
    getType() {
        return this.constructor.name;
    }
    setAttribute(name, value) {
        this.props[name] = value;
        this[name] = value;
    }
    mountTo(range) {
        this.range = range;
        this.update();
    }
    get vDom() {
        return this.render().vDom;
    }
    update() {
        // let placeholder = document.createComment("placeholder");
        // let range = document.createRange();
        // range.setStart(this.range.endContainer, this.range.endOffset);
        // range.setEnd(this.range.endContainer, this.range.endOffset);
        // range.insertNode(placeholder);
        // this.range.deleteContents();
        let vDom = this.vDom;
        if (this.oldVDom) {
            let isSameNode = (node1, node2) => {
                if (node1.type !== node2.type) {
                    return false;
                }
                for (const name in node1.props) {
                    // if (
                    //     typeof node1.props[name] === "function" &&
                    //     typeof node2.props[name] === "function" &&
                    //     node1.props[name].toString() ===
                    //         node2.props[name].toString()
                    // ) {
                    //     continue;
                    // }
                    if (
                        typeof node1.props[name] === "object" &&
                        typeof node2.props[name] === "object" &&
                        JSON.stringify(node1.props[name]) ===
                            JSON.stringify(node2.props[name])
                    ) {
                        continue;
                    }
                    if (node1.props[name] !== node2.props[name]) return false;
                }
                if (
                    Object.keys(node1.props).length !==
                    Object.keys(node2.props).length
                )
                    return false;
                return true;
            };

            let isSameTree = (node1, node2) => {
                if (!isSameNode(node1, node2)) {
                    return false;
                }
                if (node1.children.length !== node2.children.length)
                    return false;
                for (let i = 0; i < node1.children.length; i++) {
                    if (!isSameTree(node1.children[i], node2.children[i]))
                        return false;
                }
                return true;
            };

            let replace = (newTree, oldTree) => {
                if (isSameTree(newTree, oldTree)) return;
                if (!isSameNode(newTree, oldTree)) {
                    newTree.mountTo(oldTree.range);
                } else {
                    for (let i = 0; i < newTree.children.length; i++) {
                        replace(newTree.children[i], oldTree.children[i]);
                    }
                }
            };
            replace(vDom, this.oldVDom);
            // console.log("new:", vDom);
            // console.log("old:", this.vDom);
        } else {
            vDom.mountTo(this.range);
        }

        this.oldVDom = vDom;

        // placeholder.parentNode.removeChild(placeholder);
    }
    appendChild(vChild) {
        this.children.push(vChild);
    }
    setState(state) {
        let merge = (oldState, newState) => {
            for (const s in newState) {
                if (typeof newState[s] === "object" && newState[s] !== null) {
                    if (typeof oldState[s] !== "object") {
                        if (newState[s] instanceof Array) {
                            oldState[s] = [];
                        } else {
                            oldState[s] = {};
                        }
                    }
                    merge(oldState[s], newState[s]);
                } else {
                    oldState[s] = newState[s];
                }
            }
        };

        if (!this.state && state) {
            this.state = {};
        }

        merge(this.state, state);
        // console.log(this.state);
        this.update();
    }
}

export const ToyReact = {
    createElement(type, attrs, ...children) {
        // console.log("2. CreateElement...", type);
        let element;
        if (typeof type === "string") {
            element = new ElementWrapper(type);
        } else {
            element = new type();
        }
        for (const attr in attrs) {
            element.setAttribute(attr, attrs[attr]);
        }
        let insertChildren = children => {
            for (let child of children) {
                if (typeof child === "object" && child instanceof Array) {
                    insertChildren(child);
                } else {
                    if (child === null || child === void 0) child = "";
                    if (
                        !(child instanceof Component) &&
                        !(child instanceof ElementWrapper) &&
                        !(child instanceof TextWrapper)
                    ) {
                        child = String(child);
                    }
                    if (typeof child === "string") {
                        child = new TextWrapper(child);
                    }
                    element.appendChild(child);
                }
            }
        };
        insertChildren(children);
        return element;
    },
    render(vDom, element) {
        let range = document.createRange();
        if (element.children.length) {
            range.setStartAfter(element.lastChild);
            range.setEndAfter(element.lastChild);
        } else {
            range.setStart(element, 0);
            range.setEnd(element, 0);
        }
        vDom.mountTo(range);
    }
};
