// Polyfill of CustomEvent for IE >= 9
export default (() => {
  function CE(event, params = {}) {
    let evt = document.createEvent('CustomEvent');

    evt.initCustomEvent(event, false, false, params.detail);
    return evt;
  }

  if (typeof window.CustomEvent !== 'function') {
    CE.prototype = window.Event.prototype;
    window.CustomEvent = CE;
  }
})();
