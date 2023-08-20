const express = require('express');
const app = express();

const addDays = require('date-fns/addDays')

module.exports = app.get('/', (request, response) => {
    const date = new Date();
    const after100Days = addDays(date, 100);
    response.send(`${after100Days.getDate()}/${after100Days.getMonth() + 1}/${after100Days.getFullYear()}`);
});