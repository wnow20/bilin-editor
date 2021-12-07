import BlockManager from "./BlockManager";

export interface OutputBlock {
    type: string;

    [key: string]: any;
}

export interface OutputData {
    blocks: OutputBlock[];
    version: string;
    timestamp: number;
}

export interface EditorOptions {
    holder: string | HTMLElement;
}

export default class BilinEditor {
    private holder: HTMLElement;
    private options: EditorOptions;
    private blockManager: BlockManager;

    constructor(state: OutputData, options: EditorOptions) {
        this.options = options;
        this.initHolder();
        this.init(state);
        this.render();
    }

    private initHolder() {
        let holder: HTMLElement;
        if (this.options.holder instanceof HTMLElement) {
            holder = this.options.holder;
        } else {
            holder = document.querySelector(this.options.holder);
        }
        this.holder = holder;
    }

    render(): void {
        const blocksWrapper = this.blockManager.render();
        this.holder.append(blocksWrapper);
    }

    getState() {
        return this.blockManager.getState();
    }

    private init(state: OutputData) {
        this.blockManager = new BlockManager(state);
    }
}
