import {
    createFragment,
    focusCharacterOffset,
    getCurrentBlockId,
    getSelectionCharacterOffsetWithin
} from "../utils/doms";

describe('DOM Utils Tests', () => {
    it('should getCurrentBlockId correctly', () => {
        let wrapper = document.createElement('div');
        wrapper.classList.add('bl-blocks')
        let block = document.createElement('div');
        block.classList.add('bl-block')
        block.dataset.id = 'test_block_id';
        wrapper.append(block);
        let paragraph = document.createElement('p');
        let firstText = 'this is paragraph ';
        paragraph.innerHTML = firstText + '<b>block</b> for test DOM utils';
        block.append(paragraph);

        document.body.append(wrapper);

        focusCharacterOffset(paragraph, firstText.length + 1);

        let currentBlockId = getCurrentBlockId();

        expect(currentBlockId).toEqual('test_block_id');
    })

    it('should focusCharacterOffset correctly', () => {
        const domString = '<div class="bl-blocks" id="test_focusCharacterOffset">\
                <div class="bl-block">\
                    <div class="bl-paragraph">this is paragraph <b>block</b> for test focusCharacterOffset</div>\
                </div>\
            </div>';
        document.body.append(createFragment(domString));
        let wrapper = document.querySelector('#test_focusCharacterOffset');
        let testText = 'this is paragraph b';
        focusCharacterOffset(wrapper.querySelector('.bl-paragraph'), testText.length);

        let selection = getSelection();
        expect(selection.focusNode.nodeType).toEqual(3);
        expect(selection.focusOffset).toEqual(1);
        expect(selection.focusNode).toEqual(wrapper.querySelector('b').firstChild);
    })
})