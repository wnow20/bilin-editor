import BilinEditor from "./BilinEditor";

describe('BilinEditor Tests with element holder in options', () => {
    const editorHolder = document.createElement('div');
    document.body.append(editorHolder)

    const bilinEditor = new BilinEditor({
        blocks: [{
            type: 'paragraph',
            text: '123',
        }],
        version: 'v0',
        timestamp: (new Date()).getTime(),
    }, {
        holder: editorHolder,
    });

    it("should render wrapper correctly", () => {
        expect(editorHolder.children.length).toEqual(1);
        expect(editorHolder.children[0].className).withContext("[wrapper] div.bl-blocks render failed").toEqual("bl-blocks");
    });

    it('should render correctly when Editor Instance initialized', () => {
        expect(editorHolder.children.length).withContext('block not rendered').toEqual(1);
        const paragraphs = editorHolder.querySelectorAll(".bl-paragraph");
        expect(paragraphs.length).withContext("paragraph elements size not match").toEqual(1);
        expect(paragraphs[0].innerHTML).toEqual("123");
    });

    it('should get state when Editor Instance initialized', () => {
        expect(bilinEditor.getState().length).toEqual(1);
        expect(bilinEditor.getState()[0]).toEqual({
            type: 'paragraph',
            text: '123',
        });
    })
});

