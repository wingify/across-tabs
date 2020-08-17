/**
 * This utility helps enabling/disabling the Link/Button on the Parent Tab.
 * As soon as, user clicks on link/btn to open a new tab, the link/btn gets disabled.
 * Once child communicates for the first time with the Parent, the link/btn is re-enabled to open up new tab.
 * This feature is toggleable and can be used explicitly putting a data attribute on the link/btn.
 *
 * <a href="/demo.html" data-tab-opener="parent" target="_blank" on-click="parent.openNewTab(config)">Open Tab</a>
 */
let domUtils = {
  disable: selector => {
    if (!selector) {
      return false;
    }

    let i,
      ATOpenerElems = document.querySelectorAll('[' + selector + ']');

    for (i = 0; i < ATOpenerElems.length; i++) {
      ATOpenerElems[i].setAttribute('disabled', 'disabled');
    }
  },
  enable: selector => {
    if (!selector) {
      return false;
    }

    let i,
      ATOpenerElems = document.querySelectorAll('[' + selector + ']');

    for (i = 0; i < ATOpenerElems.length; i++) {
      ATOpenerElems[i].removeAttribute('disabled');
    }
  }
};

export default domUtils;
