import {persistCSV} from "./cli"

export async function addVehicle(newVehicle) {
	vehicles.push(newVehicle);

	await persistCSV();
}

export async function editVehicle(id, updatedData) {
	
	let vehicle
	
	try{
		vehicle = findVehicle(id)
	}
	catch(error){
		return
	}

	if (updatedData === undefined){
		console.error("There is not data to update")
	}

	
	Object.assign(vehicle, updatedData)

	//vehicle = {...vehicle, ...updatedData}

	// call to the persistCSV()
	persistCSV()

	console.log("Vehicle updated")
}

export function deleteVehicle(id) {
	// Search for the vechicle in Vechiles and remove it
	vehicles = vehicles.filter((vehicle) => vehicle.id !== id);

	 persistCSV();

	 console.log("Vehicle deleted")
}

export function getVehicles(property, value){
	const filteredVehicles = vehicles.filter(
		(vehicle) => vehicle[property] == value
	);

	return filteredVehicles
}