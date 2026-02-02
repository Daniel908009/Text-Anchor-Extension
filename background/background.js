chrome.commands.onCommand.addListener(async (command) => {
    if (command === "add-text-anchor"){
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id && (tab.url.startsWith("http") || tab.url.startsWith("https"))) {
            try {
                await chrome.tabs.sendMessage(tab.id, { action: "add-text-anchor" });
            } catch (e) {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["content/content.js"]
                });
                try {
                    await chrome.tabs.sendMessage(tab.id, { action: "add-text-anchor" });
                } catch (e) {
                    console.error("Failed to inject content script or send message:", e);
                }
            }
        }
    }
});