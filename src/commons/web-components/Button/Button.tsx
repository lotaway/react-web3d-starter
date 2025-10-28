class WButton extends HTMLButtonElement {

    connectedCallback() {
        const shadow = this.attachShadow({
            mode: "open",
        })
        shadow.innerHTML = `
            <span className="icon">
            </span>
            <span className="text">
                <slot id="text"/>
            </span>
        `
    }

    disconnectedCallback() {

    }

    static get obversedAttributes() {
        return [""]
    }

}