import fs from 'fs'

const filePath = '/Users/bts-041/Documents/JavaScript/vehicles.csv'

const callBack = (err,data) => {
    if (err) {
      return console.log(err);
    }
    console.log(data);
  }

  
  let promise = new Promise(function(resolve, reject) {
      // executor (the producing code, "singer")
      fs.readFile(filePath, 'utf8', callBack);
  });