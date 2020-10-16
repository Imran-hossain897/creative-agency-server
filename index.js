const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iymr7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('service'));
app.use(fileUpload());


const port = 9000

app.get('/', (req, res)=>{
    res.send('hello')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const creativeCollection = client.db("creative-agency").collection("projects");
    const reviewCollection = client.db("creative-agency").collection("review");
    const adminCllection = client.db("creative-agency").collection("admin");

    



    app.post('/orderproducts', (req, res) => {
        const products = req.body;
        creativeCollection.insertOne(products)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/users', (req, res) => {
        creativeCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get("/orders", (req, res)=>{
        creativeCollection.find({ email: req.query.email })
        .toArray((err, documents) => {
          res.send(documents)
        })
      })
      app.post('/review', (req, res) => {
        const reviews = req.body;
        reviewCollection.insertOne(reviews)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/doingreview', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/service', (req, res) => {
       const file = req.files.file
       const service = req.body.service
       const description = req.body.description
       file.mv(`${__dirname}/service/${file.name}`, err=>{
           if(err){
               return res.status(500).send({msg: "failed to upload Image"})
           }
           return res.send({name: file.name, path: `/${file.name}`})
       })

    })
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCllection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })
    app.post('/addadmin', (req, res) => {
        const admins = req.body;
        adminCllection.insertOne(admins)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


});


app.listen(process.env.PORT || port)