import arrayUtils from '../../src/utils/array';
import PostMessageEventNamesEnum from '../../src/enums/PostMessageEventNamesEnum';

import tabUtils from '../../src/utils/tab';

let mockedTab = {
  url: 'http://localhost:3000/example/child.html',
  id: '57cd47da-d98e-4a2d-814c-9b07cb51059c',
  name: 'heatmap1',
  status: 'open',
  ref: window
};

let tab1, tab2, tab3;

function addTabs() {
  (tab1 = Object.create(mockedTab)), (tab2 = Object.create(mockedTab)), (tab3 = Object.create(mockedTab));

  tabUtils.tabs.push(tab1);
  tabUtils.tabs.push(tab2);
  tabUtils.tabs.push(tab3);
}

describe('tabUtils', () => {
  beforeEach(() => {
    tabUtils.tabs = [];
    tabUtils.config = {};
  });
  afterEach(() => {
    tab1 = null;
    tab2 = null;
    tab3 = null;
  });

  describe('Basic tests', () => {
    it('verify it is defined and its methods', () => {
      expect(tabUtils).toBeDefined();
      expect(tabUtils._remove).toBeDefined();
      expect(tabUtils._preProcessMessage).toBeDefined();

      expect(tabUtils.addNew).toBeDefined();
      expect(tabUtils.getOpened).toBeDefined();
      expect(tabUtils.getClosed).toBeDefined();
      expect(tabUtils.getAll).toBeDefined();
      expect(tabUtils.closeTab).toBeDefined();
      expect(tabUtils.closeAll).toBeDefined();
      expect(tabUtils.broadCastAll).toBeDefined();
      expect(tabUtils.broadCastTo).toBeDefined();
    });
  });

  describe('method: _remove', () => {
    it('should remove tab from tab list', () => {
      spyOn(arrayUtils, 'searchByKeyName');
      tabUtils.tabs.push(mockedTab);

      expect(tabUtils.tabs.length).toBe(1);

      tabUtils._remove(mockedTab);

      expect(arrayUtils.searchByKeyName).toHaveBeenCalled();
      expect(tabUtils.tabs.length).toBe(0);
    });
  });
  describe('method: _preProcessMessage', () => {
    it('should stringify msg sent', () => {
      spyOn(JSON, 'stringify');

      tabUtils.config.stringify = JSON.stringify;

      let msg = 'Some message';

      tabUtils._preProcessMessage(msg);
      expect(JSON.stringify).toHaveBeenCalledWith(msg);
    });

    it('should stringify msg sent with custom stringifier', () => {
      const custom = {
        stringify: msg => (typeof msg === 'string' ? msg : `${msg}`)
      };

      spyOn(custom, 'stringify');

      tabUtils.config.stringify = custom.stringify;

      let msg = 'Some message';

      tabUtils._preProcessMessage(msg);
      expect(custom.stringify).toHaveBeenCalledWith(msg);
    });

    it('should prepend if message is of a particular type', () => {
      tabUtils.config.stringify = JSON.stringify;

      let msg = 'Some message';

      let value = tabUtils._preProcessMessage(msg);
      expect(value.indexOf(PostMessageEventNamesEnum.PARENT_COMMUNICATED)).not.toBe(-1);
    });
  });
  describe('method: addNew', () => {
    it('should push a new tab to the list', () => {
      expect(tabUtils.tabs.length).toBe(0);

      tabUtils.tabs.push(mockedTab);
      expect(tabUtils.tabs.length).toBe(1);

      tabUtils.tabs.push(mockedTab);
      expect(tabUtils.tabs.length).toBe(2);
    });
  });
  describe('method: getOpened', () => {
    it('should return all opened tabs', () => {
      let result;

      addTabs();

      tab1.status = 'open';
      tab2.status = 'close';
      tab3.status = 'open';

      result = tabUtils.getOpened();

      expect(result.length).toBe(2);

      for (var i = 0; i < result.length; i++) {
        expect(result[i].status).toEqual('open');
      }
    });
  });
  describe('method: getClosed', () => {
    it('should return all closed tabs', () => {
      let result;

      addTabs();

      tab1.status = 'open';
      tab2.status = 'close';
      tab3.status = 'open';

      result = tabUtils.getClosed();

      expect(result.length).toBe(1);

      for (var i = 0; i < result.length; i++) {
        expect(result[i].status).toEqual('close');
      }
    });
  });
  describe('method: getAll', () => {
    it('should return all tabs', () => {
      let result;

      tabUtils.tabs.push(mockedTab);
      tabUtils.tabs.push(mockedTab);
      tabUtils.tabs.push(mockedTab);

      result = tabUtils.getAll();

      expect(result.length).toBe(3);

      for (var i = 0; i < result.length; i++) {
        expect(result[i].id).toBeDefined();
      }
    });
  });
  describe('method: closeTab', () => {
    it('should close the tab whose id is specified', () => {
      let result;

      addTabs();

      tab1.id = '57cd47da-d98e-4a2d-814c-9b07cb51059c';
      tab2.id = 'bjjbnk32-d98e-4a2d-814c-9b07cb51059c';
      tab3.id = 'pi0dn3dd-d98e-4a2d-814c-9b07cb51059c';

      spyOn(tab1.ref, 'close');

      tabUtils.closeTab(tab1.id);

      expect(tab1.ref.close).toHaveBeenCalled();
    });
  });
  describe('method: closeAll', () => {
    it('should close all opened tabs', () => {
      let result;

      addTabs();

      tab1.id = '57cd47da-d98e-4a2d-814c-9b07cb51059c';
      tab2.id = 'bjjbnk32-d98e-4a2d-814c-9b07cb51059c';
      tab3.id = 'pi0dn3dd-d98e-4a2d-814c-9b07cb51059c';

      spyOn(tab1.ref, 'close');

      tabUtils.closeAll(tab1.id);

      expect(tab1.ref.close).toHaveBeenCalled();
      expect(tab2.ref.close).toHaveBeenCalled();
      expect(tab3.ref.close).toHaveBeenCalled();
    });
  });
  describe('method: broadCastAll', () => {
    it('should broadcast a message to all the opened tabs', () => {
      tabUtils.config.stringify = JSON.stringify;

      let result;

      addTabs();

      tab1.id = '57cd47da-d98e-4a2d-814c-9b07cb51059c';
      tab2.id = 'bjjbnk32-d98e-4a2d-814c-9b07cb51059c';
      tab3.id = 'pi0dn3dd-d98e-4a2d-814c-9b07cb51059c';

      let i,
        tabs = tabUtils.getOpened();

      spyOn(tabs[0].ref.top, 'postMessage');
      tabUtils.broadCastAll('custom_message@12345');

      for (i = 0; i < tabs.length; i++) {
        expect(tabs[i].ref.top.postMessage).toHaveBeenCalled();
      }
    });
  });
  describe('method: broadCastTo', () => {
    it('should broadcast a message to the specified tab', () => {
      tabUtils.config.stringify = JSON.stringify;

      let result;

      addTabs();

      tab1.id = '57cd47da-d98e-4a2d-814c-9b07cb51059c';
      tab2.id = 'bjjbnk32-d98e-4a2d-814c-9b07cb51059c';
      tab3.id = 'pi0dn3dd-d98e-4a2d-814c-9b07cb51059c';

      spyOn(tab1.ref.top, 'postMessage');

      tabUtils.broadCastTo(tab1.id, 'hello');

      expect(tab1.ref.top.postMessage).toHaveBeenCalled();
    });
  });
  describe('method: sendMessage', () => {
    it('should send message to correct child window', () => {
      let result;

      addTabs();

      tab1.id = '57cd47da-d98e-4a2d-814c-9b07cb51059c';
      tab2.id = 'bjjbnk32-d98e-4a2d-814c-9b07cb51059c';
      tab3.id = 'pi0dn3dd-d98e-4a2d-814c-9b07cb51059c';

      spyOn(tab1.ref.top, 'postMessage');
      tabUtils.sendMessage(tab1, 'hello');
      expect(tab1.ref.top.postMessage).toHaveBeenCalled();
    });

    it('should send message to the all ref windows existing', () => {
      let result;

      addTabs();

      tab1.id = '57cd47da-d98e-4a2d-814c-9b07cb51059c';
      tab2.id = 'bjjbnk32-d98e-4a2d-814c-9b07cb51059c';
      tab3.id = 'pi0dn3dd-d98e-4a2d-814c-9b07cb51059c';

      tab1.ref = [{ postMessage: function() {} }, { postMessage: function() {} }]; // mock length

      spyOn(tab1.ref[1], 'postMessage');
      spyOn(tab1.ref[0], 'postMessage');
      tabUtils.sendMessage(tab1, 'hello', true, 'Hey');
      expect(tab1.ref[1].postMessage).toHaveBeenCalled();
      expect(tab1.ref[0].postMessage).toHaveBeenCalled();
    });
  });
});
