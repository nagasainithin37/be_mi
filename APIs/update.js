const exp = require("express");
const updateApp = exp.Router();
updateApp.use(exp.json());
const expressAsyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
const axios = require("axios");

updateApp.put(
  "/addToGroup",
  expressAsyncHandler(async (req, res) => {
    const authCollection = req.app.get("authCollection");
    const activeBatchCollection = req.app.get("activeBatchCollection");
    const batchdetails = await activeBatchCollection.findOne({
      name: req.body.name,
    });
    for (var i = 0; i < req.body.users.length; i++) {
      x = req.body.users[i];
      req.body.users[i] = x.toString();
    }
    const userIds = await authCollection
      .aggregate([
        {
          $match: { username: { $in: req.body.users } },
        },
        {
          $project: { _id: 1 },
        },
      ])
      .toArray();
    var temp = [];
    console.log(batchdetails);
    console.log(userIds);
    for (var i = 0; i < userIds.length; i++) {
      var isPresent = false;
      for (var j = 0; j < batchdetails.users.length; j++) {
        if (batchdetails.users[j].equals(userIds[i]["_id"])) {
          isPresent = true;
          break;
        }
      }
      if (isPresent == false) {
        temp.push(userIds[i]["_id"]);
      }
    }
    await activeBatchCollection.updateMany(
      { _id: batchdetails["_id"] },
      { $set: { users: [...batchdetails.users, ...temp] } }
    );
    const update_result = await authCollection.updateMany(
      { _id: { $in: temp } },
      { $push: { batch: req.body.name } }
    );
    // console.log(update_result)
    res.send({ update_result });
  })
);

// updateApp.put('/profiles',expressAsyncHandler(async(req,res)=>{

// const authCollection=req.app.get('authCollection')
// const profileCollection=req.app.get('profileCollection')
// const userAuthDetails=await authCollection.aggregate(
//   [
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'userId',
//         foreignField: '_id',
//         as: 'details'
//       }
//     },
//     {
//           $match: { username:req.body.username}

//     }
// ]
// ).toArray()

// const userProfileDetails=await profileCollection
// .updateOne(
//     {
//         _id:userAuthDetails[0].details[0].profileId
//     },
//     {
//         $set:req.body.profiles
//     })

// res.send({userAuthDetails,userProfileDetails})

// }))

updateApp.put("/user", expressAsyncHandler(async (req, res) => {
    
    const currentDate = new Date();
    const dateOnly = currentDate.toISOString().split("T")[0];
    const authCollection = req.app.get("authCollection");
    const userCollection = req.app.get("userCollection");
    const scoreCollection = req.app.get("scoreCollection");
    const profileCollection = req.app.get("profileCollection");
    console.log(req.body.user._id);
    const authRes = await authCollection.updateOne(
      { username: req.body.username },
      { $set: { email: req.body.auth.email } }
    );

    const userRes = await userCollection.updateOne(
      {
        _id: new ObjectId(req.body.userid),
      },
      {
        $set: { ...req.body.user },
      }
    );

    const profileRes = await profileCollection.updateOne(
      {
        _id: new ObjectId(req.body.profileid),
      },
      {
        $set: { ...req.body.profiles },
      }
    );

    var user = req.body.profiles;
    var scoreObj = {};
    if (user.lc.length != 0) {
      lc = await axios.get(
        "http://localhost:" + process.env.PORT + "/fetch/lc/" + user.lc
      );
      if (lc.data.payload == null) {
        scoreObj.lc = {
          rating: 0,
          noOfProblemsSolved: 0,
          noOfContests: 0,
        };
      } else {
        scoreObj.lc = lc.data.payload;
      }
    } 
    else {
      scoreObj.lc = {
        rating: 0,
        noOfProblemsSolved: 0,
        noOfContests: 0,
      };
    }

    //codechef
    // if (user.cc.length != 0) {
    //   cc = await axios.get(
    //     "http://localhost:" + process.env.PORT + "/fetch/cc/" + user.cc
    //   );
    //   scoreObj.cc = cc.data.payload;
    // }

    //codechef
    if (user.cc.length != 0) {
      cc = await axios.get(
        "http://localhost:" + process.env.PORT + "/fetch/cc/" + user.cc
      );
      scoreObj.cc = cc.data.payload;
      if (cc.data.payload == null) {
        scoreObj.cc = {
          rating: 0,
          noOfProblemsSolved: 0,
          noOfContests: 0,
        };
      }
    } else {
      scoreObj.cc = {
        rating: 0,
        noOfProblemsSolved: 0,
        noOfContests: 0,
      };
    }


    //codeforce
    // if (user.cf.length != 0) {
    //   cf = await axios.get(
    //     "http://localhost:" + process.env.PORT + "/fetch/cf/" + user.cf
    //   );
    //   scoreObj.cf = cf.data.payload;
    // }

       if (user.cf.length != 0) {
         cf = await axios.get(
           "http://localhost:" + process.env.PORT + "/fetch/cf/" + user.cf
         );
         scoreObj.cf = cf.data.payload;
         if (cf.data.payload == null) {
           scoreObj.cf = {
             rating: 0,
             noOfProblemsSolved: 0,
             noOfContests: 0,
           };
         }
       } else {
         scoreObj.cf = {
           rating: 0,
           noOfProblemsSolved: 0,
           noOfContests: 0,
         };
       }


    //spoj
    // if (user.spoj.length != 0) {
    //   spoj = await axios.get(
    //     "http://localhost:" + process.env.PORT + "/fetch/spoj/" + user.spoj
    //   );
    //   scoreObj.spoj = spoj.data.payload;
    // }


     if (user.spoj.length != 0) {
       spoj = await axios.get(
         "http://localhost:" + process.env.PORT + "/fetch/spoj/" + user.spoj
       );
       scoreObj.spoj = spoj.data.payload;
       if (spoj.data.payload == null) {
         scoreObj.spoj = {
           noOfProblemsSolved: 0,
         };
       }
     } else {
       scoreObj.spoj = {
         noOfProblemsSolved: 0,
       };
     }





    //hackerrank
    // if (user.hr.length != 0) {
    //   hr = await axios.get(
    //     "http://localhost:" + process.env.PORT + "/fetch/hr/" + user.hr
    //   );
    //   scoreObj.hr = hr.data.payload;
    // }

        if (user.ib.length != 0) {

          ib = await axios.get(
            "http://localhost:" + process.env.PORT + "/fetch/ib/" + user.ib
          );
          if (ib.data.message == "users data is ")
            scoreObj.ib = ib.data.payload;
          else scoreObj.ib = { noOfProblemsSolved: 0 };
        } else {
          scoreObj.ib = { noOfProblemsSolved: 0 };
        }



               //hackerrank
        if (user.hr.length != 0) {
          hr = await axios.get(
            "http://localhost:" + process.env.PORT + "/fetch/hr/" + user.hr
          );
          scoreObj.hr = hr.data.payload;
          if (hr.data.payload == null) {
            scoreObj.hr = {
              algo_score: 0,
              ds_score: 0,
            };
          }
        } else {
          scoreObj.hr = {
            algo_score: 0,
            ds_score: 0,
          };
        }




    // scoreObj.ib = { noOfProblemsSolved: 19144 };
    console.log(scoreObj);
    scoreObj = await scoreCollection.insertOne(scoreObj);
    var temp = {};
    temp.date = dateOnly;
    temp._id = scoreObj.insertedId;
    await userCollection.updateOne(
      { rollno: req.body.username },
      { $push: { scoreId: temp } }
    );
    res.send({ message: "updated Successfully", userRes, profileRes, authRes });
  })
);

