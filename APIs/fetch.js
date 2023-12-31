const exp = require("express");
const fetchapp = exp.Router();
const cheerio = require("cheerio");
const axios = require("axios");
const expressAsyncHandler = require("express-async-handler");

//CodeChef
fetchapp.get(
  "/cc/:username",
  expressAsyncHandler(async (req, responce) => {
    const URL = "https://www.codechef.com/users/" + req.params.username;
    console.log(URL);
    let resObj = {};
    const res = await axios(URL);
    const $ = cheerio.load(res.data);

    //For getting CC RATING
    const rating = $(".rating-number");
    var x = $(rating[0]).text();
    if ((x[0] = "0" && x[1] == "?")) {
      x = 0;
    } else {
      x = parseInt(x);
    }
    resObj["rating"] = x ?? 0;

    //No of probles solved
    // const solved=$('body > main > div > div > div > div > div > section:nth-child(7) > div > h5:nth-child(1)')
    const solved = $(
      "body > main > div > div > div > div > div > section:nth-child(7) > h3:nth-child(1)"
    );
    let prblm = $(solved[0]).text();
    // console.log(`nithin ${prblm}`);
    let ccn = "";
    for (var x = 0; x < prblm.length; x++) {
      if (prblm[x] >= "0" && prblm[x] <= "9") {
        ccn += prblm[x];
      }
    }

    resObj["noOfProblemsSolved"] = parseInt(ccn) ?? 0;
    const solved2 = $(
      "body > main > div > div > div > div > div > section:nth-child(7) > h3:nth-child(3)"
    );
    prblm = $(solved2[0]).text();
    ccn = "";
    for (var x = 0; x < prblm.length; x++) {
      if (prblm[x] >= "0" && prblm[x] <= "9") {
        ccn += prblm[x];
      }
    }

    resObj["noOfProblemsSolved"] += parseInt(ccn) ?? 0;

    //No Of Contests
    const noOfContests = $(
      "body > main > div > div > div > div > div > section.rating-graphs.rating-data-section > div.rating-title-container > div > b"
    );
    resObj["noOfContests"] = parseInt($(noOfContests[0]).text()) ?? 0;
    // console.log(Number.isNaN(resObj.noOfContests));
    if (Number.isNaN(resObj["noOfContests"])) resObj["noOfContests"] = 0;
    if (Number.isNaN(resObj["noOfProblemsSolved"]))
      resObj["noOfProblemsSolved"] = 0;
    if (Number.isNaN(resObj["rating"])) resObj["rating"] = 0;

    responce.send({ message: "User Details are", payload: resObj });
  })
);

