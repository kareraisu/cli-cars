#!/usr/bin/env node
import * as readlineCallBack from "node:readline";
import vehicleCollection from "./collection.js"
import {readData} from "./util.js"
import ENV from "./config.js"

const rl = readlineCallBack.createInterface({
	input: process.stdin,
	output: process.stdout,
});


//when done reading rl, exit program
rl.on("close", () => process.exit(0));


let collection
let options = {};
let tableHeaders = [];
let menuLevel = 0;


async function question(question, defaultAnswer) {
	return new Promise(function (resolve) {
		
		// This callBack is going to be called when the user press the Enter key
		rl.question(question, function(answer) {
			resolve(answer)
		});
		
		if (defaultAnswer){
			rl.write(defaultAnswer);
		}

	});
}


// This collects the options from the Vehicles into a global dictionary of lists
function collectOptions() {
	for (let vehicle of collection.vehicles) {
		for (let key in options) {
			if (!options[key].includes(vehicle[key])) {
				options[key].push(vehicle[key]);
			}
		}
	}
}

async function printAndGetInput(options) {
	let index = 0;

	const isInMainMenu = menuLevel == 0

	let selectedOption;

	console.log();
	console.log("Please select a filter")

	if (isInMainMenu) {
		console.log("Q. (Quit)");
		console.log("A. (Add)");
	} else {
		console.log("0. (Go back)");
	}

	// List the options
	for (let option of options) {
		console.log(`${index + 1}` + ". " + option);
		index++;
	}

	console.log();
	selectedOption = await question(`Enter a desired option: `);
	selectedOption = selectedOption.toLowerCase();

	// If the user input is not a number this will give a NaN
	if (ENV.ACTION_LIST.includes(selectedOption)) {
		return selectedOption;
	}

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

	const filteredVehicles = collection.getVehicles(property, selectedOption)

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

	await chooseVehicle(filteredVehicles)

}

async function chooseVehicle(arrayOfVehicles = []) {
	// Get the id of Vehicle
	let chosenVehicleId;
	let isNumber

	do {
		chosenVehicleId = await question(`Select a vehicle`);
		chosenVehicleId = parseInt(chosenVehicleId);
		
	} while (chosenVehicleId > arrayOfVehicles.length );

	//chosenVehicleId > arrayOfVehicles.length
	chosenVehicleId -= 1;

	console.log("The selected vehicle is:", arrayOfVehicles[chosenVehicleId]);

	await chooseAction(chosenVehicleId)

}

async function chooseAction(vehicleId){
	let action;
	let isValidAction = false

	while (!isValidAction) {
		action = await question(`
What would you like to do?
0. Go Back
D. Delete
E. Edit
Q. Quit

Enter a desired option: `);

		action = action.toLowerCase();

		switch (action) {
			case "q":
				rl.close();
				isValidAction = true
				break;

			case "0":
				return;

			case "d":
				collection.deleteVehicle(vehicleId);
				// This will get us back to the Main menu
				menuLevel = 0
				isValidAction = true
				break;

			case "e":
				const updatedVehicle = await mutateVehicle(vehicleId)
				await collection.editVehicle(vehicleId, updatedVehicle);
				// This will get us back to the Main menu
				menuLevel = 0
				isValidAction = true
				break;

			default:
				console.log(`The option entered is not valid.`);
				
		}

	}
}

async function mutateVehicle (carId){
	// Get the user input according to the Tableheaders (marca, modelo, año ,motor, tipo ,proposito)
	console.log(
		"Then the system will request the characteristics of the vehicle"
	);

	let car

	try{
		car = carId !== undefined ? collection.findVehicle(carId) : {}
	}
	catch(error){
		return
	}
	
	for (let key of tableHeaders) {
		
		const answer = await question(`Please provide a value for ${key}:`, car[key])
		car[key] = answer
		
	}	
	return car
}

async function main() {
	//await fetchData();

	const {elements: vehicles, tableHeaders: headers} = await readData();

	tableHeaders = headers

	collection = new vehicleCollection({vehicles, headers})

	for (let header of tableHeaders) {
		options[header] = [];
	}

	collectOptions();

	console.log();
	console.log("Hello! Welcome to Ed's Car Catalog.");

	let property;

	// Main loop
	while (true) {
		if (menuLevel == 0) {
			// Show headers
			const userInput = await printAndGetInput(tableHeaders);

			switch (userInput) {
				case "a":
					const newVehicle = await mutateVehicle()
					await collection.addVehicle(newVehicle);
					break;

				case "q":
					rl.close();
					break;

				default:
					property = tableHeaders[userInput - 1];
					console.log("These are the options for:", property);
			}
		}

		let selectedOption = await printAndGetInput(options[property]);
		// We decrement to be 0-indexed
		selectedOption = selectedOption - 1;
		const value = options[property][selectedOption];

		await listFilteredVehicles(property, value);
		

	}
}

// Execute the main function
main();