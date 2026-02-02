const list = document.getElementById("anchorList");
const deleteAllBtn = document.getElementById("deleteAllBtn");

function deleteAllTextAnchors() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            const anchorKey = new URL(activeTab.url).origin + new URL(activeTab.url).pathname;
            chrome.storage.local.remove(anchorKey, () => {
                console.log("All text anchors deleted for", anchorKey);
                loadAnchors();
            });
        }
    });
}

deleteAllBtn.addEventListener("click", deleteAllTextAnchors);

function shortenedText(text) {
    return text.length > 30 ? text.substring(0, 27) + "..." : text;
}

async function loadAnchors() {
    let anchorKey;
    let activeTab = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab.length > 0) {
        activeTab = activeTab[0];
        anchorKey = new URL(activeTab.url).origin + new URL(activeTab.url).pathname;
    } else {
        return;
    }
    chrome.storage.local.get(anchorKey, (result) => {
        let anchors = result[anchorKey] ? { textAnchors: result[anchorKey] } : { textAnchors: [] };
        list.innerHTML = "";
        anchors.textAnchors.forEach((anchor, index) => {
            const li = document.createElement("li");
            li.textContent = `Anchor ${index + 1}: ${shortenedText(anchor.text)}`;
            let button = document.createElement("button");
            button.textContent = "Show";
            button.addEventListener("click", () => {
                chrome.tabs.sendMessage(activeTab.id, { action: "showTextAnchor", anchor: anchor });
            });
            li.appendChild(button);
            list.appendChild(li);
        });
    });
}

chrome.storage.onChanged.addListener((changes, area) => {
    let anchorKey;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            anchorKey = new URL(activeTab.url).origin + new URL(activeTab.url).pathname;
        }
    });
    if (area === "local" && changes[anchorKey]) {
        loadAnchors();
    }
});

document.addEventListener("DOMContentLoaded", loadAnchors);