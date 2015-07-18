window.onload = function() {
	setupButtonListener();
	setupViewListener();
	requestView();
}

function setupButtonListener() {
	document.getElementById("testbutton").addEventListener('click',
	function() {
		chrome.tabs.query( {
			"active": true,
			"currentWindow": true
		},
		function(tab) {
			var duration = document.getElementById("durationInput").value;
			duration = duration - 0;
			if(duration != null && !isNaN(duration)) {
				console.log(duration);
				chrome.runtime.sendMessage(null, {"type": "begin", "tabId": tab[0]["id"], "value": duration});
			}
		});
		//chrome.tabs.reload(null, null, null);
	});

	document.getElementById("stopBtn").addEventListener('click',
	function() {
		chrome.tabs.query( {
			"active": true,
			"currentWindow": true
		},
		function(tab) {
			chrome.runtime.sendMessage(null, {"type": "end", "tabId": tab[0]["id"]});
			var span = document.getElementById("currentStatus");
			span.textContent = "";
		});
		//chrome.tabs.reload(null, null, null);
	});
}

function setupViewListener() {
	chrome.runtime.onMessage.addListener( function(msg, sender, sendResponse) {
		if(msg["type"] == "state") {
		chrome.tabs.query( {
			"active": true,
			"currentWindow": true
		},
		function(tab) {
			if(tab[0].id == msg.tabId) {
				var span = document.getElementById("currentStatus");
				span.textContent = msg.value;
				//document.getElementById("testbutton").innerHTML = msg["value"];
			}
		});
			
		}
	});
}

function requestView() {
	chrome.tabs.query( {
		"active": true,
		"currentWindow": true
	},
	function(tab) {
		chrome.runtime.sendMessage(null, {"type": "view", "tabId": tab[0].id}, null, function(msg) {
			var span = document.getElementById("currentStatus");
			span.textContent = msg.current;
			document.getElementById("durationInput").value = msg.interval;
		});
	});
}