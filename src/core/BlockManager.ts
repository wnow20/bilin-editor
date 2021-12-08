import {OutputBlock, OutputData} from "./BilinEditor";
import Block from "./block";
import debounce from "../utils/debounce";

class BlockManager {
    private holder: HTMLDivElement;
    private _state: OutputData;
    private blockInstances: Block[];

    constructor(state: OutputData) {
        this._state = state;
        this.initHolder();
    }

    render() {
        const blockInstances: Block[] = [];

        this._state.blocks.forEach((block: OutputBlock) => {
            let blockInstance = new Block({
                type: 'paragraph',
                state: {
                    ...block
                }
            });

            this.holder.append(blockInstance.holder);
            const observer = new MutationObserver((mutationRecords) => {
                debounce(() => {

                }, 100);
            });
            blockInstance.holder.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.code === 'Enter') {
                    event.preventDefault();
                    this.createDefaultBlockAfterCurrent();
                }
            });
            observer.observe(blockInstance.holder, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
            });
            blockInstances.push(blockInstance);
        });
        this.blockInstances = blockInstances;

        return this.holder;
    }

    createDefaultBlockAfterCurrent() {
        const newBlock = new Block({
            type: 'paragraph',
            state: {},
        });
        this.blockInstances.push(newBlock);
        this.appendBlock(newBlock);
        this.focus(newBlock);
    }

    private initHolder() {
        let blocksWrapper = document.createElement('div');
        blocksWrapper.classList.add('bl-blocks');
        this.holder = blocksWrapper;
    }

    getState() {
        return this.blockInstances.map(blockInstance => {
            return blockInstance.state;
        });
    }

    private appendBlock(block: Block) {
        this.holder.append(block.holder);
    }

    private focus(block: Block) {
        block.focus();
    }

    getLastBlock(): Block | undefined {
        if (this.blockInstances.length === 0) {
            return ;
        }
        return this.blockInstances[this.blockInstances.length - 1];
    }
    getFirstBlock(): Block | undefined {
        if (this.blockInstances.length === 0) {
            return ;
        }
        return this.blockInstances[0];
    }

    blockCount() {
        return this.blockInstances.length;
    }
}

export default BlockManager;
