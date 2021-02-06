document.addEventListener('DOMContentLoaded', function() {
    var video = null;
    chrome.storage.local.get(['video'], function(result) {
        // console.log(result.video);
        video = result.video;
        console.log(video);

        if (video != null) {
            document.getElementById("textContent").innerText = "Title: " + video.title;
            document.getElementById("modal-button").innerHTML = "<button id=\"download\">Download Now</button>";
            document.getElementById("download").addEventListener('click', onDownload, false);
        }

    });

    function onDownload() {
        var options = {
            url: video.source,
            filename: video.title + ".mp4",
            saveAs: true
        }
        chrome.downloads.download(options);
        chrome.storage.local.remove('video');
    }
    // chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
    //     const video = request.video;
    //     document.getElementById("textContent").innerHTML = "BbC recording found!";
    //     console.log("Actually found the video");
    //     console.log(video);
    // });
    // document.getElementById("text").innerHTML = "BbC recording found!";
    // document.getElementById("modal-button").innerHTML = "<button id=\"download\">Download</button>";

    // document.getElementById("download").addEventListener('click', onclick, false);

    // function onclick() {
    //     var video = document.getElementById("playback-video-playback-video_html5_api");
    //     alert(video.src);
    //     // chrome.tabs.query({currentWindow: true, active: true},
    //     // function(tabs) {
    //     //     chrome.tabs.sendMessage(tabs[0].id, 'match');
    //     // })
    // }
});