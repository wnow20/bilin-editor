import {nanoid} from 'nanoid'
import omit from "../utils/omit";
import {Paragraph, ParagraphOptions} from "../components/paragraph";
import BlockManager from "./BlockManager";

export interface BlockConstructorOptions {
    id?: string;
    type: string;
    state: any;
    blockManager: BlockManager,
}

function getCurrentInputBox(node: Node): HTMLElement {
    if (node instanceof HTMLElement) {
        let ele: HTMLElement = node;
        if (ele.contentEditable) {
            return ele;
        }
        return getCurrentInputBox(ele.parentElement);
    }
    return getCurrentInputBox(node.parentElement);
}

class Block {
    private readonly id: string;
    private type: string;
    private originalState: any;
    private _holder: HTMLElement;
    private blockInstance: Paragraph;
    private _blockDom: Element;
    private blockManager: BlockManager;

    constructor({id = nanoid(), state, type, blockManager}: BlockConstructorOptions) {
        this.id = id;
        this.type = type;
        this.originalState = state;
        this.blockManager = blockManager;

        this.initHolder();
        this.init();
    }

    get state() {
        return {
            type: this.type,
            ...this.blockInstance.state,
        };
    }

    get holder() {
        return this._holder;
    }

    private initHolder() {
        const holder = document.createElement('div');
        holder.classList.add('bl-block');
        this._holder = holder;
    }

    private init() {
        if (this.type === 'paragraph') {
            // TODO 类型转换问题
            const blockInstance = new Paragraph(omit(this.originalState, 'type') as unknown as ParagraphOptions);
            const blockDom = blockInstance.render();
            this.blockInstance = blockInstance;
            this._holder.append(blockDom);
            this._blockDom = blockDom;

            this.holder.addEventListener('keydown', this.onKeydown);
        }
    }

    onKeydown = (event: KeyboardEvent) => {
        if (event.code === 'Enter') {
            event.preventDefault();
            if (this.isAtStartOfCurrentBlock()) {
                this.insertDefaultBlockBefore()
            } else {
                this.split();
            }
        }
        if (event.code === 'Backspace') {
            if (this.isAtStartOfCurrentBlock()) {
                this.blockManager.focusPreviousBlock(this);
                this.blockManager.removeBlock(this);
            }
        }
    }

    insertDefaultBlockBefore() {
        let newBlock = this.blockManager.createBlockBefore({
            type: 'paragraph',
            state: {},
        }, this);
        this.blockManager.focus(newBlock);
    }

    isAtStartOfCurrentBlock(): boolean {
        let selection = getSelection();
        if (selection.rangeCount) {
            let range = selection.getRangeAt(0);
            if (range.startOffset === 0) {
                return true;
            }
        }
        return false;
    }

    split() {
        let selection = getSelection();
        if (selection.rangeCount) {
            let range = selection.getRangeAt(0);
            if (selection.type === 'Range') {
                range.deleteContents();
            }

            let extraRange = document.createRange();

            const currentInputBox = getCurrentInputBox(selection.anchorNode);
            extraRange.selectNodeContents(currentInputBox);
            extraRange.setStart(range.endContainer, range.endOffset);
            let documentFragment = extraRange.extractContents();
            let wrapper = document.createElement('div');
            wrapper.append(documentFragment);
            let newBlock = this.blockManager.createBlockAfter({
                type: 'paragraph',
                state: {
                    text: wrapper.innerHTML || '',
                },
            }, this);
            this.blockManager.focus(newBlock, 0);
        }
    }

    /*
        How to focus empty contentEditable element
        method 1:
        var div = document.getElementById('contenteditablediv');
            setTimeout(function() {
                div.focus();
            }, 0);

        var p = document.getElementById('contentEditableElementId'),
            s = window.getSelection(),
            r = document.createRange();
        p.innerHTML = 'u00a0';
        r.selectNodeContents(p);
        s.removeAllRanges();
        s.addRange(r);
        document.execCommand('delete', false, null);

        refer to https://www.py4u.net/discuss/906393
     */
    focus(index?: number) {
        const selection = window.getSelection();
        const isEmptyElement = this._blockDom.innerHTML === '';
        const range = document.createRange();
        selection.removeAllRanges();

        if (isEmptyElement) {
            this._blockDom.innerHTML = '\u00a0';
            range.selectNodeContents(this._blockDom);
            selection.addRange(range);
            document.execCommand('delete', false, null);
        } else {
            if (index === undefined) {
                // Range API refer to https://developer.mozilla.org/zh-CN/docs/Web/API/Range
                range.setStart(this._blockDom, 1);
                range.setEnd(this._blockDom, 1);
                // range.selectNodeContents(this._blockDom);
                selection.addRange(range);
            }
            if (index === 0) {
                range.setStart(this._blockDom, 0);
                range.setEnd(this._blockDom, 0);
                selection.addRange(range);
            }
        }
    }

    destroy() {
        this.holder.removeEventListener('keydown', this.onKeydown);
        this.holder.remove();
    }
}

export default Block;
