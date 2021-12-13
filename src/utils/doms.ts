export function getCurrentInputBox(node: Node): HTMLElement {
    if (node instanceof HTMLElement) {
        let ele: HTMLElement = node;
        if (ele.contentEditable) {
            return ele;
        }
        return getCurrentInputBox(ele.parentElement);
    }
    return getCurrentInputBox(node.parentElement);
}
// refer to https://stackoverflow.com/a/4812022/4021637
export function getSelectionCharacterOffsetWithin(element: Element) {
    let start = 0;
    let end = 0;
    let doc = element.ownerDocument;
    let win = doc.defaultView;
    let sel = win.getSelection();
    if (sel.rangeCount > 0) {
            let range = win.getSelection().getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            start = preCaretRange.toString().length;
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            end = preCaretRange.toString().length;
        }
    return { start: start, end: end };
}

// refer to https://stackoverflow.com/a/41034697/4021637
export function createNodeRange(node: Node, chars: {count: number}, range: Range) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
            for (let lp = 0; lp < node.childNodes.length; lp++) {
                range = createNodeRange(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                    break;
                }
            }
        }
    }
    return range;
}