// ********************************************************************************************************************************************************************
//LeetCode
fetchapp.get(
  "/lc/:username",
  expressAsyncHandler(async (req, res) => {
    const URL = "https://leetcode.com/" + req.params.username;
    console.log(URL);
    let resObj = {};
    const result = await axios(URL);
    const $ = cheerio.load(result.data);

    //for Contest Rating
    const rating = $(
      "#__next > div > div.mx-auto.w-full.grow.p-4.md\\:mt-0.md\\:max-w-\\[888px\\].md\\:p-6.lg\\:max-w-screen-xl.mt-\\[50px\\] > div > div.w-full.lc-lg\\:max-w-\\[calc\\(100\\%_-_316px\\)\\] > div.bg-layer-1.dark\\:bg-dark-layer-1.rounded-lg.my-4.hidden.h-\\[200px\\].w-full.p-4.lc-lg\\:mt-0.lc-xl\\:flex > div.lc-md\\:min-w-none.h-full.w-full.min-w-\\[200px\\].flex-1 > div > div.relative.min-h-\\[53px\\].text-xs > div > div:nth-child(1) > div.text-label-1.dark\\:text-dark-label-1.flex.items-center.text-2xl"
    );
    var x = $(rating[0]).text();
    var rat = "";
    for (var i = 0; i < x.length; i++) {
      if (x[i] >= "0" && x[i] <= "9") {
        rat += x[i];
      }
    }
    resObj["rating"] = parseInt(rat) ?? 0;

    //No of problems Solved
    const noOfProblemsSolved = $(
      "#__next > div > div.mx-auto.mt-\\[50px\\].w-full.grow.p-4.md\\:mt-0.md\\:max-w-\\[888px\\].md\\:p-6.lg\\:max-w-screen-xl > div > div.w-full.lc-lg\\:max-w-\\[calc\\(100\\%_-_316px\\)\\] > div.flex.w-full.flex-col.space-x-0.space-y-4.lc-xl\\:flex-row.lc-xl\\:space-y-0.lc-xl\\:space-x-4 > div.min-w-max.max-w-full.w-full.flex-1 > div > div.mx-3.flex.items-center.lc-xl\\:mx-8 > div.mr-8.mt-6.flex.min-w-\\[100px\\].justify-center > div > div > div > div.text-\\[24px\\].font-medium.text-label-1.dark\\:text-dark-label-1"
    );
    resObj["noOfProblemsSolved"] =
      parseInt($(noOfProblemsSolved[0]).text()) ?? 0;

    //No Of Contests
    const noOfContests = $(
      "#__next > div > div.mx-auto.w-full.grow.p-4.md\\:mt-0.md\\:max-w-\\[888px\\].md\\:p-6.lg\\:max-w-screen-xl.mt-\\[50px\\] > div > div.w-full.lc-lg\\:max-w-\\[calc\\(100\\%_-_316px\\)\\] > div.bg-layer-1.dark\\:bg-dark-layer-1.rounded-lg.my-4.hidden.h-\\[200px\\].w-full.p-4.lc-lg\\:mt-0.lc-xl\\:flex > div.lc-md\\:min-w-none.h-full.w-full.min-w-\\[200px\\].flex-1 > div > div.relative.min-h-\\[53px\\].text-xs > div > div.hidden.md\\:block > div.text-label-1.dark\\:text-dark-label-1.font-medium.leading-\\[22px\\]"
    );
    resObj["noOfContests"] = parseInt($(noOfContests[0]).text()) ?? 0;
    if (Number.isNaN(resObj["noOfContests"])) resObj["noOfContests"] = 0;
    if (Number.isNaN(resObj["noOfProblemsSolved"]))
      resObj["noOfProblemsSolved"] = 0;
    if (Number.isNaN(resObj["rating"])) resObj["rating"] = 0;

    res.send({ message: "user details are ", payload: resObj });
  })
);

// ********************************************************************************************************************************************************************

//codeForces
fetchapp.get(
  "/cf/:username",
  expressAsyncHandler(async (req, res) => {
    const URL = "https://codeforces.com/profile/" + req.params.username;
    console.log(URL);
    const result = await axios.get(URL);
    resObj = {};
    const $ = cheerio.load(result.data);

    //contest rating
    const rating = $(
      "#pageContent > div:nth-child(3) > div.userbox > div.info > ul > li:nth-child(1) > span.user-gray"
    );
    resObj["rating"] = parseInt($(rating[0]).text()) ?? 0;
    //no of problems solved
    const noOfProblemsSolved = $(
      "#pageContent > div._UserActivityFrame_frame > div > div._UserActivityFrame_footer > div:nth-child(1) > div:nth-child(1) > div._UserActivityFrame_counterValue"
    );
    let idx = 0;
    let temp = $(noOfProblemsSolved).text();
    for (var i = 0; i < temp.length; i++) {
      if (temp[i] === " ") {
        idx = i;
        break;
      }
    }
    // console.log(idx)
    resObj["noOfProblemsSolved"] = parseInt(temp.slice(0, idx)) ?? 0;

    // URL For Contest
    const URL1 = "https://codeforces.com/contests/with/" + req.params.username;
    let result1 = await axios.get(URL1);
    const $$ = cheerio.load(result1.data);

    //no of contests
    const noOfContests = $$(
      "#pageContent > div.datatable > div:nth-child(6) > table > tbody > tr"
    );
    resObj["noOfContests"] = parseInt(noOfContests.length) ?? 0;

    if (Number.isNaN(resObj["noOfContests"])) resObj["noOfContests"] = 0;
    if (Number.isNaN(resObj["noOfProblemsSolved"]))
      resObj["noOfProblemsSolved"] = 0;
    if (Number.isNaN(resObj["rating"])) resObj["rating"] = 0;

    //Response
    res.send({ message: "user details are", payload: resObj });
  })
);
// ********************************************************************************************************************************************************************

