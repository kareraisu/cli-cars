import express from "express"
import bodyParser from "body-parser"

import Collection from "./collection.js"
import ENV from "./config.js"


const app = express();
const router = express.Router()
let collection = await Collection.init()

router
.get('/', function(req, res) {

    const {property, value} = req.query 

    const data = collection.get(property, value)
    
    res.json(data);
})

.get('/:id', function(req, res) {
  
    const id = req.params.id

    const data = collection.find(id)

    try{
        collection.find(id)
        res.json(data);
    } catch (error){
        res.status(400).send(error.message)
    }
})

.delete('/:id', async function(req, res) {

    const id = parseInt(req.params.id)

    await collection.delete(id)

    res.end()
})

.put('/:id', async function(req, res) {

    const id = req.params.id

    const updatedData = req.body

    try{
        await collection.update(id, updatedData)
        res.end()
    } catch (error){
        res.status(400).send(error.message)
    }

})

.post('/', async function(req, res) {

    const newVehicle = req.body

    try{
        await collection.add(newVehicle)
        res.end()
    } catch (error){
        res.status(400).send(error.message)
    }

})

app
.use(bodyParser.json())
.use(ENV.API_PATH, router)
.listen(ENV.API_PORT, function() {
    console.log(`API ready on port ${ENV.API_PORT} and path '${ENV.API_PATH}'`);
})
