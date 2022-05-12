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

const vehiculos = [] 

let opciones = {}

let claves = []

// If the HTTP-status is 200-299, then get the body
if (response.ok) { // si el HTTP-status es 200-299
	// obtener cuerpo de la respuesta (método debajo)
	
	const data = await response.text();
	console.log(data)

	let filas = data.split("\r\n")
	console.log(filas)

	claves = filas
		.shift()
		.split(",")
		.map(el => el.toLowerCase())
	
	for (let clave of claves) {
		opciones[clave] = []
	}

	for (let fila of filas){
		const valores = fila.split(",")

		var entries = claves.map((elemento, indice) => ([elemento, valores[indice]]));
		
		const vehiculo = Object.fromEntries(entries)
		vehiculos.push(vehiculo)
	}

  } else {
	alert("Error-HTTP: " + response.status);
};

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function listProperties() {
	let index = 0 

	for (let c of claves){
		console.log(`${index+1}`+". "+c)
		index++
	}

}

async function getUserInput () {
		
	listProperties()

	let filterOption =
		await rl.question(`Ingrese la opcion deseada`);

	filterOption = parseInt(filterOption);

	for (let vehiculo of vehiculos) {
		
		for (let key in opciones) {
			if (! opciones[key].includes(vehiculo[key])) {
				opciones[key].push(vehiculo[key])
			}
		}
	}

	function listOptions (userInput){
		const propiedad = claves[userInput-1]
		let indiceOp = 1

		console.log("Estas son las opciones para:", propiedad)

		for (let opcion of opciones[propiedad]) {
			console.log(`${indiceOp}`+" - "+opcion)
			indiceOp++
		}
	}

	if (filterOption == 0) {
		return
	}

	if (filterOption >= 1 && filterOption <= 6) {
		listOptions (filterOption)

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
