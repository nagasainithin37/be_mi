const exp = require("express");
const authApp = exp.Router();
authApp.use(exp.json());
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

authApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const userObj = req.body;
    const authCollection = req.app.get("authCollection");
    const result = await authCollection.findOne({ username: userObj.username });
    if (result != null) {
      var isTrueUser = await bcryptjs.compare(
        userObj.password,
        result.password
      );

      if (isTrueUser == false) {
        res.send({ message: "Wrong Password" });
        return;
      } else {
        var tokenObj = {};
        tokenObj.username = result.username;
        tokenObj.type = result.type;
        const token = jwt.sign(tokenObj, process.env.secretkey, {
          expiresIn: "2d",
        });
        res.send({
          message: "Login Success",
          token,
          username: result.username,
          type: result.type,
        });
      }
    } else {
      res.send({ message: "No user Exists" });
    }
  })
);

authApp.put(
  "/changePassword",
  expressAsyncHandler(async (req, res) => {
    const userObj = req.body;
    if (Number.isNaN(userObj.newPassword)) {
      userObj.newPassword = userObj.newPassword.toString();
    }
    if (Number.isNaN(userObj.oldPassword)) {
      userObj.oldPassword = userObj.oldPassword.toString();
    }
    const authCollection = req.app.get("authCollection");
    const result = await authCollection.findOne({ username: userObj.username });
    if (result == null) {
      return res.send({ message: "Error occured" });
    }
    var isTrueUser = await bcryptjs.compare(
      userObj.oldPassword,
      result.password
    );
    if (isTrueUser) {
      let password = await bcryptjs.hash(userObj.newPassword, 5);
      await authCollection.updateOne(
        { username: userObj.username },
        { $set: { password: password } }
      );
      return res.send({ message: "Password updated",status:"success" });
    }

    return res.send({ message: "Password not updated",status:'failue' });
  })
);

authApp.put(
  "/changePswByAdmin",
  expressAsyncHandler(async (req, res) => {
    const userObj = req.body;
    const authCollection = req.app.get("authCollection");
    let password = await bcryptjs.hash(userObj.username, 5);
    const result = await authCollection.updateOne(
      { username: userObj.username },
      { $set: { password: password } }
    );
    return res.send({ message: "success", payload: result });
  })
);

module.exports = authApp;
