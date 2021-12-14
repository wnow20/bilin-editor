import BilinEditor from "./BilinEditor";

describe('BlockManager Tests', () => {
    const editorHolder = document.createElement('div');
    editorHolder.id = 'BlockManager_Tests'
    document.body.append(editorHolder)

    const bilinEditor = new BilinEditor({
        blocks: [{
            type: 'paragraph',
            text: '123',
        }, {
            type: 'paragraph',
            text: '4567',
        }],
        version: 'v0',
        timestamp: (new Date()).getTime(),
    }, {
        holder: editorHolder,
    });
    let blockManager = bilinEditor.blockManager;

    it("should render wrapper correctly", () => {
        let firstBlock = blockManager.getFirstBlock();
        firstBlock.focus();

        let currentBlock = blockManager.getCurrentBlock();

        expect(currentBlock).toEqual(firstBlock);

        blockManager.getLastBlock().focus();
        expect(blockManager.getCurrentBlock()).toEqual(blockManager.getLastBlock());
    });
});