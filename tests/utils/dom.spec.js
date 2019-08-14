import domUtils from '../../src/utils/dom';

describe('domUtils', () => {
  // inject the HTML elem for the tests
  beforeEach(function() {
    let elem = '<div id="elem">' + '<a data-tab-opener="parent" href="/about">Open Link</a>' + '/div>';

    document.body.insertAdjacentHTML('afterbegin', elem);
  });

  // remove the html elem from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('elem'));
  });
  describe('Basic tests', () => {
    it('verify it is defined and its methods', () => {
      expect(domUtils).toBeDefined();
      expect(domUtils.disable).toBeDefined();
      expect(domUtils.enable).toBeDefined();
    });
  });

  describe('method: disable', () => {
    it('should return if no selector is provided', () => {
      expect(domUtils.disable('')).toBe(false);
    });

    it('should add disabled attribute on the clicked btn/link', () => {
      let selectors = document.querySelectorAll('[' + 'data-tab-opener' + ']');

      for (var i = 0; i < selectors.length; i++) {
        expect(selectors[i].getAttribute('disabled')).toBe(null);
        domUtils.disable('data-tab-opener');
        expect(selectors[i].getAttribute('disabled')).toBe('disabled');
      }
    });
  });

  describe('method: enable', () => {
    it('should return if no selector is provided', () => {
      expect(domUtils.enable('')).toBe(false);
    });

    it('should remove disabled attribute on the clicked btn/link', () => {
      domUtils.enable('data-tab-opener');
    });

    it('should remove disabled attribute on the clicked btn/link', () => {
      // first add disabled attributes to all such elements
      domUtils.disable('data-tab-opener');

      let selectors = document.querySelectorAll('[' + 'data-tab-opener' + ']');

      for (var i = 0; i < selectors.length; i++) {
        expect(selectors[i].getAttribute('disabled')).toBe('disabled');
        domUtils.enable('data-tab-opener');
        expect(selectors[i].getAttribute('disabled')).toBe(null);
      }
    });
  });
});
