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
                },
                blockManager: this,
            });

            this.holder.append(blockInstance.holder);
            // to listen [contentEditable="true"] elements change
            const observer = new MutationObserver((mutationRecords) => {
                debounce(() => {

                }, 100);
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

    focus(block: Block, index?: number) {
        block.focus(index);
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

    createBlockAfter(param: { state: { text: string }; type: string }, block: Block) {
        let newBlock = new Block({
            ...param,
            blockManager: this,
        });

        block.holder.insertAdjacentElement("afterend", newBlock.holder);
        let index = this.blockInstances.indexOf(block);
        this.blockInstances.splice(index + 1, 0, newBlock);
        return newBlock;
    }

    createBlockBefore(param: { state: {}; type: string }, block: Block) {
        let newBlock = new Block({
            ...param,
            blockManager: this,
        });

        block.holder.insertAdjacentElement("beforebegin", newBlock.holder);
        let index = this.blockInstances.indexOf(block);
        this.blockInstances.splice(index - 1, 0, newBlock);
        return newBlock;
    }

    removeBlock(block: Block) {
        let index = this.blockInstances.findIndex(value => block);
        this.blockInstances.splice(index, 1);
        block.destroy();
    }

    focusPreviousBlock(block: Block) {
        let blockIndex = this.blockInstances.findIndex(value => value === block);
        if (blockIndex - 1 >= 0) {
            let previousBlock = this.blockInstances[blockIndex - 1];
            this.focus(previousBlock);
        }
    }
}

export default BlockManager;
