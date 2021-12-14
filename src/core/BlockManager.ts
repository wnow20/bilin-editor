import {OutputBlock, OutputData} from "./BilinEditor";
import Block from "./block";
import debounce from "../utils/debounce";
import {createShadowCaret, focusShadowCaretAndClean} from "../utils/caret";
import CaretWalker from "./CaretWalker";
import {getCurrentInputBox, getSelectionCharacterOffsetWithin} from "../utils/doms";

class BlockManager {
    private holder: HTMLDivElement;
    private _state: OutputData;
    private blockInstances: Block[];
    private caretWalker: CaretWalker;

    constructor(state: OutputData) {
        this._state = state;
        this.initHolder();
        this.caretWalker = new CaretWalker();
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
        this.holder.addEventListener('keydown', (event) => {
            if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                this.caretWalker.changeOffset(null);
            }
        })
        this.holder.addEventListener('click', (event) => {
            this._handleEditorClickEvent();
        })
    }

    _handleEditorClickEvent() {
        let selection = getSelection();
        if (selection.type !== 'None') {
            let currentInputBox = getCurrentInputBox(selection.focusNode);
            if (currentInputBox) {
                let selectionCharacterOffsetWithin = getSelectionCharacterOffsetWithin(currentInputBox);
                if (selectionCharacterOffsetWithin) {
                    let nextOffset = currentInputBox.textContent.length === selectionCharacterOffsetWithin.end ? -1 : selectionCharacterOffsetWithin.end;
                    this.caretWalker.changeOffset(nextOffset);
                }
            }
        }
    }

    get caretWalkOffset() {
        return this.caretWalker.getOffset();
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
            return;
        }
        return this.blockInstances[this.blockInstances.length - 1];
    }

    getFirstBlock(): Block | undefined {
        if (this.blockInstances.length === 0) {
            return;
        }
        return this.blockInstances[0];
    }

    getBlock(index: number): Block | undefined {
        if (this.blockInstances.length === 0) {
            return;
        }
        return this.blockInstances[index];
    }

    getCurrentBlock(): Block | undefined {
        return ;
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
        let index = this.blockInstances.findIndex(value => value === block);
        this.blockInstances.splice(index, 1);
        block.destroy();
    }

    focusPreviousBlock(block: Block) {
        let blockIndex = this.blockInstances.findIndex(value => value === block);
        if (blockIndex - 1 >= 0) {
            let previousBlock = this.blockInstances[blockIndex - 1];

            let index = this.caretWalkOffset != null ? this.caretWalkOffset : getSelectionCharacterOffsetWithin(block.holder).end;
            this.caretWalker.changeOffset(index);
            this.focus(previousBlock, index);
        }
    }

    focusNextBlock(block: Block) {
        let blockIndex = this.blockInstances.findIndex(value => value === block);
        if (blockIndex + 1 <= this.blockInstances.length) {
            let nextBlock = this.blockInstances[blockIndex + 1];
            let index = this.caretWalkOffset != null ? this.caretWalkOffset : getSelectionCharacterOffsetWithin(block.holder).end;
            this.caretWalker.changeOffset(index);
            this.focus(nextBlock, index);
        }
    }

    mergeToPrevious(block: Block) {
        const blockIndex = this.blockInstances.findIndex(value => value === block);
        if (blockIndex === 0) {
            return;
        }
        const previous = this.blockInstances[blockIndex - 1];

        createShadowCaret();
        previous.mergeState(block.state);
        let shadowCaret = previous.holder.querySelector('.shadow-caret');
        focusShadowCaretAndClean(shadowCaret);
        previous.holder.normalize();
        // 规范化当前节点和它的后代节点，在一个"规范化"后的DOM树中，不存在一个空的文本节点，或者两个相邻的文本节点。
        // 参考自：https://developer.mozilla.org/zh-CN/docs/Web/API/Node/normalize
        this.removeBlock(block);
    }
}

export default BlockManager;
