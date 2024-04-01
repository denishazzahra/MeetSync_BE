const express = require('express');
const association = require('./util/dbAssoc');
const userRouter = require('./routes/user');
const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(userRouter);
app.get("/", (req,res,next)=>{
  console.log("test");
  res.json({
    message: "Hello from another service"
  })
})

association().then(()=>{
  app.listen(8080);
  console.log('connected to db')
}).catch(e=>{
  console.log(e);
})