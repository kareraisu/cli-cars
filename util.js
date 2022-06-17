import {parseCSV} from "./cli"
import ENV from "./config"
import fs from "fs";

export function findVehicle(id){
	let car = vehicles.find((vehicle) => vehicle?.id == id);

	if (!car){
		console.error("Error, the vhicle doesn't exist")
		throw new Error("Error, the vhicle doesn't exist")
	}
	return car
}

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

	parseCSV(data);
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