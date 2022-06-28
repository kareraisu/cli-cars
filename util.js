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

// Read data from local File System
export async function readData() {
	console.log("Reading data from local file system...")
	const data = await readFilePromise(ENV.CSV_PATH);
	console.log("Read successful")
	const { headers, elements } = parseCSV(data);
	return { headers, elements };
}

// Fetch data from url
export async function fetchData() {
	console.log("Fetching data from url...")
	const response = await fetch(ENV.CSV_URL);
	// If the HTTP-status is 200-299, then get the body
	if (response.ok) {
		console.log("Fetch successful")
		const data = await response.text();
		const { headers, elements } = parseCSV(data);
		return { headers, elements };
	} else {
		const errorMsg = "Failed to fetch data: " + response.status
		console.error(errorMsg);
		throw new Error(errorMsg)
	}
}

export function parseCSV(data) {
	console.log("Parsing CSV...")
	const elements = []
	const rows = data.split(ENV.LINE_SEPARATOR);
	const headers = rows
		.shift()
		.split(",")
		.map((el) => el.toLowerCase().trim());

	let indexId = 0;
	for (let row of rows) {
		const values = row.split(",");

		var entries = headers.map((element, indice) => [
			element,
			values[indice],
		]);

		const element = Object.fromEntries(entries);
		element.id = indexId;

		elements.push(element);

		indexId += 1;
	}

	console.log("Parse successful")

	// By default is returning internally as dictionary {key: value}.
	// Ex: { headers: headers, elements: elements };
	return { headers, elements };
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
	await writeFilePromise(ENV.CSV_PATH, csvLines);
}
