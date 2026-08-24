const formatTime = (secs) => {
    let m = Math.floor(secs / 60);
    let s = Math.floor(secs % 60);
    if (s < 10) s = '0' + s;
    return m + ":" + s;

};

document.addEventListener('DOMContentLoaded', ()=> {
    let btn = document.getElementById('add-btn');
    let input = document.getElementById('note-input');
    let list = document.getElementById('notes-list');

    const sendMsg = async (tabId, msg) =>{
        try {
            return await chrome.tabs.sendMessage(tabId, msg);
        } catch (err) {
            console.log("Message failed (page might need refresh):", err);
            return null;
        } 
    };
 
    const loadNotes = (vidId) => {
        chrome.storage.local.get([vidId], (data) => {
            let notes = data[vidId] || [];
            list.innerHTML = '';

            if (notes.length === 0){
                list.innerHTML = '<li style="color: gray; font-size: 12px;">No notes yet bro.</li>';
                return;
            }

            notes.forEach(n=>{
                let li = document.createElement('li');
                li.className = 'note';

                let leftSide = document.createElement('div');

                let timeEl = document.createElement('span');
                timeEl.className = 'time-link';
                timeEl.innerText = `[${formatTime(n.time)}]`;

                timeEl.addEventListener('click', async () => {
                    let tabs = await chrome.tabs.query({active: true, currentWindow: true});
                    await sendMsg(tabs[0].id, {action: "jump_to_time", time: n.time});
                });

                let textEl = document.createElement('span');
                textEl.innerText = n.text;

                leftSide.appendChild(timeEl);
                leftSide.appendChild(textEl);

                let xBtn = document.createElement('button');
                xBtn.className = 'del-btn';
                xBtn.innerText = '❌';

                xBtn.addEventListener('click', () =>{
                    let newNotes = notes.filter(item=> item.id !== n.id);
                    chrome.storage.local.set({ [vidId]: newNotes}, () =>{
                        loadNotes(vidId);
                    });
                });

                li.appendChild(leftSide);
                li.appendChild(xBtn);
                list.appendChild(li);
            });
        });
    };  

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) =>{
        let tab = tabs[0];
        
        if (tab.url.includes("youtube.com/watch")) {
            let url = new URL(tab.url);
            loadNotes(url.searchParams.get("v"));
        } else {
            list.innerHTML = '<li style="color: gray; font-size: 12px;">Touch some grass bro. It\'s not a YouTube video page.</li>';
        }
    });

    const saveIt = async () =>{
        let txt = input.value.trim();
        if (!txt) return;

        let tabs = await chrome.tabs.query({active: true, currentWindow: true});

        let tab = tabs[0];
            if (!tab.url.includes("youtube.com/watch")) return;

            let url = new URL(tab.url);
            let vidId = url.searchParams.get("v");

            let res = await sendMsg(tab.id, {action: "get_time"});

            if (!res || res.time === null){
                alert("yo, refresh the yt page real quick.");
                return;
            }

                chrome.storage.local.get([vidId], (data)=>{
                    let notes = data[vidId] || [];
                    notes.push({time: res.time, text: txt, id: Date.now()});
                    notes.sort((a,b) => a.time - b.time);

                    chrome.storage.local.set({ [vidId]: notes}, () =>{
                        input.value = '';
                        loadNotes(vidId);
                    });
                });
    };

    btn.addEventListener('click', saveIt);

    input.addEventListener('keypress', (e)=>{
        if (e.key === 'Enter'){
            saveIt();
        }
    });
});