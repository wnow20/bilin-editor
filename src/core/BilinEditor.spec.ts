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
