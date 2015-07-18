var status = false;
var countArr = {};

window.onload = function() {
	// Remove interval for removed tabs
	chrome.tabs.onRemoved.addListener( function(tabId, removeInfo) {
		if(countArr.hasOwnProperty(String(tabId))) {
			window.clearInterval(countArr[String(tabId)].handle);
			delete countArr[String(tabId)];
		}
	});
	chrome.runtime.onMessage.addListener( function(msg, sender, sendResponse) {
		if(msg["type"] == "view") {
			sendResponse(countArr[msg["tabId"]]);
		} else if(msg["type"] == "begin") {
			if(countArr.hasOwnProperty(String(msg["tabId"]))) {
				window.clearInterval(countArr[String(msg["tabId"])].handle);
				delete countArr[String(msg["tabId"])];
			}
			var handle = window.setInterval(function() {
				if (countArr[String(msg["tabId"])].current > 0) {
					var value = countArr[String(msg["tabId"])].current--;
					chrome.browserAction.setBadgeText({text: String(value) + 's', tabId: msg["tabId"]});
					chrome.runtime.sendMessage(null, {"type": "state", "tabId": msg["tabId"], "value": value});
				} else {
					countArr[String(msg["tabId"])].current = countArr[String(msg["tabId"])].interval;
					chrome.tabs.reload(msg["tabId"], null, null);
				}
			}, 1000);
			countArr[String(msg["tabId"])] = {
				"interval": msg["value"],
				"current": msg["value"],
				"handle": handle
			};
		} else if(msg["type"] == "end") {
			if(countArr.hasOwnProperty(String(msg["tabId"]))) {
				chrome.browserAction.setBadgeText({text: "", tabId: msg["tabId"]});
				window.clearInterval(countArr[String(msg["tabId"])].handle);
				delete countArr[String(msg["tabId"])];
			}
		}
	});
};