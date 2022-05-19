#!/usr/bin/env node
import * as readline from 'node:readline/promises';

// Obtener los datos, un CSV
// 1 como hacer la request
// - Que sucede si no tengo conexion?. Manejar los errores.
// 2 Como convertir un CSV a un JSON
// 3 Ver como filtar segun las opciones

const URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXhp9bt3GgfL0ZwpC05_DOH2eIAK4ojTTXKdg_tdl9Gg07TFZnbKI8lsNtLJ14EaI218cyu23f25LE/pub?gid=0&single=true&output=csv"

// Get the CVS
const response = await fetch(URL)

const vehicles = [] 

let options = {}

let keys = []

let property 

// If the HTTP-status is 200-299, then get the body
if (response.ok) { // si el HTTP-status es 200-299
	// obtener cuerpo de la respuesta (método debajo)
	
	const data = await response.text();
	console.log(data)

	let rows = data.split("\r\n")
	console.log(rows)

	keys = rows
		.shift()
		.split(",")
		.map(el => el.toLowerCase())
	
	for (let key of keys) {
		options[key] = []
	}

	for (let row of rows){
		const values = row.split(",")

		var entries = keys.map((element, indice) => ([element, values[indice]]));
		
		const vehicle = Object.fromEntries(entries)
		vehicles.push(vehicle)
	}

	//console.log("Mis vehiculos son: ", vehicles)

  } else {
	alert("Error-HTTP: " + response.status);
};

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function listProperties() {
	let index = 0 

	for (let c of keys){
		console.log(`${index+1}`+". "+c)
		index++
	}

}

async function getUserInput () {
		
	listProperties()

	let filterOption =
		await rl.question(`Enter a desired option:`);

	filterOption = parseInt(filterOption);

	for (let vehicle of vehicles) {
		
		for (let key in options) {
			if (! options[key].includes(vehicle[key])) {
				options[key].push(vehicle[key])
			}
		}
	}

	// Here we list the options for the option entered
	async function listOptions (userInput){
		property = keys[userInput-1]
		let optionIndex = 1

		console.log("These are the options for:", property)

		for (let option of options[property]) {
			console.log(`${optionIndex}`+" - "+option)
			optionIndex++
		}

		// Aqui debería llamar a mi funcion en donde consulta si quiere listar por marca, modelo o salir con 0
		let getNewOption = await rl.question(`Please enter a DESIRED option to list the vehicles`);
		
		//Add the sanity check - Create a function for the Sanity Check - Pasar el conjunto de posibles respuestas validas y la pregunta al usuario
		let newOption = parseInt(getNewOption);
		newOption = newOption-1

		let optionString = options[property][newOption]

		listFilteredVehicle(optionString)

	}

	// Here list again the vehicle/s according a new option entered
	function listFilteredVehicle (optionSelected){
		
		if (optionSelected == undefined) {
			console.log("The option entered is not valid, it is not in the set of valid options")
			return

		}
		
		const filteredVehicles = vehicles.filter(vehicle => vehicle[property] == optionSelected)

		//console.log("ESTOS SON	", filteredVehicles)
		// listar los vehiculos, imprimir mas corto: marca, modelo y año
		
		let optionIndex = 1

		console.log("The vehicles are:")

		for (let vehicle of filteredVehicles){
			console.log(`${optionIndex}`+" - " , vehicle[keys[0]], vehicle[keys[1]], vehicle[keys[2]])
			optionIndex++
		}

	}


	// Here the application finishes if user input a Cero
	if (filterOption == 0) {
		return
	}

	if (filterOption >= 1 && filterOption <= 6) {
		await listOptions (filterOption)

	} else {
		console.log(`
		La opción ingresada no es válida.
		Las opciones disponibles son:`)

		// Here we recurse
		await getUserInput()
		
		// TODO solve if the input is not between 1 & 6
		// If the user introduces the number 0, the application should finish
		// If the option entered the application should validate the input and ask again until the user introduce a correct option
	}

}

//usage inside aync function do not need closure demo only*
(async () => {
	
	console.log("Hola soy catalogo de auto, los filtros que se pueden aplicar son:")
		
 	await getUserInput()

	rl.close();
	
})();

//when done reading rl.question exit program
rl.on("close", () => process.exit(0));
