const exp=require('express')
const app=exp()
const axios=require('axios')
require('dotenv').config()
const schedule = require('node-schedule');
const mClient=require('mongodb').MongoClient
const createApp=require('./APIs/create')
const fetchapp=require('./APIs/fetch')
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


app.use("/create",createApp)
app.use('/fetch',fetchapp)






// **************************************************************************************   */
// Job Scheduling
schedule.scheduleJob('*/2 * * * *', async function(){
    // const batchObj =app.get('batchObj') 
    console.log("Hrllo")
    const currentDate = new Date();
   const dateOnly = currentDate.toISOString().split('T')[0];
    var users=await userCollection.aggregate(
        [
            {
            $lookup: {
                from: 'profiles',
                localField: 'profileId',
                foreignField: '_id',
                as: 'profiles'
            }
            },
            { $project: { profiles: 1 } }
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
    ).toArray();

    for(var profile of users){
        var user=profile.profiles[0]
         var scoreObj={}
            //leetcode
            if(user.lc.length!=0)
            {
            lc=await axios.get('http://localhost:'+process.env.PORT+'/fetch/lc/'+user.lc)
            scoreObj.lc=lc.data.payload
            }
            

            //codechef
            if(user.cc.length!=0)
            {
        
            cc=await axios.get('http://localhost:'+process.env.PORT+'/fetch/cc/'+user.cc)
            scoreObj.cc=cc.data.payload
            }


            //codeforce
            if(user.cf.length!=0)
            {
            cf=await axios.get('http://localhost:'+process.env.PORT+'/fetch/cf/'+user.cf)
            scoreObj.cf=cf.data.payload
            }


            //spoj
            if(user.spoj.length!=0)
            {
 
            spoj=await axios.get('http://localhost:'+process.env.PORT+'/fetch/spoj/'+user.spoj)
            scoreObj.spoj=spoj.data.payload
            }



            //hackerrank
            if(user.hr.length!=0)
            {
            hr=await axios.get('http://localhost:'+process.env.PORT+'/fetch/hr/'+user.hr)    
            scoreObj.hr=hr.data.payload
            }

            scoreObj=await scoreCollection.insertOne(scoreObj)
            var temp={}
            temp.date=dateOnly
            temp._id=scoreObj.insertedId
            await userCollection.updateOne({_id:profile._id},{$push:{scoreId:temp}})
    }

});










//Invalid Paths Handling
app.use((req,res,next)=>{
    res.send({message:`Invalid path ${req.url}`})
})

//Error Handling Route
app.use((err,req,res,next)=>{
    res.send({message:`${err}`,reason:`${err.message}`})
})

app.listen(process.env.PORT,()=>{console.log("Server is listining in port",process.env.PORT)})