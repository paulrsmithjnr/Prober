//TODO: Work on PiP functionality. Can maybe send a message from popup script to 
//content script with a boolean value or some other way of requesting pip.
document.addEventListener('DOMContentLoaded', function() {
    var video = null;
    var timerId = null;
    var timerCount = 0;
    // chrome.storage.local.remove('videos');
    // chrome.storage.local.remove('video');
    document.getElementById("pip").onclick = onPiP;
    var downloadsTab = document.getElementById("downloads");
    var firstLoad = true;
    downloadsTab.classList.add("active");
    downloadsTab.onclick = onDownloads;

    onDownloads();


    function onDownloads() {
        if (downloadsTab.classList.contains("active") && !firstLoad) {
            return;
        } else {
            firstLoad = false;
            var contentDiv = document.createElement("div");
            contentDiv.id = "contentDiv";
            var pipDiv = document.getElementById("pipDiv");
            if (pipDiv != null || pipDiv != undefined) {
                pipDiv.remove();
            }
            document.getElementsByClassName("mymodal-content")[0].appendChild(contentDiv);
            document.getElementById("downloads").classList.add("active");
            document.getElementById("pip").classList.remove("active");
            chrome.storage.local.get(['video'], function(result) {
                // console.log(result.video);
                video = result.video;
                if(!isEmptyObject(result)) {
                    addVideo();
                }
        
                timerId = setInterval(getVideos, 500);
        
            });
        }
    }

    function onPiP() {
        document.getElementById("contentDiv").remove();
        document.getElementById("downloads").classList.remove("active");
        document.getElementById("pip").classList.add("active");
        var pipDiv = document.createElement("div");
        pipDiv.id = "pipDiv";

        var pipBtn = document.createElement("button");
        pipBtn.classList.add("btn", "btn-primary");
        pipBtn.innerText = "Enter Picture-in-Picture Mode";

        pipBtn.addEventListener("click", function(e) {
            chrome.runtime.sendMessage({
                "pip": true
            });
            e.target.innerText = "Leave Picture-in-Picture Mode";
        });

        pipDiv.appendChild(pipBtn);

        document.getElementsByClassName("mymodal-content")[0].appendChild(pipDiv);



    }

    function isEmptyObject(object) {
        return (Object.keys(object).length === 0 && object.constructor === Object) || (object === null);
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
        timerCount++;
        if (timerCount > 2) {
            clearInterval(timerId);
        }
        chrome.storage.local.get(['videos'], function(result) {
            // console.log(isEmptyObject(result));
            // console.log(result);
            if(!isEmptyObject(result)) {
                videos = Object.entries(result.videos);
                videoObjects = result.videos;

                var contentDiv = document.getElementById("contentDiv");
                if(videos.length === 0) {
                    contentDiv.innerHTML = "No recordings to download.";
                } else {
                    contentDiv.innerHTML = "";
                }
                
                for(var i = videos.length - 1; i >= 0; i--) {
                    // innerhtml = innerhtml + "<div class=\"download-item\">" +
                    //                             "<div class=\"download-itemTitle\">" + videos[i][1].title + "</div>" +
                    //                             "<div class=\"download-itemBtns\"><button id=\"downloadBtn-"+i+"\" class=\"btn btn-success\">Download</button> <button id=\"removeBtn-"+i+"\" class=\"btn btn-danger\">Remove</button></div>" +
                    //                         "</div>";


                    console.log(videos[i][1].downloaded);
                    
                    var downloadItemTitle = document.createElement("div");
                    var downloadBtn = document.createElement("button");
                    if(videos[i][1].downloaded) {
                        downloadItemTitle.classList.add("download-itemTitle");
                        downloadBtn.classList.add("btn", "btn-primary");
                        downloadBtn.innerText = "Download Again";
                    } else {
                        downloadItemTitle.classList.add("download-itemTitle", "bold");
                        downloadBtn.classList.add("btn", "btn-success");
                        downloadBtn.innerText = "Download";
                    }
                    downloadItemTitle.innerText = videos[i][1].title;

                    var downloadItem = document.createElement("div");
                    downloadItem.classList.add("download-item");

                    // var downloadItemTitle = document.createElement("div");
                    // downloadItemTitle.classList.add("download-itemTitle");
                    // downloadItemTitle.innerText = videos[i][1].title;

                    var downloadItemBtns = document.createElement("div");
                    downloadItemBtns.classList.add("download-itemBtns");
                    
                    // var downloadBtn = document.createElement("button");
                    downloadBtn.id = "downloadBtn" + i;
                    // downloadBtn.classList.add("btn", "btn-success");
                    // downloadBtn.innerText = "Download";

                    downloadBtn.addEventListener("click", function(e) {
                        // console.log("index", index);
                        // console.log(isEmptyObject(result));
                        // console.log(result);
                        // console.log("Here: ", e.target.id);
                        var downloadButtonID = e.target.id;
                        var index = parseInt(downloadButtonID[downloadButtonID.length - 1]);
                        // console.log("Download videos: ", videoObjects);
                        var download = videoObjects[index];//video to download
                        // console.log("download", download);
                        // console.log("Before download: ", download);
                        var options = {
                            url: download.source,
                            filename: download.title + ".mp4",
                            saveAs: true
                        }
                        chrome.downloads.download(options);

                        download['downloaded'] = true; //change status to already downloaded
                        videoObjects[index] = download; //reassigns that video in storage in order to update it
                        
                        // console.log("After download: ", download);

                        //updates videos in storage
                        chrome.storage.local.set({ 
                            'videos': videoObjects
                        }, function() {
                            console.log("Videos object successfully updated and stored to local storage!");
                        });                                
                    });

                    var removeBtn = document.createElement("button");
                    removeBtn.id = "removeBtn" + i;
                    removeBtn.classList.add("btn", "btn-danger");
                    removeBtn.innerText = "Remove";

                    removeBtn.addEventListener("click", function(e) {
                        // console.log("index", index);
                        // console.log(isEmptyObject(result));
                        // console.log(result);
                        // console.log("Here: ", e.target.id);
                        var removeButtonID = e.target.id;
                        var index = parseInt(removeButtonID[removeButtonID.length - 1]);
                        // console.log("Download videos: ", videoObjects);
                        var remove = videoObjects[index];//video to download

                        var found = false;
                        var newVideosObject = new Object();
                        if (videos.length !== 1) {
                            for(var j = 0; j < videos.length-1; j++) {
                                if(j===index) {
                                    found = true;
                                }
    
                                if(found) {
                                    newVideosObject[j] = videoObjects[j+1];
                                } else {
                                    newVideosObject[j] = videoObjects[j];
                                }
                            }
                        } else {
                            chrome.storage.local.remove('videos');
                        }

                        chrome.storage.local.remove('video');
                        
                        //updates videos in storage
                        chrome.storage.local.set({ 
                            'videos': newVideosObject
                        }, function() {
                            console.log("Videos object successfully updated and stored to local storage!");
                            getVideos();
                        });                                
                    });

                    downloadItemBtns.appendChild(downloadBtn);
                    downloadItemBtns.appendChild(removeBtn);
                    
                    downloadItem.appendChild(downloadItemTitle);
                    downloadItem.appendChild(downloadItemBtns);

                    contentDiv.appendChild(downloadItem);
                }
                // document.getElementById("contentDiv").innerHTML = innerhtml;
                // addClickListeners(videos.length);
            // console.log("Get videos: ", currentVideosArray);
            // return currentVideosArray;
            } else {
                document.getElementById("contentDiv").innerText = "No recordings to download.";
            }
        });
        // console.log("Get videos: ", currentVideosArray);
        // return currentVideosArray;
    }

    function onDownload(id) {
        chrome.storage.local.get(['videos'], function(result) {
            // console.log(isEmptyObject(result));
            // console.log(result);
            if(!isEmptyObject(result)) {
                videos = result.videos;
                var download = videos[id];
                var options = {
                    url: download.source,
                    filename: download.title + ".mp4",
                    saveAs: true
                }
                chrome.downloads.download(options);

                // updateDownload(download);
            }
        });
        
        // chrome.storage.local.remove('video');
    }

    function addClickListeners(num) {
        //adding a listerner to each download button
        for(var j = 0; j < num; j++) {
            var downloadID = "downloadBtn-" + j
            // console.log(document.getElementById(downloadID));
            document.getElementById(downloadID).addEventListener("click", function() {
                j--; //for some reason j was incrementing too early

                //gets the videos in storage
                
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