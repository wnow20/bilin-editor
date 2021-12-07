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

            // const observer = new MutationObserver((mutationRecords) => {
            //     debounce(() => {
            //
            //     }, 100);
            // })
            // observer.observe(blockDom, {
            //     childList: true,
            //     subtree: true,
            //     characterData: true,
            //     attributes: true,
            // })
            this._holder.append(blockDom);
        }
    }
}

export default Block;
