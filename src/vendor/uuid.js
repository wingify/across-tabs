/**
 * UUID.js: The RFC-compliant UUID generator for JavaScript.
 * ES6 port of only `generate` method of UUID by Varun Malhotra under MIT License
 *
 * @author  LiosK
 * @version v3.3.0
 * @license The MIT License: Copyright (c) 2010-2016 LiosK.
 */

/** @constructor */
let UUID;

UUID = (function () {
  'use strict';

  /** @lends UUID */
  function UUID() {}

  /**
   * The simplest function to get an UUID string.
   * @returns {string} A version 4 UUID string.
   */
  UUID.generate = function () {
    let rand = UUID._getRandomInt, hex = UUID._hexAligner;

    // ["timeLow", "timeMid", "timeHiAndVersion", "clockSeqHiAndReserved", "clockSeqLow", "node"]
    return hex(rand(32), 8) +           // time_low
      '-' +
      hex(rand(16), 4) +                // time_mid
      '-' +
      hex(0x4000 | rand(12), 4) +       // time_hi_and_version
      '-' +
      hex(0x8000 | rand(14), 4) +       // clock_seq_hi_and_reserved clock_seq_low
      '-' +
      hex(rand(48), 12);                // node
  };

  /**
   * Returns an unsigned x-bit random integer.
   * @param {int} x A positive integer ranging from 0 to 53, inclusive.
   * @returns {int} An unsigned x-bit random integer (0 <= f(x) < 2^x).
   */
  UUID._getRandomInt = function (x) {
    if (x < 0) {
      return NaN;
    }
    if (x <= 30) {
      return (0 | Math.random() * (1 << x));
    }
    if (x <= 53) {
      return (0 | Math.random() * (1 << 30)) +
        (0 | Math.random() * (1 << x - 30)) * (1 << 30);
    }

    return NaN;
  };

  /**
   * Returns a function that converts an integer to a zero-filled string.
   * @param {int} radix
   * @returns {function(num&#44; length)}
   */
  UUID._getIntAligner = function (radix) {
    return function (num, length) {
      let str = num.toString(radix), i = length - str.length, z = '0';

      for (; i > 0; i >>>= 1, z += z) {
        if (i & 1) {
          str = z + str;
        }
      }
      return str;
    };
  };

  UUID._hexAligner = UUID._getIntAligner(16);

  /**
   * Returns UUID string representation.
   * @returns {string} {@link UUID#hexString}.
   */
  UUID.prototype.toString = function () {
    return this.hexString;
  };

  return UUID;

})(UUID);

export default UUID;
