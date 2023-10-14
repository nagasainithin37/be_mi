const exp = require("express");
const getApp = exp.Router();
getApp.use(exp.json());
const expressAsyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");

var getTotal = (obj, type) => {
  if (type == "leetcode") {
    var x = obj.noOfProblemsSolved * 50;
    if (obj.noOfContests >= 3 && obj.rating >= 1300) {
      x += parseInt(Math.pow(obj.rating - 1300, 2) / 30);
    }

    return x;
  } else if (type == "codechef") {
    var x = obj.noOfProblemsSolved * 10;
    if (obj.noOfContests >= 3 && obj.rating >= 1300)
      x += parseInt(Math.pow(obj.rating - 1300, 2) / 30);
    return x;
  } else if (type == "hackerrank") {
    return obj.algo_score + obj.ds_score;
  } else if (type == "codeforce") {
    var x = obj.noOfProblemsSolved * 10;
    if (obj.noOfContests >= 3 && obj.rating >= 1200)
      x += parseInt(Math.pow(obj.rating - 1200, 2) / 30);
    return x;
  } else if (type == "spoj") {
    return obj.noOfProblemsSolved * 10;
  } else if (type == "ib") {
    return parseInt(obj.noOfProblemsSolved / 3);
  }
};

getApp.post(
  "/batch",
  expressAsyncHandler(async (req, res) => {
    const activeBatchCollection = req.app.get("activeBatchCollection");
    const data = await activeBatchCollection.find().toArray();
    res.send({ message: "success", data });
  })
);

getApp.get(
  "/batch-info",
  expressAsyncHandler(async (req, res) => {
    var batchName = req.query.name;
    var activeBatchCollection = req.app.get("activeBatchCollection");
    var authCollection = req.app.get("authCollection");
    var userCollection = req.app.get("userCollection");
    const batchObj = await activeBatchCollection.findOne({ name: batchName });
    var users = await authCollection
      .aggregate([
        { $match: { _id: { $in: batchObj.users } } },
        { $project: { email: 1, userId: 1, _id: 1, batch: 1, username: 1 } },
      ])
      .toArray();
    var userProfileIds = [];
    for (var i = 0; i < users.length; i++) userProfileIds.push(users[i].userId);

    var userProfiles = await userCollection
      .aggregate([
        { $match: { _id: { $in: userProfileIds } } },
        { $project: { name: 1, rollno: 1, branch: 1, mobileno: 1, _id: 0 } },
      ])
      .toArray();
    var batchUserDetails = [];
    for (var i = 0; i < users.length; i++) {
      var Obj = { ...users[i], ...userProfiles[i] };
      batchUserDetails.push(Obj);
    }

    res.send({ batchUserDetails });
    // res.send({batchObj,batchName,users,userProfiles})
  })
);

getApp.get(
  "/batchScore",
  expressAsyncHandler(async (req, res) => {
    const activeBatchCollection = req.app.get("activeBatchCollection");
    const userCollection = req.app.get("userCollection");
    const authCollection = req.app.get("authCollection");
    const scoreCollection = req.app.get("scoreCollection");
    const users = (
      await activeBatchCollection
        .aggregate([{ $match: { name: req.query.name } }])
        .toArray()
    )[0];
    let userData = [];

    for (let i = 0; i < users.users.length; i++) {
      let result = (
        await authCollection
          .aggregate([
            { $match: { _id: users.users[i] } },
            { $project: { userId: 1, _id: 0, username: 1 } },
          ])
          .toArray()
      )[0];
      let scoreId = (
        await userCollection
          .aggregate([
            { $match: { _id: result.userId } },
            { $project: { scoreId: { $last: "$scoreId" }, _id: 0, name: 1 } },
          ])
          .toArray()
      )[0];
      let scoreRes = (
        await scoreCollection
          .aggregate([{ $match: { _id: scoreId.scoreId._id } }])
          .toArray()
      )[0];

      let scoreObj = {};
      scoreObj._id = scoreRes._id;
      var totalScore = 0;
      if (users.profiles.leetcode) {
        scoreObj.lc = scoreRes.lc;
        scoreObj.lc.total = getTotal(scoreRes.lc, "leetcode");
        totalScore += scoreObj.lc.total;
      }
      if (users.profiles.codechef) {
        scoreObj.cc = scoreRes.cc;
        scoreObj.cc.total = getTotal(scoreRes.cc, "codechef");
        totalScore += scoreObj.cc.total;
      }
      if (users.profiles.codeforce) {
        scoreObj.cf = scoreRes.cf;
        scoreObj.cf.total = getTotal(scoreRes.cf, "codeforce");
        totalScore += scoreObj.cf.total;
      }
      if (users.profiles.spoj) {
        scoreObj.spoj = scoreRes.spoj;
        scoreObj.spoj.total = getTotal(scoreRes.spoj, "spoj");
        totalScore += scoreObj.spoj.total;
      }
      if (users.profiles.hackerrank) {
        scoreObj.hr = scoreRes.hr;
        scoreObj.hr.total = getTotal(scoreRes.hr, "hackerrank");
        totalScore += scoreObj.hr.total;
      }
      if (users.profiles.ib) {
        scoreObj.ib = scoreRes.ib;
        scoreObj.ib.total = getTotal(scoreRes.ib, "ib");
        totalScore += scoreObj.ib.total;
      }

      userData.push({
        username: result.username,
        name: scoreId.name,
        totalScore,
        score: scoreObj,
      });
    }
    let userId = [];
    userData.map((ele) => {
      userId.push(ele.userId);
    });
    userData.sort((a, b) => {
      return -(a.totalScore - b.totalScore);
    });
    for (var i = 0; i < userData.length; i++) {
      userData[i]["rank"] = i + 1;
    }
    return res.send({ resObj: userData, profiles: users.profiles });
  })
);

