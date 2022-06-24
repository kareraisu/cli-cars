import express from "express"
import vehicleCollection from "./collection.js"
import {readData} from "./util.js"

import bodyParser from "body-parser"

const {elements: vehicles, tableHeaders: headers} = await readData();

const collection = new vehicleCollection({vehicles, headers})


var app = express();

app.use(bodyParser.json())

app.get('/', function(req, res) {
  
    const {property, value} = req.query 

    const data = collection.getVehicles(property, value)
    
    res.json(data);
});

//
app.get('/:id', function(req, res) {
  
    const id = parseInt(req.params.id)

    const data = collection.findVehicle(id)
    
    res.json(data);
});


app.delete('/:id', function(req, res) {

    const id = parseInt(req.params.id) 

    collection.deleteVehicle(id)

    res.end()
});

app.put('/:id', async function(req, res) {

    const id = parseInt(req.params.id) 

    const updatedData = req.body

    try{
        await collection.editVehicle(id, updatedData)
        res.end()
    } catch (error){
        res.status(400).send(error.message)
    }

});

app.post('/', function(req, res) {

    const newVehicle = req.body

    collection.addVehicle(newVehicle)

    res.end()

});

app.listen(3000, function() {
  console.log('Aplicación ejemplo corriendo, escuchando el puerto 3000!');
});
