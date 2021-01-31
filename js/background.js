// var video = null;

// chrome.tabs.onActivated.addListener(tab => {
//     chrome.tabs.get(tab.tabId, current_tab_info => {
//         // console.log(current_tab_info.url);
//         var regex = /^https:\/\/ca\.bbcollab\.com\/collab\/ui\/session\/playback/;
//         if(regex.test(current_tab_info.url)) {
//             console.log("Found a BbC recording!!");
//             chrome.browserAction.onClicked.addListener(function(tab) {
//                 if(video !== null) {
//                     chrome.runtime.sendMessage({
//                         video: video
//                     });
//                 }
//             });
//             // var video = document.getElementById("playback-video-playback-video_html5_api");
//             // alert(video.src);
//             // chrome.tabs.executeScript(null, {file: 'js/popup.js'}, () => console.log("popup.js successfully loaded!"));
//         }
//     });
// });

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
//     video = request.video;
//     // document.getElementById("textContent").innerHTML = "BbC recording found!";
//     console.log("Actually found the video");
//     console.log(video);
// });