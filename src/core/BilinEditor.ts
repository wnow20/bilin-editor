import Block from "./block";

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
    private blockInstances: Block[];
    private options: EditorOptions;
    private blocksWrapper: HTMLDivElement;

    constructor(state: OutputData, options: EditorOptions) {
        this.options = options;
        this.initHolder();
        this.render(state);
    }

    private initHolder() {
        let holder: HTMLElement;
        if (this.options.holder instanceof HTMLElement) {
            holder = this.options.holder;
        } else {
            holder = document.querySelector(this.options.holder);
        }
        this.holder = holder;
        let blocksWrapper = document.createElement('div');
        blocksWrapper.classList.add('bl-blocks');
        holder.append(blocksWrapper);
        this.blocksWrapper = blocksWrapper;
    }

    render(outputData: OutputData) {
        const blockInstances: Block[] = [];

        outputData.blocks.forEach((block: OutputBlock) => {
            let blockInstance = new Block({
                type: 'paragraph',
                state: {
                    ...block
                }
            });

            this.blocksWrapper.append(blockInstance.holder);
            blockInstances.push(blockInstance);
        })
        this.blockInstances = blockInstances;
    }

    getState() {
        return this.blockInstances.map(blockInstance => {
            return blockInstance.state;
        })
    }
}
