
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // https://canvas.donga.ac.kr/ 에서 실행하기!
    if (request.action === "startWatching") {
        console.log("Start Watching.");
        SendSubjectLinks();
    }
    else if (request.action === "GetVideoLinks") {
        GetVideoLinks();
    }
    else if (request.action === "GetCmakerLink") {
        GetCmakerLink();
    }
    else if (request.action === "WatchVideo") {
        WatchVideo();
    }
});



async function SendSubjectLinks() {
    const dashBoards = document.querySelectorAll('#DashboardCard_Container > div > div');
    // 모든 교과목의 주차학습 탭
    const hrefList = Array.from(dashBoards).map(div => {
        const link = div.querySelector('a');
        return link ? link.href+"/external_tools/37" : null;
    }).filter(href => href !== null);
    
    // 백그라운드 스크립트로 링크 목록 전송
    await chrome.runtime.sendMessage({ action: "SendSubjectLinks", links: hrefList });
}


function GetVideoLinks() {
    console.log("Start Getting Video Links");

    let iframe = document.querySelector("#tool_content");
    let i_doc = iframe.contentDocument;

    const getVideoLink = function() {
        let incompletes = i_doc.querySelectorAll(".xnmb-module_item-completed.incomplete");
    
        const videoLinks = Array.from(incompletes).map(element => {
            if (element.parentNode.querySelector(".xncb-component-sub-d_day.upcoming")) // 아직 안 열렸으면
                return null;
    
            const className = element.parentNode.parentNode.querySelector("i").className;
            if (!className.includes("movie") && !className.includes("mp4")) // 영상 자료가 아니면
                return null;
            
            const linkElement = element.parentNode.parentNode.querySelector("div.xnmb-module_item-left-wrapper > div > div.xnmb-module_item-meta_data-left-wrapper > div > a");
            if (!linkElement)
                return null;
            
            console.log(className);
            console.log(linkElement.href);
    
            return linkElement.href
        }).filter(link => link !== null);
    
        chrome.runtime.sendMessage({ action: "SendVideoLinks", links: videoLinks });

        this.removeEventListener('load', getVideoLink);
    };

    if (i_doc.readyState !== "complete")
    {
        console.log("Iframe isn't loaded!");
        iframe.addEventListener("load", getVideoLink);
    }
    else
    {
        console.log("Iframe already loaded!");
        getVideoLink();
    }
}

function GetCmakerLink() {
    iFrame1 = document.querySelector("#tool_content");
    iFrame2 = iFrame1.contentDocument.querySelector("#root > div > div.xnlail-video-component > div.xnlailvc-commons-container > iframe");

    console.log(iFrame2.src);
    chrome.runtime.sendMessage({ action: "SendCmakerLink", link: iFrame2.src });
}


function WatchVideo() {
    const playBtn = document.querySelector("#front-screen > div > div.vc-front-screen-btn-container > div.vc-front-screen-btn-wrapper.video1-btn > div");
    const confirmBtn = document.querySelector("#confirm-dialog > div > div > div.confirm-btn-wrapper > div.confirm-ok-btn.confirm-btn");

    playBtn.click();
    confirmBtn.click();

    console.log("WatchVideo Button Clicked");
}


console.log("Content script loaded, waiting for instructions.");
