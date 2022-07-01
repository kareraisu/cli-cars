import { fetchData, readData, persistCSV } from "./util.js";


export default class Collection {
	elements
	headers

	constructor({elements, headers}){
		this.elements = elements
		this.headers = headers
	}

	async add(newElement) {
		this.checkFields(newElement)
		
		this.elements.push(newElement);
		await persistCSV(this.headers, this.elements);
		
		console.log("New element added successfully");
	}

	async update(id, updatedData) {
		let element;

		try {
			element = this.find(id);
		} catch (error) {
			throw new Error("Invalid element ID or the ID doesn't exist")
		}

		if (updatedData === undefined) {
			console.error("There is not data to update");
			throw new Error("Missing element data")
		}

		this.checkFields(updatedData)

		Object.assign(element, updatedData);

		await persistCSV(this.headers, this.elements);

		console.log("Updated element with id", id);
	}

	async delete(id) {
		// Search for the vechicle in Vechiles and remove it
		this.elements = this.elements.filter((element) => element.id !== id);

		await persistCSV(this.headers, this.elements);

		console.log("Deleted element with id", id);
	}

	get(property, value) {
		
		if (property === undefined || value === undefined){
			return this.elements
		}
		
		const filteredElements = this.elements.filter(
			(element) => element[property] == value
		);

		return filteredElements;
	}

	find(id) {
		let car = this.elements.find((element) => element?.id == id);
	
		if (!car) {
			const errorMsg = "Invalid element ID or the ID doesn't exist"
			console.error(errorMsg);
			throw new Error(errorMsg);
		}

		return car;
	}

	checkFields(dataFields){

		for (let key of this.headers) {
	
			if ( !(typeof dataFields[key] === 'string') ){
				throw new Error("The next field >"+`${key}`+"< contain a value that is not a String.")
			}		
		}
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
			elements: data.elements,
			headers: data.headers
		})
	}
}
