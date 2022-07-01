#!/usr/bin/env node
import * as readline from "node:readline";
import Collection from "./collection.js"
import ENV from "./config.js"


const rl = readline.createInterface({
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
		
		// This callBack is going to be called when the user presses the Enter key
		rl.question(question, function(answer) {
			resolve(answer)
		});
		
		if (defaultAnswer){
			rl.write(defaultAnswer);
		}

	});
}

// This collects the values from the elements into a global dictionary of lists
function collectOptions() {
	tableHeaders = collection.headers

	for (let element of collection.elements) {
		for (let property of tableHeaders) {
			if (!options[property]) {
				// Initialize the list (this will happen for the first element)
				options[property] = []
			}
			const value = element[property]
			if (!options[property].includes(value)) {
				options[property].push(value)
			}
		}
	}
}

async function printAndGetInput(options) {

	const isInMainMenu = menuLevel == 0

	console.log();

	if (isInMainMenu) {
		console.log("Q. (Quit)");
		console.log("A. (Add)");
	} else {
		console.log("0. (Go back)");
	}

	// List the options
	let index = 0;
	for (let option of options) {
		console.log(`${index + 1}` + ". " + option);
		index++;
	}
	console.log();

	let selectedOption = await question(`Please select an option: `);
	selectedOption = selectedOption.toLowerCase();

	if (ENV.ACTION_LIST.includes(selectedOption)) {
		return selectedOption;
	}
	
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

async function listFilteredElements(property, value) {
	if (value == undefined) {
		console.log("The option entered is not valid");
		return;
	}

	const filteredElements = collection.get(property, value)

	let optionIndex = 1;
	for (let element of filteredElements) {
		console.log(
			`${optionIndex}` + ".",
			element[tableHeaders[0]],
			element[tableHeaders[1]],
			element[tableHeaders[2]]
		);
		optionIndex++;
	}

	await chooseItem(filteredElements)
}

async function chooseItem(items = []) {
	let chosenItem;

	do {
		console.log()
		chosenItem = await question(`Please select an item: `);
		chosenItem = parseInt(chosenItem);
	}
	while (chosenItem > items.length);

	const element = items[chosenItem - 1] // We need to decrement to be 0-indexed

	console.log()
	console.log("The selected item is:", element);

	await chooseAction(element.id)
}

async function chooseAction(elementId){
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
				await collection.delete(elementId);
				menuLevel = 0 // This will get us back to the Main menu
				isValidAction = true // Exit loop
				break;

			case "e":
				const updatedElement = await mutateElement(elementId)
				await collection.update(elementId, updatedElement);
				menuLevel = 0
				isValidAction = true
				break;

			default:
				console.log(`The option entered is not valid.`);
		}

	}
}

async function mutateElement(id) {
	let element
	try {
		element = id !== undefined ? collection.find(id) : {}
	}
	catch(error){
		return
	}
	
	for (let property of tableHeaders) {
		// Get the user input for each property, providing the current value as default
		const value = await question(`Please provide a value for ${property}: `, element[property])
		element[property] = value
	}

	return element
}

async function main() {

	collection = await Collection.init()

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
					const newVehicle = await mutateElement()
					await collection.add(newVehicle);
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

		const value = options[property][selectedOption - 1]; // We need to decrement to be 0-indexed

		await listFilteredElements(property, value);
	}
}

// Execute the main function
main();