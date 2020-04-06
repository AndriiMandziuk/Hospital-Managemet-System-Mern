const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const Supplier = require('./models/supplier');
mongoose.connect('mongodb+srv://lalana:OJx2X4IllVNl9up4@cluster0-rjtww.mongodb.net/pharmacy?retryWrites=true&w=majority',{useNewUrlParser: true , useUnifiedTopology: true})
  .then(()=>{
    console.log('connected to database!');
  })
  .catch(()=>{
    console.log('connection failed! ');
  });

//OJx2X4IllVNl9up4


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With ,Content-Type,Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST, PATCH, DELETE,OPTIONS"
  );
  next();
});


app.post("/api/supplier",(req,res,next)=>{
const supplier = new Supplier({
  supplierID: req.body.supplierID,
  name: req.body.name,
  email: req.body.email,
  contact: req.body.contact,
  drugsAvailable: req.body.drugsAvailable
});
supplier.save();
console.log(supplier);
res.status(201).json({
  message:'Supplier Added Successfully'
});
});


app.get("/api/supplier",(req,res,next)=>{
  Supplier.find().then(documents=>{
    res.status(200).json({
      message : 'supplier added sucessfully',
      suppliers :documents
    });
  });

});

module.exports = app;