updateApp.put(
  "/batchDetails",
  expressAsyncHandler(async (req, res) => {
    const activeBatchCollection = req.app.get("activeBatchCollection");
    const obj = req.body;
    const isPresent = await activeBatchCollection
      .find({ name: obj.name })
      .toArray();
    if (
      isPresent.length == 0 ||
      (isPresent.length == 1 && isPresent[0]._id == obj._id)
    ) {
      var newObj = {};
      newObj.name = obj.name;
      newObj.profiles = obj.profiles;
      const result = await activeBatchCollection.updateOne(
        { _id: new ObjectId(obj._id) },
        { $set: newObj }
      );
      console.log(result);
      return res.send({ message: "success" });
    } else {
      return res.send({ message: "Another batch is present with same name" });
    }
  })
);

updateApp.get(
  "/deleteBatch",
  expressAsyncHandler(async (req, res) => {
    console.log("hello");
    const batch_name = req.query.name;
    const authCollection = req.app.get("authCollection");
    const activeBatchCollection = req.app.get("activeBatchCollection");
    const userCollection = req.app.get("userCollection");
    const scoreCollection = req.app.get("scoreCollection");
    const profileCollection = req.app.get("profileCollection");
    const batchDetails = await activeBatchCollection.findOne({
      name: batch_name,
    });

    console.log(batchDetails);
    // await authCollection.updateMany({_id:{$in:batchDetails.users }},{$pull:{batch:batch_name}})

    for (var i = 0; i < batchDetails.users.length; i++) {
      const userAuth = await authCollection.findOne({
        _id: new ObjectId(batchDetails.users[i]),
      });
      if (userAuth.batch.length > 1) {
        for (var j = 0; j < userAuth.batch.length; j++) {
          if (userAuth.batch[j] == batch_name) {
            userAuth.batch.splice(j, 1);
            break;
          }
        }
        const data = await authCollection.updateOne(
          { _id: userAuth._id },
          { $set: { batch: [...userAuth.batch] } }
        );
      } else if (userAuth.batch.length == 1) {
        const userObj = await userCollection.findOne({
          _id: new ObjectId(userAuth.userId),
        });
        await profileCollection.deleteOne({ _id: userObj.profileId });
        const scoreIds = [];
        for (var k = 0; k < userObj.scoreId.length; k++) {
          scoreIds.push(userObj.scoreId[k]._id);
        }
        await scoreCollection.deleteMany({ _id: { $in: scoreIds } });
        await userCollection.deleteOne({ _id: new ObjectId(userObj._id) });
        await authCollection.deleteOne({ _id: new ObjectId(userAuth._id) });
      }
    }

    await activeBatchCollection.deleteOne({ name: batch_name });
    console.log("bye");
    res.send({ message: "success" });
  })
);

module.exports = updateApp;
