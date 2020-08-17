var newTab,
  i = 0;

var app = new Vue({
  // We want to target the div with an id of 'llist'
  // el: '#example-container',

  // Here we can register any values or collections that hold data
  // for the application
  data: {
    postMessageEvents: [],
    allTabs: [],
    openedTabs: [],
    closedTabs: []
  },

  // Anything within the ready function will run when the application loads
  ready: function() {},

  // Methods we want to use in our application are registered here
  methods: {
    openNewTab: function(ev) {
      var config = {
        url: 'http://localhost:3000/example/vue-js/child.html',
        windowName: 'Child - ' + ++i,
        windowFeatures: ''
      };
      parent.openNewTab(config);
    },
    closeAllTabs: function() {
      parent.closeAllTabs();
      app.showList();
    },
    closeTab: function(id) {
      parent.closeTab(id);
      app.showList();
    },
    broadCastTo: function(tab) {
      parent.broadCastTo(tab, 'Yo! Message from parent!!');
    },
    broadCastAll: function() {
      parent.broadCastAll('Yo! Broadcasted Message from parent to ALL!');
    },
    onHandshakeCallback: function(data) {
      data.type = 'open';
      this.showPMList(data);
    },
    onChildCommunication: function(data) {
      data.type = 'custom';
      this.showPMList(data);
    },
    onChildDisconnect: function(data) {
      data.type = 'close';
      this.showPMList(data);
    },
    showPMList: function(data) {
      this.postMessageEvents.push(data);
    },
    showList: function() {
      // if (!newTab) { return; }

      (this.allTabs = parent.getAllTabs()),
      (this.openedTabs = parent.getOpenedTabs()),
      (this.closedTabs = parent.getClosedTabs());
    }
  }
});

app.$mount('#example-container');

var parent = new AcrossTabs.default.Parent({
  onHandshakeCallback: app.onHandshakeCallback,
  onChildCommunication: app.onChildCommunication,
  onPollingCallback: app.showList,
  onChildDisconnect: app.onChildDisconnect
});
