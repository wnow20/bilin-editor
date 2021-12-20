import BilinEditor from "./BilinEditor";


describe('Block Tests', () => {
    it('should focus empty paragraph block', () => {
        const editorHolder = document.createElement('div');
        editorHolder.id = 'Caret_Foucs_in_empty_paragraph'
        document.body.append(editorHolder)

        const bilinEditor = new BilinEditor({
            blocks: [{
                type: 'paragraph',
                text: '',
            }],
            version: 'v0',
            timestamp: (new Date()).getTime(),
        }, {
            holder: '#Caret_Foucs_in_empty_paragraph',
        });

        let firstBlock = bilinEditor.blockManager.getFirstBlock();
        firstBlock.focus();

        let selection = getSelection();
        expect(selection.type).toEqual('Caret');
        expect(selection.getRangeAt(0).endContainer).toEqual(firstBlock.holder.firstChild);
        expect((selection.getRangeAt(0).endContainer as HTMLElement).classList).toContain('bl-paragraph');
        expect(selection.focusNode.nodeType).toEqual(1);
        expect(selection.focusOffset).toEqual(0);
    })
});