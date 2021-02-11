// const videoRec = document.getElementById("playback-video-playback-video_html5_api");
// chrome.runtime.sendMessage({
//     video: videoRec
// });
// console.log(video);
console.log("The content script works as it should");

var videoSelector = "playback-video-playback-video_html5_api";
var videoRec = document.getElementById(videoSelector);
console.log("Found one");

if (videoRec === null || videoRec === undefined) {
    var observer = new MutationObserver(function(mutations) {
        // console.log(mutations);
        var foundFlag = false;
        mutations.forEach((mutation) => {
            for(var i=0; i<mutation.addedNodes.length; i++) {
                if(mutation.addedNodes[i].id == videoSelector) {
                    // console.log("Video found!");
                    // console.log(mutation);
                    // observer.disconnect();
                    videoRec = document.getElementById(videoSelector);
                    // var source = document.getElementById(videoSelector).src;
                    // var controls = document.getElementsByClassName("playback-controls");
                    // console.log(controls);
                    // buttonDivElement = menubarElement.insertBefore(createSpeedControlButton(), menubarElement.querySelector(".fullscreen-toggle"));
                    // chrome.runtime.sendMessage({
                    //     video: videoRec
                    // });
                    console.log("Found: ", videoRec);
                    // console.log("Here: ", mutation.target.childNodes[0].src);
    
                }
                if(mutation.target.classList.contains("playback-controls") && !foundFlag) {
                    console.log("Found playback controls mutation");
                    // console.log(mutation.target);
                    foundFlag = true;
    
                    var title = document.getElementsByTagName("title")[0].innerText;
                    title = title.replace(/[:"?~<>*|]/g, '_');
                    var source = videoRec.src;
    
                    //storing the video found
                    chrome.storage.local.set({ 
                        'video': {
                            'title': title,
                            'source': source,
                            'downloaded': false
                        }
                    }, function() {
                        console.log("Video found and successfully stored for download!");
                    });
    
                    observer.disconnect();
                    break;
                }
            }
        });
    });
    
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
} else {
    var title = document.getElementsByTagName("title")[0].innerText;
    title = title.replace(/[:"?~<>*|]/g, '_');
    var source = videoRec.src;

    //storing the video found
    chrome.storage.local.set({ 
        'video': {
            'title': title,
            'source': source,
            'downloaded': false
        }
    }, function() {
        console.log("Video found and successfully stored for download!");
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
    const pip = request.pip;
    console.log("PiP  ", request);
    if(pip) {
        if(document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(err => {
                console.log(err);
            });
            return;
        }
        document.getElementById(videoSelector).requestPictureInPicture().catch(err => {
            console.log(err);
        });
        console.log("PIP Request Sent");
    }
});