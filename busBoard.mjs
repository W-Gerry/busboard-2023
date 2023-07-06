// Import fetch module to use with API
// Acts asynchronously so code to use this must be in a function
import fetch from 'node-fetch';


// Define key variables for retrieving bus data
const stopCode = "490008660N";


// Main function for displaying BusBoard
// async denotes that this function contains code which can be run in the background
async function busBoard(arrivalData) {
    const arrivalPredictions = await getArrivals(stopCode);
    displayArrivals(arrivalPredictions);
}


// Function to retrieve buss arrival data 
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