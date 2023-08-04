const exp=require('express')
const app=exp()
const cors=require('cors')
app.use(cors())
const axios=require('axios')
require('dotenv').config()
const schedule = require('node-schedule');
const jwt=require('jsonwebtoken')
const mClient=require('mongodb').MongoClient
app.use(exp.json())
const createApp=require('./APIs/create')
const fetchapp=require('./APIs/fetch')
const updateApp=require('./APIs/update')
const getApp=require('./APIs/get')
const authApp=require('./APIs/auth')


var DbObj,activeBatchCollection,profileCollection,userCollection,authCollection,scoreCollection;
mClient.connect(process.env.URL)
.then((client)=>{
    console.log("Connection successful")
    DbObj=client.db('minor')
    activeBatchCollection=DbObj.collection('active_batches') 
    profileCollection=DbObj.collection('profiles')
    userCollection=DbObj.collection('users')
    authCollection=DbObj.collection('auth')
    scoreCollection=DbObj.collection('scores')
    app.set('activeBatchCollection',activeBatchCollection)
    app.set('profileCollection',profileCollection)
    app.set('userCollection',userCollection)
    app.set('authCollection',authCollection)
    app.set('scoreCollection',scoreCollection)

})
.catch((e)=>{
console.log(`error in connection ${e.message}`)
console.log(e)
})



const middleware1=async(req,res,next)=>{
    console.log(req.body)
    var token=req.headers['authorization']
    var decoded=jwt.verify(token, process.env.SECRETKEY)
    const authCollection=req.app.get('authCollection')
    const userCollection=req.app.get('userCollection')
    const profileCollection=req.app.get('profileCollection')
    const scoreCollection=req.app.get('scoreCollection')
    const data=await authCollection.findOne({username:decoded.username})
    delete data.password
    const data2=await userCollection.findOne({_id:data.userId})
    const data3=await profileCollection.findOne({_id:data2.profileId})
    const data4=await scoreCollection.findOne({_id:data2.scoreId[data2.scoreId.length-1]._id})


res.send({auth:data,user:data2,profile:data3,score:data4})












}
app.use('/user/getdetails',middleware1)
app.use("/create",createApp)
app.use('/fetch',fetchapp)
app.use('/update',updateApp)
app.use('/get',getApp)
app.use('/auth',authApp)



// **************************************************************************************   */
// Job Scheduling
// schedule.scheduleJob('*/2 * * * *', async function(){
//     // const batchObj =app.get('batchObj') 
//     const currentDate = new Date();
//    const dateOnly = currentDate.toISOString().split('T')[0];
//    console.log(dateOnly)
//     var users=await userCollection.aggregate(
//         [
//             {
//             $lookup: {
//                 from: 'profiles',
//                 localField: 'profileId',
//                 foreignField: '_id',
//                 as: 'profiles'
//             }
//             },
//             { $project: { profiles: 1 } }
//         ],
//         { maxTimeMS: 60000, allowDiskUse: true }
//     ).toArray();

//     for(var profile of users){
//         var user=profile.profiles[0]
//          var scoreObj={}
//             //leetcode
//             if(user.lc.length!=0)
//             {
//             lc=await axios.get('http://localhost:'+process.env.PORT+'/fetch/lc/'+user.lc)
//             scoreObj.lc=lc.data.payload
//             }
            

//             //codechef
//             if(user.cc.length!=0)
//             {
        
//             cc=await axios.get('http://localhost:'+process.env.PORT+'/fetch/cc/'+user.cc)
//             scoreObj.cc=cc.data.payload
//             }


//             //codeforce
//             if(user.cf.length!=0)
//             {
//             cf=await axios.get('http://localhost:'+process.env.PORT+'/fetch/cf/'+user.cf)
//             scoreObj.cf=cf.data.payload
//             }


//             //spoj
//             if(user.spoj.length!=0)
//             {
 
//             spoj=await axios.get('http://localhost:'+process.env.PORT+'/fetch/spoj/'+user.spoj)
//             scoreObj.spoj=spoj.data.payload
//             }



//             //hackerrank
//             if(user.hr.length!=0)
//             {
//             hr=await axios.get('http://localhost:'+process.env.PORT+'/fetch/hr/'+user.hr)    
//             scoreObj.hr=hr.data.payload
//             }

//             scoreObj=await scoreCollection.insertOne(scoreObj)
//             var temp={}
//             temp.date=dateOnly
//             temp._id=scoreObj.insertedId
//             await userCollection.updateOne({_id:profile._id},{$push:{scoreId:temp}})
//     }

// });










//Invalid Paths Handling
app.use((req,res,next)=>{
    console.log(req.url)
    res.send({message:`Invalid path ${req.url}`})
})

//Error Handling Route
app.use((err,req,res,next)=>{
    console.log(err)
    res.send({message:`${err}`,reason:`${err.message}`})
    return
})

app.listen(process.env.PORT,()=>{console.log("Server is listining in port",process.env.PORT)})