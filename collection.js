import { persistCSV } from "./util.js";

export default class vehicleCollection {
	vehicles
	headers

	constructor({vehicles, headers}){
		this.vehicles = vehicles

		this.headers = headers
	}

	async addVehicle(newVehicle) {
		this.vehicles.push(newVehicle);
		await persistCSV(this.headers, this.vehicles);
		
		console.log("New vehicle added successfully");
	}

	async editVehicle(id, updatedData) {
		let vehicle;

		try {
			vehicle = this.findVehicle(id);
		} catch (error) {
			throw new Error("Invalid vehicle ID")
		}

		if (updatedData === undefined) {
			console.error("There is not data to update");
			throw new Error("Missing vehicle data")
		}

		// Checkeaer las properties - falta

		Object.assign(vehicle, updatedData);

		//vehicle = {...vehicle, ...updatedData}

		// call to the persistCSV()
		await persistCSV(this.headers, this.vehicles);

		console.log("Vehicle updated");
	}

	async deleteVehicle(id) {
		// Search for the vechicle in Vechiles and remove it
		this.vehicles = this.vehicles.filter((vehicle) => vehicle.id !== id);

		await persistCSV(this.headers, this.vehicles);

		console.log("Vehicle deleted");
	}

	getVehicles(property, value) {
		
		if (property === undefined || value === undefined){
			return this.vehicles
		}
		
		const filteredVehicles = this.vehicles.filter(
			(vehicle) => vehicle[property] == value
		);

		return filteredVehicles;
	}

	findVehicle(id) {
		let car = this.vehicles.find((vehicle) => vehicle?.id == id);
	
		if (!car) {
			console.error("Error, the vhicle doesn't exist");
			throw new Error("Error, the vhicle doesn't exist");
		}
		return car;
	}
}
