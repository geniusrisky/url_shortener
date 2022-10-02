const express = require('express')
const route = require('../route/route')
const mongoose = require('mongoose')

const app = express();
app.use(express.json());


 mongoose.connect("mongodb+srv://skygupta:Z1Rn76vZdIBqi2FE@cluster0.333as.mongodb.net/group50Database", {useNewUrlParser: true})
 .then(() => console.log("MongoDb is connected"))
 .catch(err => console.log(err))


app.use('/',route);


app.listen(process.env.PORT || 3000, function(){
    console.log('express app running on port' + 3000)
})
