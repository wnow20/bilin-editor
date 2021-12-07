import {EditorOptions, OutputBlock, OutputData} from "./BilinEditor";
import Block from "./block";

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
}

export default BlockManager;
