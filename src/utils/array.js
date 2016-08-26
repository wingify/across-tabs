let arrayUtils = {};
let returnPreferenceEnum = {
  INDEX: 'index',
  OBJECT: 'object',
  BOTH: 'both'
};

arrayUtils.searchByKeyName = function (data, key, value, returnPreference) {
  if (!data || !key) { return {}; }

  returnPreference = returnPreference || returnPreferenceEnum[1]; // default to Object
  let i, obj, returnData, index = -1;

  for (i = 0; i < data.length; i++) {
    obj = data[i];
    // Number matching support
    if (!isNaN(value) && parseInt(obj[key], 10) === parseInt(value, 10)) {
      index = i;
      break;
    } else if (isNaN(value) && obj[key] === value) { // String exact matching support
      index = i;
      break;
    }
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

module.exports = arrayUtils;
