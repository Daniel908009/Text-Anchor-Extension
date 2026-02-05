const list = document.getElementById("anchorList");
const deleteAllBtn = document.getElementById("deleteAllBtn");

function deleteAllTextAnchors() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            const anchorKey = new URL(activeTab.url).origin + new URL(activeTab.url).pathname;
            chrome.storage.local.remove(anchorKey, () => {
                loadAnchors();
            });
        }
    });
}

deleteAllBtn.addEventListener("click", deleteAllTextAnchors);

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
            let p = document.createElement("p");
            p.textContent = `${index + 1}. ${anchor.text}`;
            li.appendChild(p);
            let showButton = document.createElement("button");
            showButton.classList.add("showButton");
            showButton.textContent = "Show";
            showButton.addEventListener("click", async () => {
                try {
                    await chrome.tabs.sendMessage(activeTab.id, { action: "showTextAnchor", anchor: anchor });
                } catch {
                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId: activeTab.id },
                            files: ["content/content.js"]
                        });
                        await chrome.tabs.sendMessage(activeTab.id, { action: "showTextAnchor", anchor: anchor });
                    } catch (e) {
                        console.error("Failed to inject content script or send message:", e);
                    }
                }
            });
            li.appendChild(showButton);
            let copyButton = document.createElement("button");
            copyButton.classList.add("copyButton");
            copyButton.textContent = "Copy";
            copyButton.addEventListener("click", () => {
                navigator.clipboard.writeText(anchor.text).catch((err) => {
                    console.error("Could not copy text: ", err);
                });
            });
            li.appendChild(copyButton);
            let deleteButton = document.createElement("button");
            deleteButton.classList.add("deleteButton");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", async () => {
                await chrome.storage.local.get(anchorKey, async (res) => {
                    let updatedAnchors = res[anchorKey] ? res[anchorKey] : [];
                    updatedAnchors.splice(index, 1);
                    await chrome.storage.local.set({ [anchorKey]: updatedAnchors });
                });
            });
            li.appendChild(deleteButton);
            list.appendChild(li);
        });
    });
}

chrome.storage.onChanged.addListener((changes, area) => {
    loadAnchors();
});

document.addEventListener("DOMContentLoaded", loadAnchors);