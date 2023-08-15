// default import
import add from './calculator.mjs';
console.log(add(2, 5));

// named import
import { sub, mul } from './calculator.mjs';
console.log(sub(20, 5));
console.log(mul(20, 5));