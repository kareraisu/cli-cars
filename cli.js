#!/usr/bin/env node
import * as readline from "node:readline/promises";

// Obtener los datos, un CSV
// 1 como hacer la request
// - Que sucede si no tengo conexion?. Manejar los errores.
// 2 Como convertir un CSV a un JSON
// 3 Ver como filtar segun las opciones

const URL =
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vRXhp9bt3GgfL0ZwpC05_DOH2eIAK4ojTTXKdg_tdl9Gg07TFZnbKI8lsNtLJ14EaI218cyu23f25LE/pub?gid=0&single=true&output=csv";

// Get the CVS
const response = await fetch(URL);

const vehicles = [];

let options = {};

let tableHeaders = [];

let menuLevel;

// If the HTTP-status is 200-299, then get the body
if (response.ok) {
	// si el HTTP-status es 200-299
	// obtener cuerpo de la respuesta (método debajo)

	const data = await response.text();
	console.log(data);

	let rows = data.split("\r\n");
	console.log(rows);

	tableHeaders = rows
		.shift()
		.split(",")
		.map((el) => el.toLowerCase());

	for (let header of tableHeaders) {
		options[header] = [];
	}

	for (let row of rows) {
		const values = row.split(",");

		var entries = tableHeaders.map((element, indice) => [
			element,
			values[indice],
		]);

		const vehicle = Object.fromEntries(entries);
		vehicles.push(vehicle);
	}

	//console.log("Mis vehiculos son: ", vehicles)
} else {
	alert("Error-HTTP: " + response.status);
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function printAndGetInput(options, isInMainMenu) {
	let index = 0;

	let selectedOption;

	console.log();

	if (isInMainMenu) {
		console.log("0. (Exit)");
	} else {
		console.log("0. (Go back)");
	}

	for (let option of options) {
		console.log(`${index + 1}` + ". " + option);
		index++;
	}

	console.log();
	selectedOption = await rl.question(`Enter a desired option:`);

	// If the user input is not a number this will give a NaN
	selectedOption = parseInt(selectedOption);

	if (selectedOption == 0) {
		if (isInMainMenu) {
			// Finalize the program
			process.exit();
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

		// Here we recurse (AND we need to return the value else we lose it)
		return await printAndGetInput(options, isInMainMenu);
	}
}

// Here list again the vehicle/s according a new option entered
async function listFilteredVehicle(property, optionSelected) {
	if (optionSelected == undefined) {
		console.log(
			"The option entered is not valid, it is not in the set of valid options"
		);
		return;
	}

	const filteredVehicles = vehicles.filter(
		(vehicle) => vehicle[property] == optionSelected
	);

	let optionIndex = 1;

	console.log();
	console.log("The vehicles are:");
	console.log();

	for (let vehicle of filteredVehicles) {
		console.log(
			`${optionIndex}` + ".",
			vehicle[tableHeaders[0]],
			vehicle[tableHeaders[1]],
			vehicle[tableHeaders[2]]
		);
		optionIndex++;
	}

	console.log();
	console.log("E. (Exit)");

	let exit = 1;

	exitOrGoBack:
	while (exit != "0" || exit != "e") {
		exit = await rl.question(`Enter a desired option:`);

		exit = exit.toLowerCase();

		if (exit == "e") {
			process.exit();
		}

		if (exit == "0") {
			break exitOrGoBack
		} else {
			console.log(`
			The option entered is not valid.
			The options are:
			O. Go Back
			E. Exit`);
		}
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

//usage inside aync function do not need closure demo only
(async () => {
	collectOptions();

	menuLevel = 0;

	console.log(
		"Hola soy catalogo de auto, los filtros que se pueden aplicar son:"
	);

	let property;

	while (true) {
		if (menuLevel == 0) {
			// Show headers
			const userInput = await printAndGetInput(tableHeaders, true);

			// userInput
			property = tableHeaders[userInput - 1];

			console.log("These are the options for:", property);
		}

		let newOptionSelected = await printAndGetInput(options[property]);

		// We decrement to be 0-indexed
		newOptionSelected = newOptionSelected - 1;

		const optionString = options[property][newOptionSelected];

		listFilteredVehicle(property, optionString);
	}

	rl.close();
})();

//when done reading rl.question exit program
rl.on("close", () => process.exit(0));