//replaced with the above code
// getApp.get(
//   "/batchScore",
//   expressAsyncHandler(async (req, res) => {
//     const users = (
//       await activeBatchCollection
//         .aggregate([{ $match: { name: req.query.name } }])
//         .toArray()
//     )[0];
//     var userData = await authCollection
//       .aggregate([
//         { $match: { _id: { $in: users.users } } },
//         { $project: { userId: 1, _id: 0, username: 1, __order: 1 } },
//       ])
//       .toArray();
//     var userId = [];
//     userData.map((ele) => {
//       userId.push(new ObjectId(ele.userId));
//     });

//     const scoreId = await userCollection
//       .aggregate([
//         { $match: { _id: { $in: userId } } },
//         {
//           $project: {
//             scoreId: { $last: "$scoreId" },
//             _id: 0,
//             name: 1,
//             __order: 1,
//           },
//         },
//       ])
//       .toArray();

//     var scoresId = [];
//     for (var i = 0; i < scoreId.length; i++) {
//       scoresId.push(scoreId[i].scoreId._id);
//     }

//     var scores = await scoreCollection
//       .aggregate([{ $match: { _id: { $in: scoresId } } }])
//       .toArray();

//     console.log(scoreId);
//     var resObj = [];
//     for (var i = 0; i < userId.length; i++) {
//       var temp = {};
//       temp.username = userData[i].username;
//       temp.name = scoreId[i].name;
//       var scoreObj = {};
//       scoreObj._id = scores[i]._id;
//       var totalScore = 0;
//       if (users.profiles.leetcode) {
//         scoreObj.lc = scores[i].lc;
//         scoreObj.lc.total = getTotal(scores[i].lc, "leetcode");
//         totalScore += scoreObj.lc.total;
//       }
//       if (users.profiles.codechef) {
//         scoreObj.cc = scores[i].cc;
//         scoreObj.cc.total = getTotal(scores[i].cc, "codechef");
//         totalScore += scoreObj.cc.total;
//       }
//       if (users.profiles.codeforce) {
//         scoreObj.cf = scores[i].cf;
//         scoreObj.cf.total = getTotal(scores[i].cf, "codeforce");
//         totalScore += scoreObj.cf.total;
//       }
//       if (users.profiles.spoj) {
//         scoreObj.spoj = scores[i].spoj;
//         scoreObj.spoj.total = getTotal(scores[i].spoj, "spoj");
//         totalScore += scoreObj.spoj.total;
//       }
//       if (users.profiles.hackerrank) {
//         scoreObj.hr = scores[i].hr;
//         scoreObj.hr.total = getTotal(scores[i].hr, "hackerrank");
//         totalScore += scoreObj.hr.total;
//       }
//       if (users.profiles.ib) {
//         scoreObj.ib = scores[i].ib;
//         scoreObj.ib.total = getTotal(scores[i].ib, "ib");
//         totalScore += scoreObj.ib.total;
//       }
//       temp.totalScore = totalScore;
//       temp.score = scoreObj;
//       resObj.push(temp);
//     }
//     resObj.sort((a, b) => {
//       return -(a.totalScore - b.totalScore);
//     });
//     for (var i = 0; i < resObj.length; i++) {
//       resObj[i]["rank"] = i + 1;
//     }
//     console.log(resObj);
//     res.send({ resObj, profiles: users.profiles });
//   })
// );

module.exports = getApp;
