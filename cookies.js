function showCookiesForTab(tabs) {
    let tab = tabs.pop();
    var gettingAllCookies = browser.cookies.getAll({ url: tab.url });
    gettingAllCookies.then((cookies) => {
        var activeTabUrl = document.getElementById('header-title');
        var text = document.createTextNode("Cookies at: " + tab.title);
        activeTabUrl.appendChild(text);
        var cookieList = document.getElementById('cookie-list');
        if (cookies.length > 0) {
            for (let cookie of cookies) {
                let li = document.createElement("li");
                let content = document.createTextNode(cookie.name + ": " + cookie.value);
                li.appendChild(content);
                cookieList.appendChild(li);
            }
        } else {
            let p = document.createElement("p");
            let content = document.createTextNode("No cookies in this tab.");
            let parent = cookieList.parentNode;
            p.appendChild(content);
            parent.appendChild(p);
        }
    });
}

function getActiveTab() {
    return browser.tabs.query({ currentWindow: true, active: true });
}

getActiveTab().then(showCookiesForTab);

const hostnameRegex = /\/\/([\.\-\_\w]+)/i

browser.runtime.onMessage.addListener((msg, sender) => {
    const tabId = sender.tab.id
    if (msg == 'ignored') {
      browser.pageAction.setIcon({ tabId, path: 'icons/cookie-solid.svg' })
      browser.pageAction.setTitle({ tabId, title: 'Enable popup blocking for this site' })
      browser.pageAction.show(tabId)
    } else if (msg == 'blocked') {
      browser.pageAction.setIcon({ tabId, path: 'icons/cookie-bite-solid.svg' })
      browser.pageAction.setTitle({ tabId, title: 'Disable popup blocking for this site' })
      browser.pageAction.show(tabId)
    }
  })
  
  browser.pageAction.onClicked.addListener(async (tab) => {
    const hostname = tab.url.match(hostnameRegex)[1]
    const existing = await browser.storage.sync.get(hostname)
    if (existing[hostname] == 'i') {
      // remove from blocklist
      await browser.storage.sync.remove(hostname)
    } else {
      // add to blocklist
      await browser.storage.sync.set({ [hostname]: 'i' })
    }
    await browser.tabs.reload(tab.id)
  })