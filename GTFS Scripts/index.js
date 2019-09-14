// retrieve all the required libraries
const fse = require('fs-extra'),
  basePath = './rawData/';

// function to read the file, and return the raw data
async function readLineByLine(filename) {
  try {
    let data = await fse.readFile(basePath + filename + '.txt');
    return data.toString().split('\n');
  } catch (error) {
    return error;
  }
}

function returnObject(headers, line) {
  try {
    let object = {};
    for (let k of headers) {
      object[k] = line[headers.indexOf(k)];
    }
    return object;
  } catch (error) {
    return error;
  }
}

async function returnAllObjects(filename) {
  let data = [];
  let raw = await readLineByLine(filename);
  let headers = raw.shift().split(',');
  raw.forEach(entity => {
    data.push(returnObject(headers, entity.split(',')));
  });
  return data;
}

returnAllObjects('routes').then(value => console.log(value));
