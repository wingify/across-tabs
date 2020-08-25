import tabUtils from '../src/utils/tab';
import UUID from '../src/vendor/uuid';
import domUtils from '../src/utils/dom';
import TabDataTypesEnum from '../src/enums/TabDataEnum';

import Tab from '../src/tab';

let tab,
  mockedTab = {
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

describe('Tab', () => {
  beforeEach(() => {
    tabUtils.tabs = [];
    tab = new Tab();
  });
  afterEach(() => {
    tab1 = null;
    tab2 = null;
    tab3 = null;
  });

  describe('Basic tests', () => {
    it('verify it is defined and its methods', () => {
      expect(tab).toBeDefined();

      expect(tab.create).toBeDefined();
    });
  });

  describe('Constructor', () => {
    it('it should set th  window name if not defined', () => {
      window.name = 'Hey';
      let tab = new Tab();

      expect(window.name).toEqual('Hey');
    });
  });

  describe('method: create', () => {
    it('should set keys on `this`', () => {
      spyOn(UUID, 'generate');
      spyOn(window, 'open');
      spyOn(domUtils, 'disable');
      spyOn(tabUtils, 'addNew');

      tab.create({
        url: 'http://abc.xyz'
      });

      expect(tab.url).toEqual('http://abc.xyz');
      expect(tab.id).toBeDefined();
      expect(UUID.generate).toHaveBeenCalled();
      expect(tab.status).toEqual('open');
      expect(window.open).toHaveBeenCalled();
      expect(domUtils.disable).toHaveBeenCalled();
      expect(tabUtils.addNew).toHaveBeenCalledWith(tab);
    });
    it('should pass queryParams if windowNameOverridden', () => {
      let isWindowNameOverridden = true;
      tab.create({
        url: 'http://abc.xyz',
        windowName: 'new tab'
      }, isWindowNameOverridden);
      expect(tab.url.href).toEqual(`http://abc.xyz/?${TabDataTypesEnum.NEW_TAB_DATA}=new+tab`)
    })
  });
});
