class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }

    setAttribute(name, value) {
        console.log("3. setAttrs...");
        this.root.setAttribute(name, value);
    }

    appendChild(vChild) {
        vChild.mountTo(this.root);
    }
    mountTo(parent) {
        debugger;
        console.log("4. mountTo...", parent.nodeName, parent.id);
        parent.appendChild(this.root);
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }
    mountTo(parent) {
        parent.appendChild(this.root);
    }
}

export class Component {
    constructor() {
        this.children = [];
    }
    setAttribute(name, value) {
        // debugger;
        console.log("???Set");
        this[name] = value;
    }
    mountTo(parent) {
        console.log("???Mount");
        let vDom = this.render();
        vDom.mountTo(parent);
    }
    appendChild(vChild) {
        this.children.push(vChild);
    }
}

export const ToyReact = {
    createElement(type, attrs, ...children) {
        console.log("2. CreateElement...", type);
        let element;
        if (typeof type === "string") {
            element = new ElementWrapper(type);
        } else {
            element = new type();
        }
        for (const attr in attrs) {
            element.setAttribute(attr, attrs[attr]);
        }
        // debugger;
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
        vDom.mountTo(element);
    }
};
