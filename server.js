import express from "express"
import Collection from "./collection.js"
import ENV from "./config.js"


const app = express();
const router = express.Router()
let collection = await Collection.init()

router
.get('/', function(req, res) {

    const {property, value} = req.query 

    const data = collection.getVehicles(property, value)
    
    res.json(data);
})
.delete('/:id', function(req, res) {

    const id = parseInt(req.params.id)

    collection.deleteVehicle(id)

    res.end()
})
.put('/:id', function(req, res) {

    const id = req.params.id

    const updatedData = req.body

    collection.editVehicle(id, updatedData)

    res.end()
})
.post('/', function(req, res) {

    const newVehicle = req.body

    collection.addVehicle(newVehicle)

    res.end()
})

app
.use(ENV.API_PATH, router)
.listen(ENV.API_PORT, function() {
  console.log(`API ready on port ${ENV.API_PORT} and path '${ENV.API_PATH}'`);
})
