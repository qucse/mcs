// retrieve all the required libraries
const fse = require('fs-extra'),
  mongoose = require('mongoose'),
  Stop = require('./models/stops'),
  basePath = './rawData/';

// Connect the script to the local database
mongoose.connect('mongodb://localhost:27017/gtfs', { useNewUrlParser: true });

/**
 * function to read a passed file, and return the raw data inside that file
 *
 * @param {*} filename
 * @author Abdelmonem Mohamed
 */
async function readLineByLine(filename) {
  try {
    let data = await fse.readFile(basePath + filename + '.txt');
    return data.toString().split('\n');
  } catch (error) {
    return error;
  }
}

/**
 * a function that return an object, according to the passed headers and data from the line
 *
 *
 * @param {*} headers
 * @param {*} line
 * @author Abdelmonem Mohamed
 */
function returnOneObject(headers, line) {
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

/**
 * a function that return all that objects inside a passed file
 *
 * @param {*} filename
 * @author Abdelmonem Mohamed
 */
async function returnAllObjects(filename) {
  let data = [];
  let raw = await readLineByLine(filename);
  let headers = raw.shift().split(',');
  raw.forEach(entity => {
    data.push(returnOneObject(headers, entity.split(',')));
  });
  return data;
}

/**
 * a function that adds the data from a passed filename to the MongoDB 
 * 
 * @param {*} filename 
 * @author Abdelmonem Mohamed
 */
async function addToDatabase(filename) {
  try {
    let data = await returnAllObjects(filename);
    let model = require(`./models/${filename}.js`);
    data.forEach(async entity => await model.create(entity));
    return 'success';
  } catch (error) {
    return error;
  }
}

/**
 * the main function that performs all the important methods to perform the wanted operation
 * 
 * @param {*} files
 * @author Abdelmonem Mohamed 
 */
async function main(files) {
  try {
    files.forEach(async file => {
      let message = await addToDatabase(file);
      console.log(message);
    });
  } catch (error) {
    console.log(error);
  }
}

// Testing the script
let files = ['stops', 'agency', 'routes', 'shapes', 'calendar', 'trips'];
main(files);
