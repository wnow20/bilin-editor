import {nanoid} from 'nanoid'
import omit from "../utils/omit";
import {Paragraph, ParagraphOptions} from "../components/paragraph";
import BlockManager from "./BlockManager";
import {createNodeRange, getCurrentInputBox} from "../utils/doms";
import debounce from "../utils/debounce";

export interface BlockConstructorOptions {
    id?: string;
    type: string;
    state: any;
    blockManager: BlockManager,
}

class Block {
    readonly id: string;
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

    set state(nextState: any) {
        if (this.type === 'paragraph') {
            this.blockInstance.state = nextState;
        }
    }

    get holder() {
        return this._holder;
    }

    private initHolder() {
        const holder = document.createElement('div');
        holder.classList.add('bl-block');
        holder.dataset.id = this.id;
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
            this.holder.addEventListener('input', (ev: InputEvent) => {
                if (ev.isComposing || !ev.data) {
                    return;
                }
                this.pushInputAction(ev);
            })
            this.holder.addEventListener('compositionstart', (event: CompositionEvent) => {
            });
            this.holder.addEventListener('compositionend', (event: CompositionEvent) => {
                this.blockManager.changePipe.push({
                    type: 'input',
                    text: event.data
                });
            });
            this.holder.addEventListener('paste', (e: ClipboardEvent) => {
                let data = e.clipboardData.getData('Text');
                this.blockManager.changePipe.push({
                    type: 'input',
                    text: data,
                });
            });
        }
    }

    pushInputAction = debounce((event: InputEvent) => {
        this.blockManager.changePipe.push({
            type: 'input',
            data: event.data,
        })
    }, 100);

    onKeydown = (event: KeyboardEvent) => {
        if (event.code === 'Enter') {
            event.preventDefault();
            if (!event.isComposing) {
                this._handleEnterDown();
            }
        }
        if (event.code === 'Backspace') {
            if (this.isAtStartOfCurrentBlock() && getSelection().type === 'Caret') {
                event.preventDefault();
                this._handleBackspaceDown();
            }
        }
        if (event.code === 'ArrowUp') {
            event.preventDefault();
            this._handleArrowUp();
        }
        if (event.code === 'ArrowDown') {
            event.preventDefault();
            this._handleArrowDown();
        }
    }

    _handleArrowUp() {
        this.blockManager.focusPreviousBlock(this);
    }

    _handleArrowDown() {
        this.blockManager.focusNextBlock(this);
    }

    _handleBackspaceDown() {
        this.blockManager.mergeToPrevious(this);
    }

    _handleEnterDown() {
        if (this.isAtStartOfCurrentBlock()) {
            this.insertDefaultBlockBefore()
        } else {
            this.split();
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

        refer from https://www.py4u.net/discuss/906393
     */
    focus(index?: number) {
        const selection = window.getSelection();
        const isEmptyElement = this._blockDom.innerHTML === '';
        let range = document.createRange();
        selection.removeAllRanges();

        if (isEmptyElement) {
            this._blockDom.innerHTML = '\u00a0';
            range.selectNodeContents(this._blockDom);
            selection.addRange(range);
            document.execCommand('delete', false, null);
        } else {
            if (index === undefined) {
                // Range API refer from https://developer.mozilla.org/zh-CN/docs/Web/API/Range
                range.setStart(this._blockDom, this._blockDom.childNodes.length);
                range.setEnd(this._blockDom, this._blockDom.childNodes.length);
                // range.selectNodeContents(this._blockDom);
                selection.addRange(range);
                return;
            }
            if (index === 0) {
                range.setStart(this._blockDom.firstChild, 0);
                range.setEnd(this._blockDom.firstChild, 0);
                selection.addRange(range);
                return;
            }

            if (index === -1) {
                index = this._blockDom.textContent.length;
            }

            let chars = {count: index};
            range = createNodeRange(this._blockDom, chars, null);
            if (chars.count !== 0) {
                range.selectNodeContents(this._blockDom);
            }
            if (range) {
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            }
        }
    }

    destroy() {
        this.holder.removeEventListener('keydown', this.onKeydown);
        this.holder.remove();
    }

    // TODO generic type
    mergeState(state: { text: string; type: string }) {
        const targetState = this.state;
        let isMatch = targetState.type === state.type;
        if (!isMatch) {
            return;
        }

        const mergedState = {};
        Object.entries(omit(state, 'type')).forEach(([key, value]) => {
            if (targetState.hasOwnProperty(key)) {
                mergedState[key] = targetState[key] + value;
            } else {
                mergedState[key] = value;
            }
        });
        this.state = mergedState;
    }
}

export default Block;
