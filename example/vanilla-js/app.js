var newTab,
  i = 0;
var postMessageEvents = [],
  allTabs = [],
  openedTabs = [],
  closedTabs = [];

function openNewTab(ev) {
  var config = {
    url: 'http://localhost:3000/example/vanilla-js/child.html',
    windowName: 'Child - ' + ++i,
    windowFeatures: ''
  };
  parent.openNewTab(config);
}
function closeAllTabs() {
  parent.closeAllTabs();
  showList();
}
function closeTab(id) {
  parent.closeTab(id);
  showList();
}
function broadCastTo(tab) {
  parent.broadCastTo(tab, 'Yo! Message from parent!!');
}
function broadCastAll() {
  parent.broadCastAll('Yo! Broadcasted Message from parent to ALL!');
}
function showPMList() {
  var list = '';
  for (var i = 0; i < postMessageEvents.length; i++) {
    var msg;
    if (postMessageEvents[i].type === 'custom') {
      msg = 'Tab: <strong>' + postMessageEvents[i].id + '</strong> sent: ' + postMessageEvents[i].msg;
    } else if (postMessageEvents[i].type === 'open') {
      msg = 'Tab: <strong>' + postMessageEvents[i].id + '</strong> opened';
    } else if (postMessageEvents[i].type === 'close') {
      msg = 'Tab: <strong>' + postMessageEvents[i].id + '</strong> closed';
    }
    list += '<li>' + '<span>' + msg + '</span>' + '</li>';
  }

  document.getElementById('pm-list').innerHTML = list;
}
function onChildDisconnect(data) {
  data.type = 'close';
  postMessageEvents.push(data);
  showPMList();
}
function onHandshakeCallback(data) {
  data.type = 'open';
  postMessageEvents.push(data);
  showPMList();
}
function onChildCommunication(data) {
  data.type = 'custom';
  postMessageEvents.push(data);
  showPMList();
}
function showList() {
  // if (!newTab) { return; }

  (allTabs = parent.getAllTabs()), (openedTabs = parent.getOpenedTabs()), (closedTabs = parent.getClosedTabs());

  if (allTabs) {
    document.getElementById('tabs-list').style.display = 'inline-block';
    document.getElementById('pm-section').style.display = 'inline-block';
  } else {
    document.getElementById('tabs-list').style.display = 'none';
    document.getElementById('pm-section').style.display = 'none';
  }

  var allTabsList = '',
    openedTabsList = '',
    closedTabsList = '',
    btnGroup;

  for (var i = 0; i < allTabs.length; i++) {
    var tab = allTabs[i];
    allTabsList +=
      '<li>' +
      '<div>' +
      '<span>name: </span>' +
      '<strong class="text--info">' +
      tab.windowName +
      '</strong>' +
      '</div>' +
      '<div>' +
      '<span>id: </span>' +
      '<strong class="text--info">' +
      tab.id +
      '</strong>' +
      '</div>' +
      '<div>' +
      '<span>status: </span>' +
      '<strong class="text--info">' +
      tab.status +
      '</strong>' +
      '</div>' +
      '</li>';
  }

  for (var i = 0; i < openedTabs.length; i++) {
    var tab = openedTabs[i];
    openedTabsList +=
      '<li>' +
      '<div>' +
      '<span>name: </span>' +
      '<strong class="text--info">' +
      tab.windowName +
      '</strong>' +
      '</div>' +
      '<div>' +
      '<span>id: </span>' +
      '<strong class="text--info">' +
      tab.id +
      '</strong>' +
      '</div>' +
      '<div>' +
      '<span>status: </span>' +
      '<strong class="text--info">' +
      tab.status +
      '</strong>' +
      '</div>' +
      '<button class="btn btn--success" onclick="broadCastTo(\'' +
      tab.id +
      "', 'Yo! Message from parent!')\">Send Message</button>" +
      '<button class="btn btn--danger margin--half-left" onclick="closeTab(\'' +
      tab.id +
      '\')">Close me</button>' +
      '</li>';
  }

  for (var i = 0; i < closedTabs.length; i++) {
    var tab = closedTabs[i];
    closedTabsList +=
      '<li>' +
      '<div>' +
      '<span>name: </span>' +
      '<strong class="text--info">' +
      tab.windowName +
      '</strong>' +
      '</div>' +
      '<div>' +
      '<span>id: </span>' +
      '<strong class="text--info">' +
      tab.id +
      '</strong>' +
      '</div>' +
      '<div>' +
      '<span>status: </span>' +
      '<strong class="text--info">' +
      tab.status +
      '</strong>' +
      '</div>' +
      '</li>';
  }

  btnGroup =
    '' +
    '<button class="btn btn--success" style="width:15%;" onclick="broadCastAll()">Send To All</button>' +
    '<button class="btn btn--danger" style="width:15%;float:right;" onclick="closeAllTabs()">Close All</button>';

  if (!allTabsList) {
    allTabsList = 'No tab found.';
  }
  if (!openedTabsList) {
    openedTabsList = 'No opened tab found.';
    btnGroup = ''; // dont show generic btns
  }
  if (!closedTabsList) {
    closedTabsList = "There's no closed tab.";
  }

  document.getElementById('all-tabs-list').innerHTML = allTabsList;
  document.getElementById('opened-tabs-list').innerHTML = openedTabsList;
  document.getElementById('closed-tabs-list').innerHTML = closedTabsList;
  document.getElementById('btn-group').innerHTML = btnGroup;
}

var parent = new AcrossTabs.default.Parent({
  onHandshakeCallback: onHandshakeCallback,
  onChildCommunication: onChildCommunication,
  onPollingCallback: showList,
  onChildDisconnect: onChildDisconnect
});
