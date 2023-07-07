// Import fetch module to use with API
import fetch from 'node-fetch';
import * as readline_sync from "readline-sync";



// Define key variables for retrieving bus data
const stopCode = "490008660N";
const userPostcode = "SE7 7FH"


// Main function for displaying BusBoard
// async denotes that this function contains code which can be run in the background
async function busBoard() {
    const coordData = await retrievePostcodeData(userPostcode);
    displayLongLat(coordData, userPostcode);

    const arrivalPredictions = await getArrivals(stopCode);
    displayArrivals(arrivalPredictions);
}


// Function to retrieve long and lat from postcode
async function retrievePostcodeData(userPostcode) {
    const postcodeResponse = await fetch(`https://api.postcodes.io/postcodes/${userPostcode}`);
    const postcodeData = await postcodeResponse.json();

    return postcodeData;
}


// Function to display the coordinate data
function displayLongLat(coordData, userPostcode) {
    console.log(`The longitude of your postcode (${userPostcode}) is ${coordData.result.longitude} and the latitude is ${coordData.result.latitude}`);
}


// Function to retrieve bus arrival data 
// async denotes that this function contains code which can be run in the background
async function getArrivals(stopCode) {
    const arrivalsResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopCode}/Arrivals`)
    const arrivalData = await arrivalsResponse.json();

    return arrivalData;
}


// Function to print bus data
function displayArrivals(arrivalPredictions) {
    for (let i = 0; i < arrivalPredictions.length; i++) {
        const prediction = arrivalPredictions[i];
        console.log(`\nBus number ${prediction.lineName} to ${prediction.destinationName} will arrive in approximately ${Math.floor(prediction.timeToStation/60)} minutes.`);
    }
}


// Run the main function
busBoard();