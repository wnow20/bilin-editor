import {createShadowCaret, focusShadowCaretAndClean} from "./caret";

describe('Util Caret', () => {
    it('should insert shadow caret before', async () => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("test_createShadowCaret");
        const paragraph = document.createElement("p");
        paragraph.innerHTML = 'this is a paragraph. <code>print \'Hello World\'</code>'
        wrapper.append(paragraph);
        document.body.append(wrapper);

        let selection = getSelection();
        selection.removeAllRanges();
        const range = document.createRange();
        range.setStart(paragraph, 0);
        range.setEnd(paragraph, 0);
        selection.addRange(range)

        createShadowCaret()

        let shadowCaret = wrapper.querySelector(".shadow-caret");

        expect(shadowCaret).not.toBeNull();
        expect(shadowCaret.parentElement).toEqual(paragraph);
        selection = getSelection()
        expect(selection.focusNode.nodeType).toEqual(1);
        expect(selection.focusNode).toEqual(paragraph);
        expect(selection.focusOffset).toEqual(0);
    });

    it('should insert shadow caret before when the caret in text', async () => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("test_createShadowCaret");
        const paragraph = document.createElement("p");
        paragraph.innerHTML = 'this is a paragraph. <code>print \'Hello World\'</code>'
        wrapper.append(paragraph);
        document.body.append(wrapper);

        let selection = getSelection();
        selection.removeAllRanges();
        const range = document.createRange();
        range.setStart(paragraph.firstChild, 10);
        range.setEnd(paragraph.firstChild, 10);
        selection.addRange(range)

        createShadowCaret();

        let shadowCaret = wrapper.querySelector(".shadow-caret");

        expect(shadowCaret).not.toBeNull();
        expect(shadowCaret.parentElement).toEqual(paragraph);
        const expectShadowCaret = shadowCaret.parentElement.childNodes[1];
        expect((expectShadowCaret as Element).classList.contains("shadow-caret")).toBeTrue();
        expect(expectShadowCaret.previousSibling.textContent.length).toEqual(10);
        selection = getSelection()
        expect(selection.focusNode.nodeType).toEqual(3); // text node
        expect(selection.focusNode).toEqual(paragraph.firstChild);
        expect(selection.focusOffset).toEqual(10);
    });

    it('should not insert shadow caret when selection equals Range', async () => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("test_createShadowCaret");
        const paragraph = document.createElement("p");
        paragraph.innerHTML = 'this is a paragraph. <code>print \'Hello World\'</code>'
        wrapper.append(paragraph);
        document.body.append(wrapper);

        let selection = getSelection();
        selection.removeAllRanges();
        const range = document.createRange();
        range.setStart(paragraph, 0);
        range.setEnd(paragraph, 1);
        selection.addRange(range)

        createShadowCaret()

        let shadowCaret = wrapper.querySelector(".shadow-caret");

        expect(shadowCaret).toBeNull();
        selection = getSelection()
        expect(selection.focusNode.nodeType).toEqual(1);
        expect(selection.focusNode).toEqual(paragraph);
        expect(selection.focusOffset).toEqual(1);
    });

    it('should focus element\'s text node and clean shadow correctly', () => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("test_focusShadowCaretAndClean");
        const paragraph = document.createElement("p");
        paragraph.innerHTML = 'this is a <span class="shadow-caret">toDelete</span>paragraph.'
        wrapper.append(paragraph);
        document.body.append(wrapper);

        let shadowCaret = paragraph.querySelector('.shadow-caret');

        focusShadowCaretAndClean(shadowCaret);

        let selection = getSelection();
        let range = selection.getRangeAt(0);

        expect(range.startContainer === range.endContainer).toBeTrue();
        expect(selection.focusNode.nodeType).toEqual(1);
        expect(selection.focusNode.textContent).toEqual(paragraph.textContent);
        expect(selection.focusOffset).toEqual(1);
    })

    it('should focus element\'s text node and clean shadow correctly with normalize', () => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("test_focusShadowCaretAndClean_with_normalize");
        const paragraph = document.createElement("p");
        paragraph.innerHTML = 'this is a <span class="shadow-caret">toDelete</span>paragraph.'
        wrapper.append(paragraph);
        document.body.append(wrapper);

        let shadowCaret = paragraph.querySelector('.shadow-caret');

        focusShadowCaretAndClean(shadowCaret);
        paragraph.normalize();

        let selection = getSelection();
        let range = selection.getRangeAt(0);

        expect(range.startContainer === range.endContainer).toBeTrue();
        expect(selection.focusNode.nodeType).toEqual(3);
        expect(range.endContainer).toEqual(paragraph.childNodes[0]);
        expect(range.endOffset).toEqual(10);
    })
});

