class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }

    setAttribute(name, value) {
        // console.log("3. setAttrs...");
        if (name.match(/^on([\s\S]+)$/)) {
            // debugger;
            // console.log(RegExp.$1);
            let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
            this.root.addEventListener(eventName, value);
        }
        if (name === "className") this.root.setAttribute("class", value);
        this.root.setAttribute(name, value);
    }

    appendChild(vChild) {
        let range = document.createRange();
        if (this.root.children.length) {
            range.setStartAfter(this.root.lastChild);
            range.setEndAfter(this.root.lastChild);
        } else {
            range.setStart(this.root, 0);
            range.setEnd(this.root, 0);
        }
        vChild.mountTo(range);
    }
    mountTo(range) {
        // console.log("4. mountTo...", parent.nodeName, parent.id);
        // parent.appendChild(this.root);
        range.deleteContents();
        range.insertNode(this.root);
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }
    mountTo(range) {
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
    setAttribute(name, value) {
        this.props[name] = value;
        this[name] = value;
    }
    mountTo(range) {
        this.range = range;
        this.update();
    }
    update() {
        let placeholder = document.createComment("placeholder");
        let range = document.createRange();
        range.setStart(this.range.endContainer, this.range.endOffset);
        range.setEnd(this.range.endContainer, this.range.endOffset);
        range.insertNode(placeholder);
        this.range.deleteContents();
        let vDom = this.render();
        vDom.mountTo(this.range);

        // placeholder.parentNode.removeChild(placeholder);
    }
    appendChild(vChild) {
        this.children.push(vChild);
    }
    setState(state) {
        let merge = (oldState, newState) => {
            for (const s in newState) {
                if (typeof newState[s] === "object") {
                    if (typeof oldState[s] !== "object") {
                        oldState[p] = {};
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
