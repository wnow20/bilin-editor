function createShadowCaretSpan() {
    const shadowCaret = document.createElement('span');
    shadowCaret.classList.add('shadow-caret');
    return shadowCaret;
}

export function createShadowCaret() {
    let selection = getSelection();
    let rangeAt = selection.getRangeAt(0);
    const shadowCaret = createShadowCaretSpan();
    if (selection.type !== 'Caret') {
        return;
    }
    if (rangeAt.endContainer instanceof Text) {
        const newTextNode = rangeAt.endContainer.splitText(rangeAt.endOffset);
        rangeAt.endContainer.parentElement.insertBefore(shadowCaret, newTextNode);
    }
    if (rangeAt.endContainer instanceof HTMLElement) {
        let childNode = selection.focusNode.childNodes[selection.focusOffset];
        if (childNode instanceof Element) {
            childNode.insertAdjacentElement("afterbegin", shadowCaret)
        }
        if (childNode instanceof Text) {
            selection.focusNode.insertBefore(shadowCaret, childNode);
        }

    }
    return shadowCaret;
}

export function focusShadowCaretAndClean(shadowCaret: Element | null) {
    if (!shadowCaret) {
        return;
    }
    const selection = getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    // range.selectNode(shadowCaret);
    range.selectNode(shadowCaret);
    selection.addRange(range);

    // 从文档树摘除
    // remove contents from the document tree
    range.extractContents();
}
