chrome.tabs.onActivated.addListener(tab => {
    chrome.tabs.get(tab.tabId, current_tab_info => {
        // console.log(current_tab_info.url);
        var regex = /^https:\/\/ca\.bbcollab\.com\/collab\/ui\/session\/playback/;
        if(regex.test(current_tab_info.url)) {
            console.log("Found a BbC recording!!");
            chrome.tabs.executeScript(null, {file: "./js/content.js"});
        }
    });
});