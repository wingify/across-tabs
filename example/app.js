var newTab, i = 0;
var newTab, i = 0;

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
  ready: function() {

  },

  // Methods we want to use in our application are registered here
  methods: {
    openNewTab: function (ev) {
      var config = {
        url: 'http://localhost:3000/example/child.html',
        windowName: 'heatmap' + ++i,
        windowFeatures: ''
      };
      newTab = parent.openNewTab(config);
      console.log( newTab )
    },
    closeAllTabs: function () {
      parent.closeAllTabs();
    },
    closeTab: function (id) {
      parent.closeTab(id);
    },
    broadCastTo: function (tab) {
      parent.broadCastTo(tab, 'Yo! Message from parent!!');
    },
    broadCastAll: function () {
      parent.broadCastAll('Yo! Broadcasted Message from parent to ALL!');
    },
    showPMList: function (data) {
      this.postMessageEvents.push(data);
    },
    showList: function () {
      if (!newTab) { return; }

      this.allTabs = parent.getAllTabs(),
      this.openedTabs = parent.getOpenedTabs(),
      this.closedTabs = parent.getClosedTabs();
    }
  }
});

app.$mount('#example-container');

var parent = new AcrossTabs.Parent({
  onHandshakeCallback: app.showPMList,
  onPollingCallback: app.showList
});