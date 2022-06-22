import express from "express"
import vehicleCollection from "./collection.js"
import {readData} from "./util.js"

const {elements: vehicles, tableHeaders: headers} = await readData();

const collection = new vehicleCollection({vehicles, headers})


var app = express();

app.get('/', function(req, res) {
  
    const {property, value} = req.query 

    const data = collection.getVehicles(property, value)
    
    res.json(data);
});

app.delete('/:id', function(req, res) {

    const id = req.params.id

    collection.deleteVehicle(id)

    res.end()
});

app.put('/:id', function(req, res) {

    const id = req.params.id

    const updatedData = req.body

    collection.editVehicle(id, updatedData)

    res.end()

});

app.post('/', function(req, res) {

    const newVehicle = req.body

    collection.addVehicle(newVehicle)

    res.end()

});

app.listen(3000, function() {
  console.log('Aplicación ejemplo, escuchando el puerto 3000!');
});
