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

    // chrome.storage.local.remove('videos');
    // chrome.storage.local.remove('video');
    chrome.storage.local.get(['videos'], function(result) {    
        if (isEmptyObject(result)) {
            createVideosObject();
        } else {
            var videos = result.videos;
            var updatedVideos = new Object();
            var currentVideosArray = Object.entries(videos);
            var index = 0;
            for (var i = 0; i < currentVideosArray.length; i++) {
                if(videos[i].dateAdded.localeCompare(today) === 0) {
                    updatedVideos[index] = videos[i];
                    index++;
                }
            }
            chrome.storage.local.set({ 
                'videos': updatedVideos
            }, function() {
                console.log("Videos object successfully updated and stored to local storage!");
            });
        }
    });

    //////////////////////////////////////////////////////////////////////
    
    /////////////////Adding Click Listeners to the Tabs///////////////////
    /*PiP*/
    //disables pip tab when not on a blackboard recording
    var pipTab = document.getElementById("pip");
    chrome.tabs.getSelected(null, function(tab) {
        var tabUrl = tab.url;
        var regex = /^https:\/\/ca\.bbcollab\.com\/collab\/ui\/session\/playback/;
        if(regex.test(tabUrl)) {
            pipTab.onclick = onPiP;
        } else {
            pipTab.classList.add("disabled");
        }
    });

    /*Downloads*/
    var downloadsTab = document.getElementById("downloads");
    var firstLoad = true;
    downloadsTab.classList.add("active");
    downloadsTab.onclick = onDownloads;

    /*How To Use*/
    var howToTab = document.getElementById("howto");
    howToTab.onclick = onHowTo;
    //////////////////////////////////////////////////////////////////////

    onDownloads();//starts everything - loads the downloads tab on popup


    function onDownloads() {
        if (downloadsTab.classList.contains("active") && !firstLoad) {//if this is not the first time loading the download tab while the popup has been up...
            return; //leave this function if this tab is already active
        } else {
            firstLoad = false;

            //disables currently active tab that is not the downloads tab
            if(pipTab.classList.contains("active")) {
                pipTab.classList.remove("active");
                document.getElementById("pipDiv").remove();
            } else if(howToTab.classList.contains("active")) {
                howToTab.classList.remove("active");
                document.getElementById("howToDiv").remove();
            }

            var contentDiv = document.createElement("div");
            contentDiv.id = "contentDiv";
        
            document.getElementsByClassName("mymodal-content")[0].appendChild(contentDiv);
            downloadsTab.classList.add("active");
            chrome.storage.local.get(['video'], function(result) {
                video = result.video;
                if(!isEmptyObject(result)) {
                    addVideo();
                }
        
                timerId = setInterval(getVideos, 250);
        
            });
        }
    }

    function onPiP() {
        //disables currently active tab that is not the pip tab
        if (pipTab.classList.contains("active")) { //if the pip tab is already active...
            return; //leave this function if this tab is already active
        } else if (downloadsTab.classList.contains("active")) {
            document.getElementById("contentDiv").remove();
            downloadsTab.classList.remove("active");
        } else if (howToTab.classList.contains("active")) {
            howToTab.classList.remove("active");
            document.getElementById("howToDiv").remove();
        }

        //makes the pip tab active and adds the necessary html elements
        pipTab.classList.add("active");
        var pipDiv = document.createElement("div");
        pipDiv.id = "pipDiv";

        var pipBtn = document.createElement("button");

        chrome.storage.local.get(['pip'], function(result) {
            if(isEmptyObject(result)) {
                chrome.storage.local.set({ 
                    'pip': false
                }, function() {
                    console.log("Saving PiP Mode");
                });

                pipBtn.classList.add("btn", "btn-primary");
                pipBtn.innerText = "Enter Picture-in-Picture Mode";

            } else {

                if(result.pip === false) {
                    pipBtn.classList.add("btn", "btn-primary");
                    pipBtn.innerText = "Enter Picture-in-Picture Mode";
                } else {
                    pipBtn.classList.add("btn", "btn-danger");
                    pipBtn.innerText = "Leave Picture-in-Picture Mode";
                }
            }
        });

        
        
        pipBtn.addEventListener("click", function(e) {
            if(e.target.innerText.localeCompare("Leave Picture-in-Picture Mode") === 0) {
                e.target.innerText = "Enter Picture-in-Picture Mode";
                e.target.classList.remove("btn-danger");
                e.target.classList.add("btn-primary");
                chrome.storage.local.set({ 
                    'pip': false
                }, function() {
                    console.log("Updating PiP Mode");
                });
            } else {
                e.target.innerText = "Leave Picture-in-Picture Mode";
                e.target.classList.remove("btn-primary");
                e.target.classList.add("btn-danger");
                chrome.storage.local.set({ 
                    'pip': true
                }, function() {
                    console.log("Updating PiP Mode");
                });
            }
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {
                    "pip": true
                });
            });
        });

        pipDiv.appendChild(pipBtn);

        document.getElementsByClassName("mymodal-content")[0].appendChild(pipDiv);

    }

    function onHowTo() {
        if(howToTab.classList.contains("active")) {
            return; //leave this function if this tab is already active
        } else if(downloadsTab.classList.contains("active")) {
            document.getElementById("contentDiv").remove();
            downloadsTab.classList.remove("active");
        } else if(pipTab.classList.contains("active")) {
            document.getElementById("pipDiv").remove();
            pipTab.classList.remove("active");
        }

        howToTab.classList.add("active");
        var howToDiv = document.createElement("div");
        howToDiv.id = "howToDiv";

        howToDiv.innerHTML = "<p><b>Prober</b> is an easy-to-use tool for downloading BlackBoard Collaborate virtual classroom recordings. <b>Prober</b> also features an in-browser Picture-in-Picture functionality so that you can keep an eye on what you are watching while interacting with other sites and applications.</p>" +
                                "<br><p><u>Downloading recordings</u>:</p>" +
                                "<ul>" +
                                "<li>Find the recording you would like to download and open it in the recording player.</li>" +
                                "<li>Ensure the recording player has fully loaded.</li>" +
                                "<li>Open the <b>Prober</b> popup and navigate to the <i>Downloads</i> tab. The recording will be added to the list of recordings ready to be downloaded.</li>" +
                                "<li>There is no limit to the number of recordings that can be added to the downloads list. <b><i>Note however that the list will refresh automatically on each new day.</i></b></li>" +
                                "</ul>" +
                                "<br><p><u>Using PiP mode</u>:</p>" +
                                "<ul>" +
                                "<li>Navigate to the recording player and ensure that it has fully loaded.</li>" +
                                "<li>Open the <b>Prober</b> popup and navigate to the <i>PiP</i> tab. There, you will find a button that you can use to toggle PiP mode.</li>" +
                                "</ul>";
        document.getElementsByClassName("mymodal-content")[0].appendChild(howToDiv);
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

                var dateAdded = new Date();
                var dd = String(dateAdded.getDate()).padStart(2, '0');
                var mm = String(dateAdded.getMonth() + 1).padStart(2, '0');
                var yyyy = dateAdded.getFullYear();
                dateAdded = mm + '/' + dd + '/' + yyyy;
                
                var length = Object.entries(videos).length;
                video['id'] = length;
                video['dateAdded'] = dateAdded;
                videos[length] = video;
                chrome.storage.local.set({ 
                    'videos': videos
                }, function() {
                    console.log("Videos object successfully updated and stored to local storage!");
                    chrome.storage.local.remove('video');
                    video = null;
                });
            }
        });
    }

    function createVideosObject() {
        var dateAdded = new Date();
        var dd = String(dateAdded.getDate()).padStart(2, '0');
        var mm = String(dateAdded.getMonth() + 1).padStart(2, '0');
        var yyyy = dateAdded.getFullYear();
        dateAdded = mm + '/' + dd + '/' + yyyy;

        var videos = new Object();
        if(video !== null && video !== undefined) {
            video['id'] = 0;
            video['dateAdded'] = dateAdded;
            videos[0] = video;
        }
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
                        downloadBtn.classList.add("btn", "btn-outline-primary");
                        downloadBtn.innerText = "Download Again";
                    } else {
                        downloadItemTitle.classList.add("download-itemTitle", "bold");
                        downloadBtn.classList.add("btn", "btn-outline-success");
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
                    removeBtn.classList.add("btn", "btn-outline-danger");
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