document.addEventListener('DOMContentLoaded', function() {
    var video = null;
    // chrome.storage.local.remove('videos');
    // chrome.storage.local.remove('video');
    chrome.storage.local.get(['video'], function(result) {
        // console.log(result.video);
        video = result.video;
        if(!isEmptyObject(result)) {
            addVideo();
        }

        getVideos();
        // console.log(video);

        // if (video != null) {
        //     document.getElementById("textContent").innerText = "Title: " + video.title;
        //     document.getElementById("modal-button").innerHTML = "<button id=\"download\">Download Now</button>";
        //     document.getElementById("download").addEventListener('click', onDownload, false);
        // }

    });

    function isEmptyObject(object) {
        return Object.keys(object).length === 0 && object.constructor === Object;
    }

    function addVideo() {
        chrome.storage.local.get(['videos'], function(result) {
            // console.log(Object.keys(result).length);
            // console.log(result.constructor);
            // console.log(Object.keys(result).length === 0 && result.constructor === Object);

            if (isEmptyObject(result)) {
                createVideosObject();
            } else {
                console.log("Videos:", result.videos);
                var videos = result.videos;
                var currentVideosArray = Object.entries(videos);

                console.log("Length: ", currentVideosArray.length);
                console.log("Entries: ", currentVideosArray);

                for (var i = 0; i < currentVideosArray.length; i++) {

                    var vidTitle = currentVideosArray[i][1].title
                    if (vidTitle.localeCompare(video.title) === 0) {
                        console.log("Video already saved");
                        return;
                    }

                }
                
                var length = Object.entries(videos).length;
                video['id'] = length;
                videos[length] = video;
                chrome.storage.local.set({ 
                    'videos': videos
                }, function() {
                    console.log("Videos object successfully updated and stored to local storage!");
                });
                getVideos();
            }
        });
    }

    function createVideosObject() {
        var videos = new Object();
        video['id'] = 0;
        videos[0] = video;
        chrome.storage.local.set({ 
            'videos': videos
        }, function() {
            console.log("Videos object successfully created and stored to local storage!");
        });
    }

    function getVideos() {
        chrome.storage.local.get(['videos'], function(result) {
            // console.log(isEmptyObject(result));
            // console.log(result);
            if(!isEmptyObject(result)) {
                videos = Object.entries(result.videos);
                var innerhtml = "";
                for(var i = videos.length - 1; i >= 0; i--) {
                    innerhtml = innerhtml + "<div class=\"download-item\">" +
                                                "<div class=\"download-itemTitle\">" + videos[i][1].title + "</div>" +
                                                "<div class=\"download-itemBtns\"><button id=\"downloadBtn-"+i+"\" class=\"btn btn-success\">Download</button> <button id=\"removeBtn-"+i+"\" class=\"btn btn-danger\">Remove</button></div>" +
                                            "</div>";
                }
                document.getElementById("contentDiv").innerHTML = innerhtml;
                addClickListeners(videos.length);
            // console.log("Get videos: ", currentVideosArray);
            // return currentVideosArray;
            } else {
                document.getElementById("contentDiv").innerText = "No recordings to download.";
            }
        });
        // console.log("Get videos: ", currentVideosArray);
        // return currentVideosArray;
    }

    // function onDownload(id) {
    //     chrome.storage.local.get(['videos'], function(result) {
    //         // console.log(isEmptyObject(result));
    //         // console.log(result);
    //         if(!isEmptyObject(result)) {
    //             videos = result.videos;
    //             var download = videos[id];
    //             var options = {
    //                 url: download.source,
    //                 filename: download.title + ".mp4",
    //                 saveAs: true
    //             }
    //             chrome.downloads.download(options);

    //             // updateDownload(download);
    //         }
    //     });
        
        // chrome.storage.local.remove('video');
    // }

    function addClickListeners(num) {
        for(var j = 0; j < num; j++) {
            var downloadID = "downloadBtn-" + j
            console.log(document.getElementById(downloadID));
            document.getElementById(downloadID).addEventListener("click", function() {
                j--;
                chrome.storage.local.get(['videos'], function(result) {
                    // console.log(isEmptyObject(result));
                    // console.log(result);
                    if(!isEmptyObject(result)) {
                        videos = result.videos;
                        var download = videos[j];
                        console.log("i", j);
                        console.log("download", download);
                        var options = {
                            url: download.source,
                            filename: download.title + ".mp4",
                            saveAs: true
                        }
                        chrome.downloads.download(options);
        
                        // updateDownload(download);
                    }
                });
            });
        }
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