const exp=require('express')
const createApp=exp.Router()
createApp.use(exp.json())
const expressAsyncHandler=require('express-async-handler')
const bcryptjs=require('bcryptjs')
const axios=require('axios')


// creating a new batch
createApp.post('/batch',expressAsyncHandler(async(req,res)=>{
    var body=req.body;
    const activeBatchCollection=req.app.get('activeBatchCollection')
    var result=await activeBatchCollection.findOne({name:body.name})
    if(result==null)
        {
        await activeBatchCollection.insertOne(body)
        res.send({message:`${body.name} batch is created`})
        }
    res.send({message:`${body.name} batch already exists`})
}))



//Add users to the batch
createApp.post('/addUsers',expressAsyncHandler(async(req,res)=>{
    var body=req.body;
    var profileCollection=req.app.get('profileCollection')
    var userCollection=req.app.get('userCollection')
    var authCollection=req.app.get('authCollection')
    var scoreCollection=req.app.get("scoreCollection")
    var activeBatchCollection=req.app.get('activeBatchCollection')
    var createdusers=[]
    var duplicateusers=[]
    const currentDate = new Date();
    const dateOnly = currentDate.toISOString().split('T')[0];
    for(var user of body.users)
    {

        var result=await authCollection.findOne({username:user.rollno})       
        if(result==null)
        {
            var profileObj={}
            var scoreObj={}
            var lc,cc,cf,spoj,hr;
            
            //leetcode
            if(user.lc.length!=0)
            {
            profileObj.lc=user.lc
            lc=await axios.get('http://localhost:'+process.env.PORT+'/fetch/lc/'+user.lc)
            if(lc.data.payload==null){
                scoreObj.lc={
                        "rating":0, 
                        "noOfProblemsSolved":0,
                        "noOfContests":0
                }
            }
            else{
            scoreObj.lc=lc.data.payload
            }
        }

            //codechef
            if(user.cc.length!=0)
            {
            profileObj.cc=user.cc
            cc=await axios.get('http://localhost:'+process.env.PORT+'/fetch/cc/'+user.cc)
            scoreObj.cc=cc.data.payload
            }


            //codeforce
            if(user.cf.length!=0)
            {
            profileObj.cf=user.cf
            cf=await axios.get('http://localhost:'+process.env.PORT+'/fetch/cf/'+user.cf)
            scoreObj.cf=cf.data.payload
            }


            //spoj
            if(user.spoj.length!=0)
            {
            profileObj.spoj=user.spoj
            spoj=await axios.get('http://localhost:'+process.env.PORT+'/fetch/spoj/'+user.spoj)
            scoreObj.spoj=spoj.data.payload
            }



            //hackerrank
            if(user.hr.length!=0)
            {
            profileObj.hr=user.hr
            hr=await axios.get('http://localhost:'+process.env.PORT+'/fetch/hr/'+user.hr)    
            scoreObj.hr=hr.data.payload
            }

            var profileObj=await profileCollection.insertOne(profileObj)
            var scoreObj=await scoreCollection.insertOne(scoreObj)

            var userDetails={}
            userDetails.profileId=profileObj.insertedId
            var temp={}
            temp.date=dateOnly
            temp._id=scoreObj.insertedId
            userDetails.scoreId=[temp]
            userDetails.name=user.name
            userDetails.rollno=user.rollno
            userDetails.branch=user.branch
            userDetails.mobileno=user.mobileno
            userDetails.isActive=true
            userDetails=await userCollection.insertOne(userDetails)

            var authObj={}
            authObj.username=user.rollno;
            authObj.password=await bcryptjs.hash(user.rollno,5)
            authObj.email=user.email
            authObj.userId=userDetails.insertedId
            authObj.batch=[body.name]
            authObj.type='user'
            authObj=await authCollection.insertOne(authObj)
            createdusers.push(user.rollno)
            await activeBatchCollection.updateOne({name:body.name},{$push:{users:authObj.insertedId}})

        }
        else
        {
            duplicateusers.push(user.rollno)
        }
        
    }

    res.send({"created users":createdusers,"duplicate users":duplicateusers})

}))






module.exports=createApp;