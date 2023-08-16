// Common JS Module Export

// ------------------------------------------------------------- Default export
const add = (a, b) => a + b;
module.exports = add;

//  import module
const add = require("./sample.js");
console.log(add(2, 5));

// Exporting a variable after defining
let value = 5;
module.exports = value;

//  import module
const value = require("./sample.js");
console.log(value);


//  Exporting a value or an expression
module.exports = 5 * 3;

//  import module
const result = require("./sample.js");
console.log(result);


// Exporting a function while defining
module.exports = function (num1, num2) {
  return num1 + num2;
};

//  import module
const sum = require("./sample.js");
console.log(sum(2, 6));


//  Exporting a function after defining
function sum(num1, num2) {
  return num1 + num2;
}
module.exports = sum;

//  import module
const sum = require("./sample.js");
console.log(sum(2, 6));


// Exporting a class while defining
module.exports = class StudentDetails {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
};

//  import module
const StudentDetails = require("./sample.js");
const studentDetails = new StudentDetails("Ram", 15);
console.log(studentDetails);
console.log(studentDetails.name);

//  Exporting a class after defining
class studentDetails2 { 
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
};
module.exports = studentDetails2;

//  import module
const StudentDetails2 = require("./sample.js");
const studentDetails2 = new StudentDetails2("Ram", 15);
console.log(studentDetails2);
console.log(studentDetails2.name);



// ------------------------------------------------------------- named export

// Exporting multiple variables after defining
let value1 = 5;
exports.value1 = value1;
let studentName = "Rahul";
exports.studentName = studentName;

//  import module
const { value1, studentName } = require("./sample");
console.log(value1);
console.log(studentName);

// Exporting multiple values and expressions
let value3 = 2;
exports.sum = 2 + 3;
exports.sub = 3 - value3;

//  import module
const { sum, sub } = require("./sample");
console.log(sum);
console.log(sub);

// Exporting multiple functions while defining

exports.sum = function (num1, num2) {
  return num1 + num2;
};

exports.sub = function (num1, num2) {
  return num1 - num2;
}

//  import module
const { sum, sub } = require("./sample");
console.log(sum(2, 6));
console.log(sub(6, 2));


// Exporting multiple functions after defining

function sum(num1, num2) {
  return num1 + num2;
}

function sub(num1, num2) {
  return num1 - num2;
}

exports.sum = sum;
exports.sub = sub;

//  import module
const { sum, sub } = require("./sample");
console.log(sum(2, 6));
console.log(sub(6, 2));


//  Exporting multiple classes while defining
exports.carDetails = class carDetails {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
};

exports.bikeDetails = class bikeDetails {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
};

//  import module
const { carDetails, bikeDetails } = require("./sample");

const newcarDetails = new carDetails("Honda", 100000);
console.log(newcarDetails);
console.log(newcarDetails.name);

const newbikeDetails = new bikeDetails("Yamaha", 200000);
console.log(newbikeDetails);
console.log(newbikeDetails.price);


// Exporting multiple classes after defining


class StudentDetails {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}
exports.studentDetails = StudentDetails;

class CarDetails {
  constructor(name, age) {
    this.name = name;
    this.speed = age;
  }
}

exports.carDetails = CarDetails;

//  import module

const { studentDetails, carDetails } = require("./sample.js");

const newStudentDetails = new studentDetails("Ram", 15);
console.log(newStudentDetails);
console.log(newStudentDetails.name);

const newCarDetails = new carDetails("Alto", "60kmph");
console.log(newCarDetails);
console.log(newCarDetails.name);