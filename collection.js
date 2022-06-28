import { fetchData, readData, persistCSV } from "./util.js";


export default class Collection {
	vehicles
	headers

	constructor({vehicles, headers}){
		this.vehicles = vehicles
		this.headers = headers
	}

	async add(newVehicle) {
		this.vehicles.push(newVehicle);
		await persistCSV(this.headers, this.vehicles);
	}

	async update(id, updatedData) {
		let vehicle;

		try {
			vehicle = this.find(id);
		} catch (error) {
			return;
		}

		if (updatedData === undefined) {
			console.error("There is not data to update");
		}

		Object.assign(vehicle, updatedData);

		persistCSV(this.headers, this.vehicles);

		console.log("Updated element with id", id);
	}

	delete(id) {
		// Search for the vechicle in Vechiles and remove it
		this.vehicles = this.vehicles.filter((vehicle) => vehicle.id !== id);

		persistCSV(this.headers, this.vehicles);

		console.log("Deleted element with id", id);
	}

	get(property, value) {
		
		if (property === undefined || value === undefined){
			return this.vehicles
		}
		
		const filteredVehicles = this.vehicles.filter(
			(vehicle) => vehicle[property] == value
		);

		return filteredVehicles;
	}

	find(id) {
		let car = this.vehicles.find((vehicle) => vehicle?.id == id);
	
		if (!car) {
			const errorMsg = "The vehicle doesn't exist"
			console.error(errorMsg);
			throw new Error(errorMsg);
		}

		return car;
	}

	static async init() {
		let data
		try {
			data = await readData();
		}
		catch(err) {
			console.warn('Could not read data from file system, fetching from url...')
			data = await fetchData()
			const {headers, elements} = data
			await persistCSV(headers, elements)
		}
		return new Collection({
			vehicles: data.elements,
			headers: data.headers
		})
	}
}
