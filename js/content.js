// const videoRec = document.getElementById("playback-video-playback-video_html5_api");
// chrome.runtime.sendMessage({
//     video: videoRec
// });
// console.log(video);
console.log("The content script works as it should");

var videoSelector = "playback-video-playback-video_html5_api";
var observer = new MutationObserver(function(mutations) {
    // console.log(mutations);
    mutations.forEach((mutation) => {
        for(var i=0; i<mutation.addedNodes.length; i++) {
            if(mutation.addedNodes[i].id == videoSelector) {
                console.log("Video found!");
                observer.disconnect();
                const videoRec = document.getElementById("playback-video-playback-video_html5_api");
                // chrome.runtime.sendMessage({
                //     video: videoRec
                // });
                console.log(videoRec);
            }
        }
    });
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});