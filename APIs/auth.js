const e = require('express')
const exp=require('express')
const authApp=exp.Router()
authApp.use(exp.json())
const expressAsyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
const bcryptjs=require('bcryptjs')










authApp.post('/login',expressAsyncHandler(async(req,res)=>{

const userObj=req.body
console.log(userObj)
const authCollection=req.app.get('authCollection')
const result=await authCollection.findOne({username:userObj.username})
console.log(result)
if(result!=null){

    var isTrueUser=await bcryptjs.compare(userObj.password,result.password)
    
    if (isTrueUser==false){
        res.send({"message":"Wrong Password"})
        return
    }
    else{
        var tokenObj={}
        tokenObj.username=result.username
        tokenObj.passwrod=userObj.password
        tokenObj.type='user'
        const token=jwt.sign(tokenObj,process.env.secretkey, {expiresIn: "2d" })
        res.send({"message":"Login Success",token,username:result.username,type:result.type})
    }

}
else{
    res.send({"message":"No user Exists"})
}



}))























module.exports=authApp;