chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "add-text-anchor") {
        let text = window.getSelection().toString().trim();
        let range = null;
        if (text) {
            range = window.getSelection().getRangeAt(0);
            //console.log("Selected range:", range);
            if (range.startContainer !== range.endContainer) {
                alert("Please select text within a single element."); // later I should replace this with a content popup message
                return;
            }
        }else {
            alert("Please select some text to create an anchor.");
            return;
        }
        let xpath = getXPathForElement(range.startContainer);
        //console.log("Adding text anchor:", text, xpath, range);
        const anchorKey = window.location.origin + window.location.pathname;
        let anchors = await chrome.storage.local.get(`${anchorKey}`);
        anchors = anchors[anchorKey] ? { textAnchors: anchors[anchorKey] } : { textAnchors: [] };
        anchors.textAnchors.push({ text: text, xpath: xpath , range: range});
        await chrome.storage.local.set({ [anchorKey]: anchors.textAnchors });
    }
    else if (message.action === "showTextAnchor") {
        console.log("text anchor")
    }
});

function getXPathForElement(element) {
    let parts = [];
    if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentNode;
    }
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = element.previousSibling;
        while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
                index++;
            }
            sibling = sibling.previousSibling;
        }
        let tagName = element.nodeName.toLowerCase();
        let part = tagName + (index > 1 ? `[${index}]` : '');
        parts.unshift(part);
        element = element.parentNode;
    }
    return '/' + parts.join('/');
}