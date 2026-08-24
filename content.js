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

const addCustomButton = () => {
    let controls = document.querySelector('.ytp-right-controls');

    if(!controls || document.getElementById('vidnote-btn')) return;
    
    let btn = document.createElement('button');
    btn.id = 'vidnote-btn';
    btn.className = 'ytp-button';
    btn.style.width = 'auto';
    btn.style.padding = '0 10px';
    btn.style.color = 'white';
    btn.style.fontSize = '13px';
    btn.style.fontWeight = 'bold';

    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';

    btn.innerText = '📝 Note'

    btn.addEventListener('click', () =>{
        let vid = document.querySelector('video');
        if (!vid) return;

        vid.pause();

        let time = Math.floor(vid.currentTime);

        let txt = prompt("What do you want to note?");

        if (txt && txt.trim() !== ''){
            let url = new URL(window.location.href);
            let vidId = url.searchParams.get("v");

            chrome.storage.local.get([vidId], (data)=>{
                let notes = data[vidId] || [];
                notes.push({ time: time, text: txt, id: Date.now() });
                notes.sort((a,b) => a.time - b.time);

                chrome.storage.local.set({ [vidId]: notes}, ()=>{
                    vid.play();
                });
            });
        } else {
            vid.play();
        }
    });

    controls.insertBefore(btn, controls.firstChild);
};

setInterval(addCustomButton, 1000);