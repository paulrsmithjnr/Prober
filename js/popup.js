//TODO: Work on PiP functionality. Can maybe send a message from popup script to 
//content script with a boolean value or some other way of requesting pip.
document.addEventListener('DOMContentLoaded', function() {
    var video = null;
    var timerId = null;
    var timerCount = 0;

    //////////////Empties local storage on each new day///////////////////
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;

    chrome.storage.local.get(['today'], function(result) { 
        if (today.localeCompare(result.today) !== 0) {
            chrome.storage.local.remove('videos');
            chrome.storage.local.remove('video');
            chrome.storage.local.set({ 
                'today': today
            });
        } 
    });
    //////////////////////////////////////////////////////////////////////
    
    /////////////////Adding Click Listeners to the Tabs///////////////////
    document.getElementById("pip").onclick = onPiP;
    var downloadsTab = document.getElementById("downloads");
    var firstLoad = true;
    downloadsTab.classList.add("active");
    downloadsTab.onclick = onDownloads;
    //////////////////////////////////////////////////////////////////////

    onDownloads();//starts everything - loads the downloads tab on popup


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
            // chrome.runtime.sendMessage({
            //     "pip": true
            // });
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {
                    "pip": true
                });
            });
            if(e.target.innerText.localeCompare("Leave Picture-in-Picture Mode") === 0) {
                e.target.innerText = "Enter Picture-in-Picture Mode";
                e.target.classList.remove("btn-danger");
                e.target.classList.add("btn-primary");
            } else {
                e.target.innerText = "Leave Picture-in-Picture Mode";
                e.target.classList.remove("btn-primary");
                e.target.classList.add("btn-danger");
            }
        });

        pipDiv.appendChild(pipBtn);

        document.getElementsByClassName("mymodal-content")[0].appendChild(pipDiv);

    }

    function isEmptyObject(object) {
        return (Object.keys(object).length === 0 && object.constructor === Object) || (object === null);
    }

    function addVideo() {
        chrome.storage.local.get(['videos'], function(result) {
            
            if (isEmptyObject(result)) {
                createVideosObject();
            } else {
                // console.log("Videos:", result.videos);
                var videos = result.videos;
                var currentVideosArray = Object.entries(videos);

                // console.log("Length: ", currentVideosArray.length);
                // console.log("Entries: ", currentVideosArray);

                for (var i = 0; i < currentVideosArray.length; i++) {

                    var vidTitle = currentVideosArray[i][1].title
                    if (vidTitle.localeCompare(video.title) === 0) {
                        // console.log("Video already saved");
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
                    // console.log(videos[i][1].downloaded);
                    
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

                    
                    var downloadItemBtns = document.createElement("div");
                    downloadItemBtns.classList.add("download-itemBtns");
                    
                    downloadBtn.id = "downloadBtn" + i;
                    downloadBtn.addEventListener("click", function(e) {
                        var downloadButtonID = e.target.id;
                        var index = parseInt(downloadButtonID[downloadButtonID.length - 1]);
                        var download = videoObjects[index];//video to download
                        var options = {
                            url: download.source,
                            filename: download.title + ".mp4",
                            saveAs: true
                        }
                        chrome.downloads.download(options);

                        download['downloaded'] = true; //change status to already downloaded
                        videoObjects[index] = download; //reassigns that video in storage in order to update it
                        
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
                        var removeButtonID = e.target.id;
                        var index = parseInt(removeButtonID[removeButtonID.length - 1]);
                    
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
            } else {
                document.getElementById("contentDiv").innerText = "No recordings to download.";
            }
        });
    }
});