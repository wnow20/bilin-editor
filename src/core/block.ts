import {nanoid} from 'nanoid'
import omit from "../utils/omit";
import {Paragraph, ParagraphOptions} from "../components/paragraph";

export interface BlockConstructorOptions {
    id?: string;
    type: string;
    state: any;
}

class Block {
    private readonly id: string;
    private type: string;
    private originalState: any;
    private _holder: HTMLElement;
    private blockInstance: Paragraph;
    private _blockDom: Element;

    constructor({id = nanoid(), state, type}: BlockConstructorOptions) {
        this.id = id;
        this.type = type;
        this.originalState = state;

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
    focus() {
        const selection = window.getSelection();
        const isEmptyElement = this._blockDom.innerHTML === '';
        const range = document.createRange();

        if (isEmptyElement) {
            this._blockDom.innerHTML = '\u00a0';
            range.selectNodeContents(this._blockDom);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('delete', false, null);
        } else {
            // Range API refer to https://developer.mozilla.org/zh-CN/docs/Web/API/Range
            range.setStart(this._blockDom, 1);
            range.setEnd(this._blockDom, 1);
            // range.selectNodeContents(this._blockDom);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}

export default Block;
