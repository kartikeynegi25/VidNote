chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    let vid = document.querySelector('video');

    if (msg.action === "get_time"){
        if (vid){
            sendResponse({ time: Math.floor(vid.currentTime) });
        } else {
            sendResponse({ time: null});
        }
    }
    else if (msg.action === "jump_to_time"){
        if (vid){
            vid.currentTime = msg.time;
        }

        sendResponse({ success: true});
    }

});