let domUtils = {
  disable: function (selector) {
    if (!selector) { return; }

    let i, ATOpenersElems = document.querySelectorAll('[' + selector + ']');

    for (i = 0; i < ATOpenersElems.length; i++) {
      ATOpenersElems[i].setAttribute('disabled', 'disabled');
    }
  },
  enable: function (selector) {
    if (!selector) { return; }

    let i, ATOpenersElems = document.querySelectorAll('[' + selector + ']');

    for (i = 0; i < ATOpenersElems.length; i++) {
      ATOpenersElems[i].removeAttribute('disabled');
    }
  }
};

module.exports = domUtils;
