const exp=require('express')
const updateApp=exp.Router()
updateApp.use(exp.json())
const expressAsyncHandler=require('express-async-handler')
const {ObjectId} = require('mongodb'); 



updateApp.put('/profiles',expressAsyncHandler(async(req,res)=>{

const authCollection=req.app.get('authCollection')
const profileCollection=req.app.get('profileCollection')
const userAuthDetails=await authCollection.aggregate(
  [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'details'
      }
    },
    {
          $match: { username:req.body.username}
        
    }
]
).toArray()

const userProfileDetails=await profileCollection
.updateOne(
    {
        _id:userAuthDetails[0].details[0].profileId
    },
    {
        $set:req.body.profiles
    })

res.send({userAuthDetails,userProfileDetails})

}))


updateApp.put('/user',expressAsyncHandler(async(req,res)=>{
    const authCollection=req.app.get('authCollection')
    const userCollection=req.app.get('userCollection')
    const profileCollection=req.app.get('profileCollection')
    console.log(req.body.user._id)
  const authRes=  await authCollection.updateOne({username:req.body.username},{$set:{email:req.body.auth.email}})
   
  const userRes=  await userCollection
    .updateOne(
        {
            _id:new ObjectId(req.body.userid)
        },
        {
            $set:{...req.body.user}
        })

 const profileRes=   await profileCollection
    .updateOne(
    {
        _id:new ObjectId(req.body.profileid)
    },
    {
        $set:{...req.body.profiles}
    })
    res.send({message:'updated Successfully',userRes,profileRes,authRes})
}))



module.exports=updateApp;