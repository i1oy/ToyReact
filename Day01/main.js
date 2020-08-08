import { ToyReact, Component } from "./ToyReact.js";

class MyComponent extends Component {
    render() {
        console.log("1. MyComp render...");
        return (
            <div id='x1'>
                <p>Hello, World!</p>
                <div>
                    {true}
                    {this.children}
                </div>
            </div>
        );
    }
}

let a = (
    <MyComponent id='idea'>
        <div>HTML,CSS,JavaScript</div>
    </MyComponent>
);

ToyReact.render(a, document.getElementById("root"));
// document.body.appendChild(a);
// console.log(a);
