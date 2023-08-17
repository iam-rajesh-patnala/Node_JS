const addDays = require('date-fns/addDays');


const date = (days) => {
    let newDate = addDays(new Date(2020, 7, 22), days);
    return `${newDate.getDate()}-${newDate.getMonth() + 1}-${newDate.getFullYear()}`
};

// module.exports = date;
console.log(date(5));