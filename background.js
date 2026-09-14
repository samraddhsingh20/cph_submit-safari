let cphPort = 27121;
let isConnected = false;
let isPolling = false;
let lastPayloadString = null;

chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {});

function pollCPH() {
    chrome.storage.local.get(['cphPort'], async (result) => {
        cphPort = result.cphPort || 27121;
        
        try {
            const response = await fetch(`http://127.0.0.1:${cphPort}/getSubmit`, {
                method: 'GET',
                cache: 'no-store'
            });

            if (response.ok) {
                if (!isConnected) {
                    isConnected = true;
                    broadcastStatus();
                }

                const text = await response.text();
                
                if (text && text.trim() !== "") {
                    if (lastPayloadString === null) {
                        lastPayloadString = text;
                    }
                    else if (text !== lastPayloadString) {
                        lastPayloadString = text;
                        
                        try {
                            const data = JSON.parse(text);
                            if (data && data.url && !data.empty) {
                                handleUniversalRouting(data);
                            }
                        } catch (e) {
                            console.error("[CPH] Failed to parse payload");
                        }
                    }
                }
            } else {
                if (isConnected) {
                    isConnected = false;
                    broadcastStatus();
                }
            }
        } catch (err) {
            if (isConnected) {
                isConnected = false;
                broadcastStatus();
            }
        } finally {
            setTimeout(pollCPH, 150); // Fast 150ms heartbeat
        }
    });
}

function startPolling() {
    if (isPolling) return;
    isPolling = true;
    pollCPH();
}

function broadcastStatus() {
    chrome.runtime.sendMessage({
        type: 'status_update',
        status: isConnected ? 'connected' : 'disconnected',
        port: cphPort
    }).catch(() => {});
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'get_status') {
        sendResponse({ status: isConnected ? 'connected' : 'disconnected', port: cphPort });
    }
    if (msg.type === 'update_port') {
        chrome.storage.local.set({ cphPort: msg.port }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    // Virtual Participation Interceptor
    if (msg.type === 'cf_virtual_fallback') {
        const data = msg.payload;
        const contestMatch = data.url.match(/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/);
        if (contestMatch) {
            const fallbackUrl = 'https://codeforces.com/problemset/submit';
            data.problemCode = `${contestMatch[1]}${contestMatch[2]}`; // Converts 1120 and E into "1120E"
            data.submitUrl = fallbackUrl;
            
            chrome.tabs.update(sender.tab.id, { url: fallbackUrl }, (tab) => {
                injectWhenReady(tab.id, data);
            });
        }
        return true;
    }

    // Auto-Reset Circuit. If injection fails, wipe the memory so the user can retry.
    if (msg.type === 'cph_injection_failed') {
        lastPayloadString = null;
        return true;
    }
});

function handleUniversalRouting(data) {
    let targetUrl = data.url;
    let problemCode = "";

    // DYNAMIC URL NORMALIZATION
    if (targetUrl.includes("codeforces.com")) {
        const contestMatch = targetUrl.match(/(contest|gym)\/(\d+)\/problem\/([A-Za-z0-9]+)/);
        if (contestMatch) {
            targetUrl = `https://codeforces.com/${contestMatch[1]}/${contestMatch[2]}/submit`;
            problemCode = contestMatch[3];
        } else {
            const psMatch = targetUrl.match(/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/);
            if (psMatch) {
                targetUrl = `https://codeforces.com/problemset/submit`;
                problemCode = `${psMatch[1]}${psMatch[2]}`;
            }
        }
    } else if (targetUrl.includes("cses.fi")) {
        // Regex dynamically captures the task ID and guarantees a trailing slash
        targetUrl = targetUrl.replace(/\/task\/([A-Za-z0-9_]+)\/?/, '/submit/$1/');
    }

    data.submitUrl = targetUrl;
    data.problemCode = problemCode;

    // UNCONDITIONAL NEW TAB
    chrome.tabs.create({ url: targetUrl, active: true }, (tab) => {
        injectWhenReady(tab.id, data);
    });
}

function injectWhenReady(tabId, data) {
    const listener = (tId, info) => {
        if (tId === tabId && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.tabs.sendMessage(tabId, { type: 'do_cph_submit', payload: data }).catch(() => {});
        }
    };
    chrome.tabs.onUpdated.addListener(listener);
}

startPolling();
