import ENV from "./config.js";
import fs from "fs";



export async function readFilePromise(filePath) {
	return new Promise(function (resolve, reject) {
		// executor (the producing code, "singer")
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
}

export async function writeFilePromise(filePath, content) {
	return new Promise(function (resolve, reject) {
		fs.writeFile(filePath, content, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
}

// Read data from File System
export async function readData() {
	const data = await readFilePromise(ENV.FILE_PATH);

	const { tableHeaders, elements } = parseCSV(data);

	return { tableHeaders, elements };
}

export async function fetchData() {
	const response = await fetch(ENV.URL);
	// If the HTTP-status is 200-299, then get the body
	if (response.ok) {
		const data = await response.text();

		parseCSV(data);
	} else {
		console.error("Failed to fetch data: " + response.status);
		rl.close();
	}
}

export function parseCSV(data) {
	const elements = []

	const rows = data.split(ENV.LINE_SEPARATOR);
	const tableHeaders = rows
		.shift()
		.split(",")
		.map((el) => el.toLowerCase());

	let indexId = 0;
	for (let row of rows) {
		const values = row.split(",");

		var entries = tableHeaders.map((element, indice) => [
			element,
			values[indice],
		]);

		const element = Object.fromEntries(entries);
		element.id = indexId;

		elements.push(element);

		indexId += 1;
	}

	// By default is returning internally as dictionry {key: value}.
	// Ex: { tableHeaders: tableHeaders, elements: elements };
	return { tableHeaders, elements };
}

export async function persistCSV(headers, elements) {
	let csvLines = elements.map(function (vehicle) {
		let cvsLine = [];

		for (let header of headers) {
			cvsLine.push(vehicle[header]);
		}

		cvsLine = cvsLine.join();

		return cvsLine;
	});

	csvLines.unshift(headers.join());

	csvLines = csvLines.join(ENV.LINE_SEPARATOR);

	// Persist the changes in the File System
	await writeFilePromise(ENV.FILE_PATH, csvLines);
}
