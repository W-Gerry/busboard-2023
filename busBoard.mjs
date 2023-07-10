// Import fetch module to use with API
import fetch from 'node-fetch';
// Import readline-sync module to get user input
import * as readline_sync from "readline-sync";
// Import winston for error logging
import * as winston from "winston";


// Create logger for error handling/logging
const logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'combined.log' })
    ]
});


// Main function for displaying BusBoard
// async denotes that this function contains code which can be run in the background
async function busBoard() {

    // Define key variables for retrieving bus data
    const userPostcode = getUserPostcode();
    // const searchRadius = readline_sync.question("Please enter a search radius in 'm': ")

    // Default values for debugging
    const searchRadius = "300";
    // const userPostcode = "se77fh"

    // Get latitude and longitude from given postcode
    const coordData = await retrievePostcodeData(userPostcode);

    // Get local stop points within given radius from postcode
    const localStopPoints = await getLocalStopPoints(coordData, searchRadius, userPostcode);

    // Get the closest stop points from sorting local stop points by distance
    const closestStopPoints = sortLocalStopPoints(localStopPoints);

    // Display next arrivals for the closest stop points
    showClosestArrivals(closestStopPoints);
}


function getUserPostcode() {

    return readline_sync.question("Please enter your Postcode: ").toUpperCase();
}


// Function to retrieve long and lat from postcode
async function retrievePostcodeData(userPostcode) {
    // API query to return location data for a given postcode
    const postcodeResponse = await fetch(`https://api.postcodes.io/postcodes/${userPostcode}`);
    
    if (!postcodeResponse.ok) {
        logger.info(`Error retrieving coordinate data from postcode: ${userPostcode}`)
        process.exit(1);
    }
    
    const postcodeData = await postcodeResponse.json();

    // Return object containing lat and long data
    return {
        latitude: postcodeData.result.latitude,
        longitude: postcodeData.result.longitude,
    };
}


// Function to get StopPoints in radius from lat and long data and sort by distance
async function getLocalStopPoints(coordData, searchRadius, userPostcode) {
    // API query to retrieve stop points in a given radius from defined lat and long values
    const stopPointsResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${coordData.latitude}&lon=${coordData.longitude}&stopTypes=NaptanPublicBusCoachTram&radius=${searchRadius}`);
   
    // Error logging if API response does not return a 2## response code
    if (!stopPointsResponse.ok) {
        logger.info(`Error retrieving local stop points within radius: ${searchRadius}m of Postcode: ${userPostcode}`)
        process.exit(1);
    }

    // Extract array of stop point objects from API response
    const result = await stopPointsResponse.json();

    // Error logging if empty array is returned as result
    if (result.stopPoints.length === 0) {
        logger.info(`No local stop points within Radius: ${searchRadius}m of Postcode: ${userPostcode}`)

        process.exit(1);
    }

    return result;
}


function sortLocalStopPoints(localStopPoints) {
    const stopPoints = localStopPoints.stopPoints;
    // Arrow function to sort found local stop points by distance
    stopPoints.sort((stopPointA, stopPointB) => stopPointA.distance - stopPointB.distance);
    return stopPoints;
}


// Function to retrieve bus arrival data for closest 5 bus stops
// async denotes that this function contains code which can be run in the background
async function showClosestArrivals(closestStopPoints) {
    // Loop through closest stop points
    for (let i = 0; i < closestStopPoints.length && i < 5; i++) {
        // API query to retrieve upcoming arrivals for current stop point ID
        const arrivalsResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/${closestStopPoints[i].naptanId}/Arrivals`)
        const arrivalData = await arrivalsResponse.json();

        // Sort upcoming arrivals by time until arrival
        arrivalData.sort((arrivalA, arrivalB) => arrivalA.timeToStation - arrivalB.timeToStation);

        // Print the stop point name and direction of the route
        console.log(`Next departures from ${arrivalData[0].stationName} towards ${arrivalData[0].towards}:`);
        // Loop through upcoming arrivals and print info to screen
        for (let j = 0; j < arrivalData.length; j++) {
            const nextArrival = arrivalData[j];
            console.log(`Bus number ${nextArrival.lineName} to ${nextArrival.destinationName} will arrive in approximately ${Math.floor(nextArrival.timeToStation/60)} minutes.`);
        }

        // Add a line break to separate each stop point
        console.log(`\n`);
    } 
}


// Run the main function
busBoard();