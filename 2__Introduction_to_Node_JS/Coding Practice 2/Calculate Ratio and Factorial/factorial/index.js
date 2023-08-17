const factorial = (num) => {
  let result = 1;
  while (num !== 0) { 
    result *= num--;
  }
  return result;
}

module.exports = factorial;