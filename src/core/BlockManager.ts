import {OutputBlock, OutputData} from "./BilinEditor";
import Block from "./block";
import debounce from "../utils/debounce";
import {createShadowCaret, focusShadowCaretAndClean} from "../utils/caret";
import CaretWalker from "./CaretWalker";
import {getCurrentBlockId, getCurrentInputBox, getSelectionCharacterOffsetWithin} from "../utils/doms";
import Pipe from "./Pipe";
import {Action, InsertTextAction} from "./Action";
import {isMac, isWin} from "./userAgent";

class BlockManager {
    private holder: HTMLDivElement;
    private _state: OutputData;
    private blockInstances: Block[];
    private caretWalker: CaretWalker;
    readonly changePipe: Pipe<Action<any>>;

    constructor(state: OutputData) {
        this._state = state;
        this.initHolder();
        this.caretWalker = new CaretWalker();
        this.changePipe = new Pipe<Action<any>>();
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
                console.log(mutationRecords);
                debounce(() => {

                }, 100);
            });
            observer.observe(blockInstance.holder, {
                attributeOldValue: true,
                attributes: true,
                characterData: true,
                characterDataOldValue: true,
                childList: true,
                subtree: true,
            });
            blockInstances.push(blockInstance);
        });
        this.holder.addEventListener('keydown', (event) => {
            if ((event.code === 'KeyZ' && event.ctrlKey && isWin)
                || (event.code === 'KeyZ' && event.metaKey && isMac)) {
                event.preventDefault();
                event.stopPropagation();

                if (event.shiftKey) {
                    let forward = this.changePipe.forward();
                    console.log("forward", forward);

                    if (forward && forward.type) {
                        if (forward.type === 'insertText') {
                            let data = forward.selection.focusNode.data;

                            forward.selection.focusNode.data = data + forward.text;

                            let selection = getSelection();
                            selection.removeAllRanges();
                            let range = document.createRange();
                            range.setStart(forward.selection.focusNode, forward.selection.focusNode.data.length);
                            range.setEnd(forward.selection.focusNode, forward.selection.focusNode.data.length);
                            selection.addRange(range);
                        }
                    }
                    return ;
                }

                let backward: Action<any> = this.changePipe.backward();
                console.log("backward", backward);
                if (backward && backward.type) {
                    if (backward.type === 'insertText') {
                        let data = backward.selection.focusNode.data;

                        backward.selection.focusNode.data = data.substring(0, data.length - backward.text.length);

                        let selection = getSelection();
                        selection.removeAllRanges();
                        let range = document.createRange();
                        range.setStart(backward.selection.focusNode, backward.selection.range.endOffset - backward.text.length);
                        range.setEnd(backward.selection.focusNode, backward.selection.range.endOffset - backward.text.length);
                        selection.addRange(range);
                    }

                }
            }
        })
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

    getBlockById(blockId: string): Block | undefined {
        let blocks = this.blockInstances.filter(value => {
            return value.id === blockId;
        });
        return blocks && blocks.length ? blocks[0] : undefined;
    }

    getCurrentBlock(): Block | undefined {
        let currentBlockId = getCurrentBlockId();
        return this.getBlockById(currentBlockId);
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
        if (block.isEmpty()) {
            this.removeBlock(block);
            previous.focus();
            return;
        }
        // TODO make sure two block can merge
        createShadowCaret();
        previous.mergeState(block.state);
        let shadowCaret = previous.holder.querySelector('.shadow-caret');
        focusShadowCaretAndClean(shadowCaret);
        previous.holder.normalize();
        // ??????????????????????????????????????????????????????"?????????"??????DOM?????????????????????????????????????????????????????????????????????????????????
        // ????????????https://developer.mozilla.org/zh-CN/docs/Web/API/Node/normalize
        this.removeBlock(block);
    }
}

export default BlockManager;
