import {MyLibrary} from './MyLibrary';
import {omit} from "./omit";
import debounce from "./debounce";

console.log('See this in your browser console: Typescript Webpack Starter Launched');

const myLibrary = new MyLibrary();
const result = myLibrary.executeDependency();

console.log(`A random number ${result}`);

interface OutputBlock {
    type: string;
    [key: string]: any;
}

interface OutputData {
    blocks: OutputBlock[];
    version: string;
    timestamp: number;
}

interface EditorOptions {
    holder: string | HTMLElement;
    data: OutputData,
}

let editor: EditorOptions = {
    holder: '#editor',
    data: {
        blocks: [{
            type: 'paragraph',
            text: '123',
        }],
        version: 'v0',
        timestamp: (new Date()).getTime(),
    },
};

interface Paragraph {
    type: string;
    [key: string]: any;
}

interface ParagraphOptions {
    text: string;
}
class Paragraph {
    private text: string;
    private wrapper: Element;

    constructor({ text }: ParagraphOptions) {
        this.text = text;
    }

    get state() {
        return {
            text: this.wrapper.innerHTML,
        };
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.contentEditable = 'true';
        wrapper.innerHTML = this.text;
        this.wrapper = wrapper;
        return this.wrapper;
    }
}

let holder: HTMLElement;
if (editor.holder instanceof HTMLElement) {
    holder = editor.holder;
} else {
    holder = document.querySelector(editor.holder);
}


const blockInstances: OutputBlock[] = [];

editor.data.blocks.forEach((block: OutputBlock) => {
    if (block.type === 'paragraph') {

        // TODO 类型转换问题
        const blockInstance = new Paragraph(omit(block, 'type') as unknown as ParagraphOptions);
        const blockDom = blockInstance.render();

        const observer = new MutationObserver((mutationRecords) => {
            debounce(() => {

            }, 100);
        })
        observer.observe(blockDom, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
        })

        if (blockInstance) {
            holder.append(blockDom);
        }
        blockInstances.push(blockInstance);
    }
})

function getEditorState() {
    return blockInstances.map(blockInstance => {

        return {
            type: blockInstance.type,
            ...blockInstance.state,
        };
    })
}

let element = document.querySelector('#btn');
element.addEventListener('click', function () {
    let editorState = getEditorState();
    console.log(editorState);
})