describe("BilinEditor handle Enter Keydown", () => {
    it('should focus block correctly', async () => {
        const editorHolder = document.createElement('div');
        editorHolder.id = 'BilinEditor_handle_Enter_Keydown'
        document.body.append(editorHolder)

        const bilinEditor = new BilinEditor({
            blocks: [{
                type: 'paragraph',
                text: '123',
            }],
            version: 'v0',
            timestamp: (new Date()).getTime(),
        }, {
            holder: editorHolder,
        });

        let firstBlock = bilinEditor.blockManager.getFirstBlock();
        firstBlock?.focus();
        expect(window.getSelection().anchorNode).toEqual(firstBlock.holder.firstChild);
    })

    it('should insert new default block before when enter omit at the first of block', async () => {
        const editorHolder = document.createElement('div');
        editorHolder.id = 'BilinEditor_handle_Enter_Keydown_at_first_of_block'
        document.body.append(editorHolder)

        const bilinEditor = new BilinEditor({
            blocks: [{
                type: 'paragraph',
                text: '123',
            }],
            version: 'v0',
            timestamp: (new Date()).getTime(),
        }, {
            holder: editorHolder,
        });

        let firstBlock = bilinEditor.blockManager.getFirstBlock();
        firstBlock?.focus(0);
        let prevCount = bilinEditor.blockManager.blockCount();
        expect(window.getSelection().anchorNode).toEqual(firstBlock.holder.firstChild.firstChild);

        firstBlock._handleEnterDown();

        let currentCount = bilinEditor.blockManager.blockCount();
        let lastBlock = bilinEditor.blockManager.getLastBlock();
        let newFirstBlock = bilinEditor.blockManager.getFirstBlock();

        expect(window.getSelection().anchorNode).toEqual(newFirstBlock.holder.firstChild);
        expect(currentCount).withContext("block count not match").toEqual(prevCount + 1);
        // expect(newFirstBlock).not.toEqual(lastBlock)
        expect(newFirstBlock.state).withContext("firstBlock is the new block").toEqual({
            type: 'paragraph',
            text: '',
        })
        expect(lastBlock.state).withContext("lastBlock is original block").toEqual({
            type: 'paragraph',
            text: '123',
        })
    })

    it('should insert new default block when enter omit at the end of block', async () => {
        const editorHolder = document.createElement('div');
        editorHolder.id = 'BilinEditor_handle_Enter_Keydown_at_end_of_block'
        document.body.append(editorHolder)

        const bilinEditor = new BilinEditor({
            blocks: [{
                type: 'paragraph',
                text: '123',
            }],
            version: 'v0',
            timestamp: (new Date()).getTime(),
        }, {
            holder: editorHolder,
        });

        let lastBlock = bilinEditor.blockManager.getLastBlock();
        lastBlock?.focus();
        let prevCount = bilinEditor.blockManager.blockCount();
        expect(window.getSelection().anchorNode).toEqual(lastBlock.holder.firstChild);

        lastBlock._handleEnterDown();

        let currentCount = bilinEditor.blockManager.blockCount();
        let newLastBlock = bilinEditor.blockManager.getLastBlock();

        expect(currentCount).withContext("block count not match").toEqual(prevCount + 1);
        expect(newLastBlock).not.toEqual(lastBlock)
        expect(newLastBlock.state).withContext("lastBlock is the new block").toEqual({
            type: 'paragraph',
            text: '',
        })
    })

    it('should insert new default block with text content when keydown middle a paragraph', async () => {
        const editorHolder = document.createElement('div');
        editorHolder.id = 'BilinEditor_handle_Enter_Keydown_in_text'
        document.body.append(editorHolder)

        const bilinEditor = new BilinEditor({
            blocks: [{
                type: 'paragraph',
                text: '123',
            }],
            version: 'v0',
            timestamp: (new Date()).getTime(),
        }, {
            holder: editorHolder,
        });

        let lastBlock = bilinEditor.blockManager.getLastBlock();
        lastBlock?.focus();
        let prevCount = bilinEditor.blockManager.blockCount();
        expect(window.getSelection().anchorNode).toEqual(lastBlock.holder.firstChild);
        let selection = getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        let textNode = lastBlock.holder.firstElementChild.firstChild;
        range.setStart(textNode, 2);
        range.setStart(textNode, 2);
        selection.addRange(range);

        lastBlock._handleEnterDown();

        let currentCount = bilinEditor.blockManager.blockCount();
        lastBlock = bilinEditor.blockManager.getLastBlock();
        expect(currentCount).withContext("block count not match").toEqual(prevCount + 1);
        expect(lastBlock.state).withContext("lastBlock is the new block").toEqual({
            type: 'paragraph',
            text: '3',
        })
    })

    it('should merge current block to previous block when Backspace Keydown when the caret at the first of current block', () => {
        const editorHolder = document.createElement('div');
        editorHolder.id = 'BilinEditor_handle_Backspace_Keydown_at_the_first_of_current_block'
        document.body.append(editorHolder)

        const bilinEditor = new BilinEditor({
            blocks: [{
                type: 'paragraph',
                text: 'mergeBlock\'s target,',
            }, {
                type: 'paragraph',
                text: 'mergeBlock\'s toMerge',
            }],
            version: 'v0',
            timestamp: (new Date()).getTime(),
        }, {
            holder: editorHolder,
        });

        let lastBlock = bilinEditor.blockManager.getLastBlock();
        lastBlock.focus(0);

        lastBlock._handleBackspaceDown()

        expect(bilinEditor.blockManager.blockCount()).toEqual(1);
        let expectText = 'mergeBlock\'s target,mergeBlock\'s toMerge';
        expect(bilinEditor.blockManager.getFirstBlock().state).toEqual({
            type: 'paragraph',
            text: expectText,
        });
        const selection = getSelection();
        expect(selection.focusNode).toEqual(selection.anchorNode);
        expect(selection.anchorNode.nodeType).toEqual(3);
        expect(selection.anchorOffset).toEqual(20);
        expect(selection.focusNode.nodeType).toEqual(3);
        expect(selection.focusOffset).toEqual(20);
        expect(selection.anchorNode.textContent).toEqual(expectText);
    })

    it('should not do anything when backspace keydown at the first of the first block', () => {
        const editorHolder = document.createElement('div');
        editorHolder.id = 'BilinEditor_handle_Backspace_Keydown_at_the_first_of_the_first_block'
        document.body.append(editorHolder)

        const bilinEditor = new BilinEditor({
            blocks: [{
                type: 'paragraph',
                text: 'mergeBlock\'s target,',
            }, {
                type: 'paragraph',
                text: 'mergeBlock\'s toMerge',
            }],
            version: 'v0',
            timestamp: (new Date()).getTime(),
        }, {
            holder: editorHolder,
        });

        let firstBlock = bilinEditor.blockManager.getFirstBlock();
        firstBlock.focus(0)

        let selection = getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        range.setStart(firstBlock.holder.firstChild.firstChild, 0);
        range.setEnd(firstBlock.holder.firstChild.firstChild, 0);
        selection.addRange(range);

        firstBlock._handleBackspaceDown()

        expect(bilinEditor.blockManager.blockCount()).toEqual(2);
        expect(bilinEditor.blockManager.getFirstBlock().state).toEqual({
            type: 'paragraph',
            text: 'mergeBlock\'s target,',
        });
        expect(bilinEditor.blockManager.getLastBlock().state).toEqual({
            type: 'paragraph',
            text: 'mergeBlock\'s toMerge',
        });
    })
})

describe("BilinEditor Tests with string holder in options", () => {
    const editorHolder = document.createElement('div');
    editorHolder.id = 'stringHolderSuiteEditor'
    document.body.append(editorHolder)

    const bilinEditor = new BilinEditor({
        blocks: [{
            type: 'paragraph',
            text: '123',
        }],
        version: 'v0',
        timestamp: (new Date()).getTime(),
    }, {
        holder: '#stringHolderSuiteEditor',
    });

    it('should render correctly with string holder correctly', () => {
        const editorState = bilinEditor.getState();

        expect(editorState[0]).toEqual({
            type: 'paragraph',
            text: '123',
        });
    })
})
