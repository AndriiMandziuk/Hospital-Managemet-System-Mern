const express = require("express");
const router = express.Router();
const multer = require("multer");

const MIME_TYPE_MAP ={
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg'
};

const Inventory = require('../models/inventory');

const storage =multer.diskStorage({
  destination: (req, file ,cb) =>{
    const isValid  = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("mime type invalid");
    if(isValid){
      error = null;
    }
    cb(error, "backend/images");
  },
  filename :(req, file ,cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});


router.post("",multer({storage: storage}).single("image"),(req,res,next)=>{
  const url =req.protocol + '://' + req.get("host");
  const inventory = new Inventory({
    email: req.body.email,
    name: req.body.name,
    quantity: req.body.quantity,
    batchId: req.body.batchId,
    expireDate: req.body.expireDate,
    price: req.body.price,
    imagePath : url + "/images/" + req.file.filename
    });
  inventory.save().then(createdInventory=>{
  res.status(201).json({
      message:'Inventory Added Successfully',
      inventory: {
        ...createdInventory,
        id : createdInventory._id

      }
      });
  });
});


router.put("/:id",multer({storage: storage}).single("image"), (req,res,next)=>{

  let imagePath = req.body.imagePath;
  if(req.file){
    const url =req.protocol + '://' + req.get("host");
    imagePath =url + "/images/" + req.file.filename;
  };
  const inventory = new Inventory({
    _id: req.body.id,
    email: req.body.email,
    name: req.body.name,
    quantity: req.body.quantity,
    batchId: req.body.batchId,
    expireDate:new Date(req.body.expireDate),
    price: req.body.price,
    imagePath: imagePath
  });
  console.log(inventory);
  Inventory.updateOne({_id: req.params.id}, inventory).then(result => {
    console.log(result);
    res.status(200).json({message : "Update Successful !"});
  });
});


router.put("/updateQuantity/:id",(req,res,next)=>{
  const inventory = new Inventory({
    _id: req.body.id,
    quantity: req.body.quantity


  });console.log(inventory)
  Inventory.updateOne({_id: req.params.id}, inventory).then(result => {
    console.log(result);
    res.status(200).json({message : "Update quantity Successful !"});
  });
});


router.get("",(req,res,next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Inventory.find();
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage-1))
      .limit(pageSize);
  }
  postQuery.then(documents=>{
    res.status(200).json({
      message : 'inventory added sucessfully',
      inventorys :documents
    });
  });
});


router.get("/outofstock",(req,res,next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Inventory.find({ $expr: { $lte: [ { $toDouble: "$quantity" }, 1.0 ] }});
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage-1))
      .limit(pageSize);
  }
  postQuery.then(documents=>{
    res.status(200).json({
      message : 'inventory min quanity items obtained  sucessfully',
      inventorys :documents
    });
  });
});


router.get("/abouttooutofstock",(req,res,next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Inventory.find({$and: [
                                    { $expr: { $lte: [ { $toDouble: "$quantity" }, 500.0 ] }},
                                    { $expr: { $gte: [ { $toDouble: "$quantity" }, 1.0 ] }}
                                  ]});
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage-1))
      .limit(pageSize);
  }
  postQuery.then(documents=>{
    res.status(200).json({
      message : 'inventory min quanity items obtained  sucessfully',
      inventorys :documents
    });
  });
});

router.get("/getExpired",(req,res,next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Inventory.find({expireDate:{$lte:new Date()}});
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage-1))
      .limit(pageSize);
  }
  postQuery.then(documents=>{
    res.status(200).json({
      message : 'inventory added sucessfully',
      inventorys :documents
    });
  });
});

router.get("/getAboutToExpire",(req,res,next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  var date = new Date();
  var date10 = new Date(date.getTime());
  date10.setDate(date10.getDate() + 10);

  const postQuery = Inventory.find({expireDate:{$lte:new Date(date10),$gte:new Date()}});
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage-1))
      .limit(pageSize);
  }
  postQuery.then(documents=>{
    res.status(200).json({
      message : 'inventory added sucessfully',
      inventorys :documents
    });
  });
});


router.get("/:id",(req,res,next)=>{
  Inventory.findById(req.params.id).then(inventory =>{
    if(inventory){
      res.status(200).json(inventory);
    }else{
      res.status(200).json({message:'Inventory not found'});
    }
  });
});


router.delete("/:id", (req, res, next) => {
  Inventory.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: 'Inventory deleted!' });
  });
});

module.exports = router;
