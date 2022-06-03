#!/usr/bin/env node
import * as readline from "node:readline/promises";
import fs from 'fs'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
//when done reading rl, exit program
rl.on("close", () => process.exit(0));

const URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXhp9bt3GgfL0ZwpC05_DOH2eIAK4ojTTXKdg_tdl9Gg07TFZnbKI8lsNtLJ14EaI218cyu23f25LE/pub?gid=0&single=true&output=csv";
const vehicles = [];
let options = {};
let tableHeaders = [];
let menuLevel = 0;

const filePath = '/Users/bts-041/Documents/JavaScript/vehicles.csv'

function readFilePromise(filePath) {
	
	return new Promise(function(resolve, reject) {
		// executor (the producing code, "singer")
		fs.readFile(filePath, 'utf8', (err,data) => {
			if (err) {
			 reject(err)
			}
			resolve(data) 
		});
	});

}

function parseCSV(data) {
	
	let rows = data.split("\r\n");
	tableHeaders = rows
		.shift()
		.split(",")
		.map((el) => el.toLowerCase());

	for (let header of tableHeaders) {
		options[header] = [];
	}

	let indexId = 0
	for (let row of rows) {
		const values = row.split(",");

		var entries = tableHeaders.map((element, indice) => [
			element,
			values[indice],
		]);

		const vehicle = Object.fromEntries(entries);
		vehicle.id = indexId 
		
		vehicles.push(vehicle);
		
		indexId += 1
	}
}

// Read data from File System
async function readData(){
	const data = await readFilePromise(filePath)
	
	parseCSV(data)
}

async function fetchData() {
	const response = await fetch(URL);
	// If the HTTP-status is 200-299, then get the body
	if (response.ok) {
		const data = await response.text();

		parseCSV(data)

	} else {
		console.error("Failed to fetch data: " + response.status);
		rl.close();
	}
}

// This collects the options from the Vehicles into a global dictionary of lists
function collectOptions() {
	for (let vehicle of vehicles) {
		for (let key in options) {
			if (!options[key].includes(vehicle[key])) {
				options[key].push(vehicle[key]);
			}
		}
	}
}

async function printAndGetInput(options, isInMainMenu) {
	let index = 0;

	let selectedOption;

	console.log();

	if (isInMainMenu) {
		console.log("Q. (Quit)");
	} else {
		console.log("0. (Go back)");
	}

	for (let option of options) {
		console.log(`${index + 1}` + ". " + option);
		index++;
	}

	console.log();
	selectedOption = await rl.question(`Enter a desired option: `);

	// If the user input is not a number this will give a NaN
	selectedOption = parseInt(selectedOption);

	if (selectedOption == 0) {
		if (isInMainMenu) {
			// Finalize the program
			rl.close();
		} else {
			menuLevel = 0;
			return selectedOption;
		}
		
	}	


	if (selectedOption <= options.length) {
		// Increment Menu counter
		menuLevel = 1;
		return selectedOption;
	} else {
		console.log(`
The option entered is not valid.
The options are:`);

		// Here we recurse (AND we need to return the value, or else we lose it)
		return await printAndGetInput(options, isInMainMenu);
	}
}

async function listFilteredVehicles(property, selectedOption) {
	if (selectedOption == undefined) {
		console.log(
			"The option entered is not valid, it is not in the set of valid options"
		);
		return;
	}

	const filteredVehicles = vehicles.filter(
		(vehicle) => vehicle[property] == selectedOption
	);

	console.log();
	console.log("The vehicles are:");
	console.log();
	
	let optionIndex = 1;
	for (let vehicle of filteredVehicles) {
		console.log(
			`${optionIndex}` + ".",
			vehicle[tableHeaders[0]],
			vehicle[tableHeaders[1]],
			vehicle[tableHeaders[2]]
		);
		optionIndex++;
		
	}

	let exit;

	while (true) {
		exit = await rl.question(`
What would you like to do?
0. Go Back
D. Delete
E. Edit
Q. Quit

Enter a desired option: `);

		exit = exit.toLowerCase();

		if (exit == "q") {
			rl.close();
		}

		if (exit == "0") {
			return
		}

		// Acá llamar a la función de eliminar
		switch(exit){
			case "d": chooseVehicle(filteredVehicles)//Call Delete Function with the parameter "filteredVehicles"
			break;

			case "e": //Call Edit Function
			break;
		}

		console.log(`The option entered is not valid.`);
	}
}

async function chooseVehicle(arrayOfVehicles = []){
	// Get the id of Vehicle
	let vehicleChosen

	do {
	
	vehicleChosen = await rl.question(`What's the vehicule?`)
	vehicleChosen = parseInt(vehicleChosen)

	} while ( vehicleChosen > arrayOfVehicles.length() )
	
	vehicleChosen -= 1

	deleteVehicle(arrayOfVehicles[vehicleChosen]?.id)

}

function deleteVehicle(id){
	// Search for the vechicle in Vechiles and remove it
	
	
	vehicles = vehicles.filter(
		(vehicle) => vehicle.id !== id
	)
	
	// Inverse of Parse
	

	// Persist the changes in the File System
}

async function main() {
	//await fetchData();

	await readData()

	collectOptions();

	console.log();
	console.log(
		"Hello! Welcome to Ed's Car Catalog. Please select a filter:"
	);

	let property;

	// Main loop
	while (true) {
		if (menuLevel == 0) {
			// Show headers
			const userInput = await printAndGetInput(tableHeaders, true);
			property = tableHeaders[userInput - 1];
			console.log("These are the options for:", property);
		}

		let selectedOption = await printAndGetInput(options[property]);
		// We decrement to be 0-indexed
		selectedOption = selectedOption - 1;
		const value = options[property][selectedOption];

		await listFilteredVehicles(property, value);
	}
};

// Execute the main function
main()
