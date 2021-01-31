// chrome.tabs.onActivated.addListener(tab => {
//     chrome.tabs.get(tab.tabId, current_tab_info => {
//         // console.log(current_tab_info.url);
//         var regex = /^https:\/\/ca\.bbcollab\.com\/collab\/ui\/session\/playback/;
//         if(regex.test(current_tab_info.url)) {
//             console.log("Found a BbC recording!!");
//             // var video = document.getElementById("playback-video-playback-video_html5_api");
//             // alert(video.src);
//             // chrome.tabs.executeScript(null, {file: 'js/popup.js'}, () => console.log("popup.js successfully loaded!"));
//         }
//     });
// });