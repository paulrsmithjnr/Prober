// const videoRec = document.getElementById("playback-video-playback-video_html5_api");
// chrome.runtime.sendMessage({
//     video: videoRec
// });
// console.log(video);
console.log("The content script works as it should");

var videoSelector = "playback-video-playback-video_html5_api";
var videoRec = null;
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

                // var downloadDiv = document.createElement("div");
                // var downloadButton = document.createElement("a");
                // var downloadIcon = document.createElement("IMG");

                // downloadIcon.src = "https://snz04pap002files.storage.live.com/y4mA09MOtZ1jC_w6DfYoPD1BxqweB623J391gxc_f0CYXigLOcySvHjTBctnf_znS_spsGu83kg4Qk9FCu3eWseHIjYT2s8AoqNxfApNHyTw5Us8zalcCCXX-1ayWkCMKdNdUKG1H6rNwYpKWtKNUrYZQhVBf6mqsotqOHPp8x0mhOrvzG2SdRGiTQA3i6M-KKQ?width=128&height=128&cropmode=none";
                // downloadButton.classList.add("playback-controls__button", "button", "has-tooltip", "recording-controls");
                // downloadButton.href = videoRec.src;
                // downloadButton.download = "test.mp4";
                // downloadIcon.classList.add("playback-controls__button", "button", "has-tooltip", "recording-controls");

                // downloadButton.appendChild(downloadIcon);
                // // downloadButton.addEventListener("click", function(e) {
                // //     chrome.downloads.download({
                // //         url: videoRec.src
                // //     });
                // // });
                // downloadDiv.appendChild(downloadButton);

                // // var downloadIcon = document.createElement("IMG");
                // // downloadIcon.src = "https://snz04pap002files.storage.live.com/y4mA09MOtZ1jC_w6DfYoPD1BxqweB623J391gxc_f0CYXigLOcySvHjTBctnf_znS_spsGu83kg4Qk9FCu3eWseHIjYT2s8AoqNxfApNHyTw5Us8zalcCCXX-1ayWkCMKdNdUKG1H6rNwYpKWtKNUrYZQhVBf6mqsotqOHPp8x0mhOrvzG2SdRGiTQA3i6M-KKQ?width=128&height=128&cropmode=none";

                // // var newItem = document.createElement("LI");       // Create a <li> node
                // // var textnode = document.createTextNode("Water");  // Create a text node
                // // newItem.appendChild(textnode);
                
                // var fs = document.getElementsByClassName("fullscreen-toggle ng-scope")[0];
                // mutation.target.insertBefore(downloadDiv, fs);

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