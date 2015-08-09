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
			addRefresher(countArr, msg["tabId"], msg["value"]);
		} else if(msg["type"] == "end") {
			removeRefresher(countArr, msg["tabId"]);
		}
	});
	
	chrome.commands.onCommand.addListener(function(command) {
		if(command == "toggleAutoRefresh") {
			chrome.tabs.query({active: true}, function(result) {
				if(result.length != 0) {
					var tabId = result[0].id;
					if(countArr.hasOwnProperty(String(tabId)) && countArr[String(tabId)].handle != null) {
						// Already active, toggle off.
						removeRefresher(countArr, tabId);
					} else {
						// Inactive, toggle on.
						addRefresher(countArr, tabId, (countArr.hasOwnProperty(String(tabId))) ? countArr[String(tabId)].interval : 10);
					}
				}
			});
		}
	});
};

function addRefresher(countArr, tabId, interval) {
	var tabIdStr = String(tabId);
	if(countArr.hasOwnProperty(tabIdStr)) {
		window.clearInterval(countArr[tabIdStr].handle);
		delete countArr[tabIdStr];
	}
	var handle = window.setInterval(function() {
		if (countArr[tabIdStr].current > 0) {
			var value = countArr[tabIdStr].current--;
			chrome.browserAction.setBadgeText({text: String(value) + 's', tabId: tabId});
			chrome.runtime.sendMessage(null, {"type": "state", "tabId": tabId, "value": value});
		} else {
			countArr[tabIdStr].current = countArr[tabIdStr].interval;
			chrome.tabs.reload(tabId, null, null);
		}
	}, 1000);
	countArr[tabIdStr] = {
		"interval": interval,
		"current": interval,
		"handle": handle
	};
}

function removeRefresher(countArr, tabId) {
	var tabIdStr = String(tabId);
	if(countArr.hasOwnProperty(tabIdStr)) {
		chrome.browserAction.setBadgeText({text: "", tabId: tabId});
		window.clearInterval(countArr[tabIdStr].handle);
		countArr[tabIdStr].current = "";
		countArr[tabIdStr].handle = null;
	}
}
