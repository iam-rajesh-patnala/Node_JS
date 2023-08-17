const names = require('../country/state/city/index');
const getFirstNames = require('../utilities/utils/index');

const getPeopleInCity = (names) => { 
  return getFirstNames(names)
}

module.exports = getPeopleInCity;

// console.log(getPeopleInCity(names));