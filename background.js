
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (originTabId && tabId === originTabId && changeInfo.status === "complete") {
        console.log(`탭 ID ${tabId}의 웹페이지가 완전히 로드되었습니다: ${tab.url}`);
        
        setTimeout(_ => {
            chrome.tabs.sendMessage(tabId, { action: "GetVideoLinks" });
        }, 1000);
    }
    else if (videoTabId && tabId === videoTabId && changeInfo.status === "complete") {
        if (tab.url.includes("cmaker.donga.ac.kr/em/")) {
            // console.log("Cmaker!!!");
            setTimeout(_ => {
                chrome.tabs.sendMessage(tabId, { action: "WatchVideo" } );
            }, 5000);
            // return;
        }
        else {
            console.log("tabId: " + typeof(tabId));
            console.log(`새로운 탭 ID ${tabId}의 웹페이지가 완전히 로드되었습니다: ${tab.url}`);
            
            setTimeout(_ => {
                chrome.tabs.sendMessage(tabId, { action: "GetCmakerLink" });
            }, 1000);
        }
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SendSubjectLinks") {
        subjectLinks = request.links;
        originTabId = sender.tab.id;
        subjectIdx = 0;
        isNavigating = true;

        ToNextSubject();
    }
    else if (request.action === "SkipVideo") {
        if (isNavigating) {
            // currentIndex++; // 다음 링크로 인덱스 증가
            // ToNextLearning(); // 즉시 다음 주차학습으로 이동
        }
        else {
            console.log("탐색 중이 아닙니다.");
        }
    }
    else if (request.action === "StopWatching") {
        isNavigating = false; // 탐색 상태를 false로 변경하여 중단
        console.log("링크 탐색을 종료합니다.");
    }
    else if (request.action === "SendVideoLinks") {
        console.log("Recieved Video Links");
        console.log(request.links);

        videoLinks = request.links;
        videoIdx = 0;

        WatchNextVideo();
    }
    else if (request.action === "SendCmakerLink") {
        videoTabId = sender.tab.id;
        WatchVideo(request.link);
    }
});


let originTabId = null;
let isNavigating = false; // 현재 탐색 중인지 여부를 나타내는 변수

// js queue 없음?
let subjectLinks = [];
let subjectIdx = 0;

let videoTabId = null;
let videoLinks = [];
let videoIdx = 0;


function ToNextSubject() {
    chrome.tabs.update(originTabId, { url: subjectLinks[subjectIdx] });
}

async function WatchNextVideo() {
    videoTabId = (await chrome.tabs.create({ url: videoLinks[videoIdx] })).id;
}

function WatchVideo(link) {
    console.log(`Watching ${link}, ID: ${videoTabId}`);

    chrome.tabs.update(videoTabId, { url: link });
}


console.log("background loaded");
