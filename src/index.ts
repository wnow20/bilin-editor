import BilinEditor from "./core/BilinEditor";

const bilinEditor = new BilinEditor({
    blocks: [{
        type: 'paragraph',
        text: '123',
    }],
    version: 'v0',
    timestamp: (new Date()).getTime(),
}, {
    holder: '#editor',
});

let element = document.querySelector('#btn');
element.addEventListener('click', function () {
    let editorState = bilinEditor.getState();
    console.log(editorState);
})
