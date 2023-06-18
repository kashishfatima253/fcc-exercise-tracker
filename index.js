const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
// const mongoUri = process.env['MONGO_URI']
const mongoUri = "mongodb://kashishfatima253:7celUUDGu1aFIGT4@ac-nuvmn5q-shard-00-00.rug4hov.mongodb.net:27017,ac-nuvmn5q-shard-00-01.rug4hov.mongodb.net:27017,ac-nuvmn5q-shard-00-02.rug4hov.mongodb.net:27017/?ssl=true&replicaSet=atlas-13kleu-shard-0&authSource=admin&retryWrites=true&w=majority"
mongoose.connect(mongoUri,{
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(success=>{
  console.log("MongoDB connected")
}).catch(err=>{
  console.log(err)
})

let userSchema = new mongoose.Schema({
  username: String
})

let exerciseSchema = new mongoose.Schema({
  userid: String,
  description: String,
  duration: Number,
  date: String,
})

let User = mongoose.model('User', userSchema)
let Exercise = mongoose.model('Exercise', exerciseSchema)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// 7celUUDGu1aFIGT4

app.post('/api/users', async (req,res)=>{
  // console.log(req.body)
  if(req.body.username != '' || req.body.username != null){

  
  let finduser = await User.find({
    username: req.body.username
  })

  if(finduser.length > 0){
    console.log("user already exists")
    res.json({
      username: finduser[0].username,
      _id: finduser[0]._id
    })
  }
  else{

    let user = new User({
      username: req.body.username
    })
  
  
    await user.save().then(success=>{
      // console.log("inserted user into db", success)
      res.json({
        username: success.username,
        _id: success._id
      })
    });
  }

}
else{
  console.log("Enter a username")
}
})

app.get('/api/users', async (req,res)=>{
  let users = await User.find({})
  res.json(users)
})

app.get('/api/users/:_id/logs', async(req,res)=>{
  let userid = req.params._id
  let from = req.query.from
  let to = req.query.to
  let limit = req.query.limit
  console.log(req.query)

  let finduser = await User.findOne({_id:userid})
  var findexercise
  if(req.query != null){

    findexercise = await Exercise.find({
      userid:userid,
      date: {
        $gte: new Date(from),
        $lt: new Date(to)
      }
    }).limit(limit).exec();
  }
  else{
    findexercise = await Exercise.find({
      userid:userid,
    })
  }
  // console.log(findexercise)
  const filteredExercises = findexercise.map(({ id, description, duration, date }) => {
    date = new Date(date).toDateString()
    return { description, duration, date };
  });
  res.json({
    username: finduser.username,
    count: findexercise.length,
    _id: finduser.userid,
    log: filteredExercises
  })
})


app.post('/api/users/:_id/exercises', async (req,res)=>{

  let userid = req.params._id

  let user = await User.findById({_id:userid})
  // console.log("user found", user._id)
  let exercise = new Exercise({
    userid: user._id,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? new Date(req.body.date) : new Date()
  })

  await exercise.save().then(success=>{
   res.json({
      username: user.username,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString(),
      _id: user._id
    })

  })

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