//Spoj
fetchapp.get(
  "/spoj/:username",
  expressAsyncHandler(async (req, res) => {
    const URL = "https://www.spoj.com/users/" + req.params.username;

    const result = await axios.get(URL);
    const $ = cheerio.load(result.data);
    console.log(URL);
    var resObj = {};
    //no of problems solved
    const noOfProblemsSolved = $(
      "#content > div:nth-child(2) > div > div.col-md-9 > div:nth-child(2) > div > div.row > div.col-md-6.text-center.valign-center > dl > dd:nth-child(2)"
    );
    resObj["noOfProblemsSolved"] =
      parseInt($(noOfProblemsSolved[0]).text()) ?? 0;

    if (Number.isNaN(resObj["noOfProblemsSolved"]))
      resObj["noOfProblemsSolved"] = 0;

    //Send Response
    res.send({ message: "users data is ", payload: resObj });
  })
);
// ********************************************************************************************************************************************************************

//Hackerrank + Algo + Data structures
fetchapp.get(
  "/hr/:username",
  expressAsyncHandler(async (req, res) => {
    var resObj = {};
    var URL =
      "https://www.hackerrank.com/leaderboard?filter=" +
      req.params.username +
      "&filter_on=hacker&page=1&track=algorithms&type=practice";
    console.log(URL);
    var result = await axios.get(URL, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36",
      },
    });
    // resObj['username']=req.params.username;
    var $ = cheerio.load(result.data);
    var score = $(
      "#tab-1-content-0 > section > div.general-table-wrapper > div > div > div.table-body > div > div > div.table-row-column.ellipsis.score > span"
    );
    var x = $(score[0]).text();
    if (x == "") {
      resObj["algo_score"] = 0;
    } else {
      resObj["algo_score"] = parseInt(x) ?? 0;
    }

    URL =
      "https://www.hackerrank.com/leaderboard?filter=" +
      req.params.username +
      "&filter_on=hacker&page=1&track=data-structures&type=practice";
    console.log(URL);
    result = await axios.get(URL, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36",
      },
    });
    $ = cheerio.load(result.data);
    score = $(
      "#tab-1-content-0 > section > div.general-table-wrapper > div > div > div.table-body > div > div > div.table-row-column.ellipsis.score > span"
    );
    var x = $(score[0]).text();
    // console.log(x);

    if (x == "") {
      resObj["ds_score"] = 0;
    } else {
      resObj["ds_score"] = parseInt(x) ?? 0;
    }

    //score calculation

    res.send({ message: "users data is ", payload: resObj });
  })
);

// ********************************************************************************************************************************************************************
// interview bit
fetchapp.get(
  "/ib/:username",
  expressAsyncHandler(async (req, res) => {
    var resObj = {};
    // console.log(req.params);
    var URL = "https://www.interviewbit.com/profile/" + req.params.username;
    console.log(URL);
    var result;
    try {
      result = await axios.get(URL);
    } catch (err) {
      return res.send({ message: err });
    }
    const $ = cheerio.load(result.data);
    const noOfProblemsSolved = $(
      "body > div.container.user-profile > div.col-xs-12.col-md-4 > div.user-stats > div:nth-child(2) > div.txt"
    );
    resObj["noOfProblemsSolved"] =
      parseInt($(noOfProblemsSolved[0]).text()) ?? 0;
    if (Number.isNaN(resObj["noOfProblemsSolved"]))
      resObj["noOfProblemsSolved"] = 0;
    //Send Response
    res.send({ message: "users data is ", payload: resObj });
  })
);

module.exports = fetchapp;
