chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "add-text-anchor") {
        let text = window.getSelection().toString().trim();
        let range = null;
        if (text) {
            range = window.getSelection().getRangeAt(0);
        }else {
            displayMessage("Please select some text to create an anchor.");
            return;
        }
        displayMessage("Text anchor added.");
        try {
            let startPath = getXPath(range.startContainer);
            let endPath = getXPath(range.endContainer);
            const anchorKey = window.location.origin + window.location.pathname;
            let anchors = await chrome.storage.local.get(`${anchorKey}`);
            anchors = anchors[anchorKey] ? { textAnchors: anchors[anchorKey] } : { textAnchors: [] };
            anchors.textAnchors.push({ text: text, startXpath: startPath, endXpath: endPath, range: { startOffset: range.startOffset, endOffset: range.endOffset } });
            await chrome.storage.local.set({ [anchorKey]: anchors.textAnchors });
        } catch (e) {
            displayMessage("Error saving text anchor: " + e.message);
        }
    }
    else if (message.action === "showTextAnchor") {
        let anchor = message.anchor;
        try {
            let startElement = document.evaluate(anchor.startXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            let endElement = document.evaluate(anchor.endXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (startElement && endElement) {
                let range = document.createRange();
                range.setStart(startElement, anchor.range.startOffset);
                range.setEnd(endElement, anchor.range.endOffset);
                let selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                let text = selection.toString();
                if (text !== anchor.text) {
                    displayMessage("The text anchor could not be accurately located (text mismatch).");
                    return;
                }
                let rect = range.getBoundingClientRect();
                window.scrollTo({ top: rect.top + window.scrollY - window.innerHeight / 2, behavior: 'smooth' });
                displayMessage("Text anchor located and highlighted.");   
            } else {
                displayMessage("Failed to locate the text anchor on this page.");
            }
        } catch (e) {
            displayMessage("Error locating text anchor: " + e.message);
        }
    }
});

function getXPath(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        let index = 1;
        let sibling = node.previousSibling;

        while (sibling) {
            if (sibling.nodeType === Node.TEXT_NODE) {
                index++;
            }
            sibling = sibling.previousSibling;
        }

        return getXPath(node.parentNode) + `/text()[${index}]`;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = node.previousSibling;

        while (sibling) {
            if (
                sibling.nodeType === Node.ELEMENT_NODE &&
                sibling.nodeName === node.nodeName
            ) {
                index++;
            }
            sibling = sibling.previousSibling;
        }

        return getXPath(node.parentNode) + `/${node.nodeName.toLowerCase()}[${index}]`;
    }

    return "";
}

let currentMessage = null;
function displayMessage(msg) {
    let toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.left = "10px";
    toast.style.padding = "10px";
    toast.style.backgroundColor = "rgba(0, 0, 0, 1)";
    toast.style.color = "white";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = "10000";
    if (currentMessage) {
        try {
            document.body.removeChild(currentMessage);
        } catch (e) {}
    }
    document.body.appendChild(toast);
    currentMessage = toast;
    setTimeout(() => {
        try {
            document.body.removeChild(toast);
        } catch (e) {}
    }, 3000);
}