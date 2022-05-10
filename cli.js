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


//usage inside aync function do not need closure demo only*
(async () => {
	try {
		let filterOption =
			await rl.question(`Hola soy catalogo de auto, que filtros dease aplicar
		1. Brand
		2. Model
		3. Year
		4. Motor/engine
		5. Type
		6. Purpose
`);
		filterOption = parseInt(filterOption);

		for (let vehiculo of vehiculos) {
			
			for (let key in opciones) {
				if (! opciones[key].includes(vehiculo[key])) {
					opciones[key].push(vehiculo[key])
				}
			}
		}

		function listarOpciones (userInput){
			const propiedad = claves[userInput-1]
			let indiceOp = 1

			console.log("Estas son las opciones para:", propiedad)

			for (let opcion of opciones[propiedad]) {
				console.log(`${indiceOp}`+" - "+opcion)
				indiceOp++
			}
		}


		if (filterOption >= 1 && filterOption <= 6) {
			listarOpciones (filterOption)

		} else {
			filterOption = await rl.question(`Elegi una opcion entre 1 y 6`)
			// TODO solve if the input is not between 1 & 6 
		}

		rl.close();
	} catch (e) {
		console.error("unable to rl.question", e);
	}
})();

//when done reading rl.question exit program
rl.on("close", () => process.exit(0));
