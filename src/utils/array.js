let arrayUtils = {};

/**
 * Different type of data needed after searching an item(Object) within data(Array of Objects).
 * 1. `INDEX` returns just the index at which the item was present
 * 2. `OBJECT` returns the matched object
 * 3. `BOTH` returns an object { obj: matched_object, index: index_found }
 */
let returnPreferenceEnum = {
  INDEX: 'index',
  OBJECT: 'object',
  BOTH: 'both'
};

/**
 * Search for an item(Object) within a data-set(Array Of Objects)
 * @param  {Array of Objects} data
 * @param  {String} key - Unique key to search on the basis of
 * @param  {String} value - The matching criteria
 * @param  {String} returnPreference - what kind of output is needed
 * @return {Object}
 */
arrayUtils.searchByKeyName = (data, key, value, returnPreference) => {
  if (!data || !key) {
    return false;
  }

  returnPreference = returnPreference || returnPreferenceEnum[1]; // default to Object
  let i,
    obj,
    returnData,
    index = -1;

  for (i = 0; i < data.length; i++) {
    obj = data[i];
    // Number matching support
    if (!isNaN(value) && parseInt(obj[key], 10) === parseInt(value, 10)) {
      index = i;
      break;
    } else if (isNaN(value) && obj[key] === value) {
      // String exact matching support
      index = i;
      break;
    }
  }

  if (index === -1) {
    // item not found
    data[index] = {}; // for consistency
  }

  switch (returnPreference) {
    case returnPreferenceEnum.INDEX:
      returnData = index;
      break;
    case returnPreferenceEnum.BOTH:
      returnData = {
        obj: data[index],
        index: index
      };
      break;
    case returnPreferenceEnum.OBJECT:
    default:
      returnData = data[index];
      break;
  }

  return returnData;
};

export default arrayUtils;
