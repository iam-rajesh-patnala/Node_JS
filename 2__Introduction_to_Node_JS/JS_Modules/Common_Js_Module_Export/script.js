// -------- Default import
// const add = require('./root');
// console.log(add(10, 5));


//------- Named import

const { sub, mul } = require('./root');
console.log(sub(10, 5));
console.log(mul(10, 5));