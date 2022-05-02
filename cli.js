#!/usr/bin/env node
import * as readline from 'node:readline/promises';

// Obtener los datos, un CSV
// 1 como hacer la request
// - Que sucede si no tengo conexion?. Manejar los errores.
// 2 Como convertir un CSV a un JSON
// 3 Ver como filtar segun las opciones

let URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXhp9bt3GgfL0ZwpC05_DOH2eIAK4ojTTXKdg_tdl9Gg07TFZnbKI8lsNtLJ14EaI218cyu23f25LE/pub?gid=0&single=true&output=csv"

let response = await fetch(URL)

let data = await response.text()

console.log(data)


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

		if (filterOption >= 1 && filterOption <= 6) {
			switch (filterOption) {
				case 1:
					console.log("Filter by BRAND");
					break;
				case 2:
					// code block
					console.log("Filter by MODEL");
					break;
				case 3:
					// code block
					console.log("Filter by YEAR");
					break;
				case 4:
					// code block
					console.log("Filter by MOTOR/ENGINE");
					break;
				case 5:
					// code block
					console.log("Filter by TYPE");
					break;
				case 6:
					// code block
					console.log("Filter by PURPOSE");
					break;
				default:
					// code block
					console.log("VER Como tratar otras opciones");
			}
		} else {
			filterOption = await rl.question(`Elegi una opcion entre 1 y 6`)
		}

		rl.close();
	} catch (e) {
		console.error("unable to rl.question", e);
	}
})();

//when done reading rl.question exit program
rl.on("close", () => process.exit(0));
