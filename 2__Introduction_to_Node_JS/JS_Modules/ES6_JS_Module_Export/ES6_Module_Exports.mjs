// -------------------------------------------------------------------Default  export
const add = (a, b) => a + b;
export default add;

// Exporting a variable after defining
let a = 5;
export default a;

//import
import a from "./sample.mjs";
console.log(a);

//  Exporting a value or an expression
export default 5 * 3;

//import
import b from "./sample.mjs";
console.log(b);

// Exporting a function while defining
export default function (num1, num2) {
  return num1 + num2;
};

//import
import sum from "./sample.mjs";
console.log(sum(2, 6));

// Exporting a function after defining
function sum(num1, num2) {
  return num1 + num2;
}
export default sum;

//import
import sum from "./sample.mjs";
console.log(sum(2, 6));

//  Exporting a class while defining
export default class StudentDetails {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
};

//import
import StudentDetails from "./sample.mjs";
const studentDetails = new StudentDetails("Ram", 15);
console.log(studentDetails);
console.log(studentDetails.name);


// Exporting a class after defining
class CarDetails {
  constructor(brand, price) {
    this.brand = brand;
    this.price = price;
  }
};

export default CarDetails;

//import
import CarDetails from "./sample.mjs";
const carDetails = new CarDetails("BMW", 500000);
console.log(carDetails);
console.log(carDetails.brand);



// -------------------------------------------------------------------named export

// Exporting multiple variables while defining
export let value = 5;
export let studentName = "Rahul";

//import
import { value, studentName } from "./sample.mjs";
console.log(value);
console.log(studentName);


// Exporting multiple variables after defining
let value3 = 5;
const studentName1 = "Rahul";
export { value3, studentName1 };

//import
import { value3, studentName1 } from "./sample.mjs";
console.log(value3);
console.log(studentName1);

// Exporting multiple functions while defining
export function sum(num1, num2) {
  return num1 + num2;
}

export function sub(num1, num2) {
  return num1 - num2;
}

//import
import { sum, sub } from "./sample.mjs";
console.log(sum(2, 6));
console.log(sub(2, 6));

// Exporting multiple functions after defining

function sum(num1, num2) {
  return num1 + num2;
}
function sub(num1, num2) {
  return num1 - num2;
}
export { sum, sub };

//import
import { sum, sub } from "./sample.mjs";
console.log(sum(2, 6));
console.log(sub(2, 6));

// Exporting multiple classes while defining
export class CarDetails {
  constructor(brand, price) {
    this.brand = brand;
    this.price = price;
  }
};
export class StudentDetails {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
};

//import
import { CarDetails, StudentDetails } from "./sample.mjs";
const carDetails = new CarDetails("BMW", 500000);
console.log(carDetails);
console.log(carDetails.brand);

const studentDetails = new StudentDetails("Ram", 15);
console.log(studentDetails);
console.log(studentDetails.name);

//  Exporting multiple classes after defining
class CarDetails {
  constructor(brand, price) {
    this.brand = brand;
    this.price = price;
  }
}
class StudentDetails {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

export { CarDetails, StudentDetails };

//import
import { CarDetails, StudentDetails } from "./sample.mjs";
const carDetails = new CarDetails("BMW", 500000);
console.log(carDetails);
console.log(carDetails.brand);
const studentDetails = new StudentDetails("Ram", 15);
console.log(studentDetails);
console.log(studentDetails.name);