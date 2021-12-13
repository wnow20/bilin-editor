import "./paragraph.css"

export interface ParagraphBlock {
    type: string;

    [key: string]: any;
}

export interface ParagraphOptions {
    text: string;
}

export class Paragraph {
    private text: string;
    private wrapper: Element;

    constructor({text}: ParagraphOptions) {
        this.text = text;
    }

    get state() {
        return {
            text: this.wrapper.innerHTML,
        };
    }

    set state({text}: {text: string}) {
        this.text = text;
        this.wrapper.innerHTML = text;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add("bl-paragraph");
        wrapper.contentEditable = 'true';
        wrapper.innerHTML = this.text || '';
        this.wrapper = wrapper;
        return this.wrapper;
    }
}
