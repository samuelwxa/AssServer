const express = require("express");
const app = express();
const cors = require("cors");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const pool = require("./mysqlcon.js");
const controller = require("./controller.js");
const controllertask = require("./controllertask.js");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { request } = require("express");
const { resolveShowConfigPath } = require("@babel/core/lib/config/files/index.js");
const saltRounds = 10;

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,10}$/;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    keys: "password",
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 60 * 60 * 24 * 1000,
    },
  })
);

async function Checkgroup(username, usergroup) {
  let result = await controller.checkgroupFunction(username);
  if (result.includes(usergroup)) {
    return true;
  } else {
    return false;
  }
}

app.post("/CheckGroup", async (req, res) => {
  groupNeeded = req.body.groupNeeded;
  if ((await Checkgroup(req.body.user, req.body.groupNeeded)) == true) {
    console.log("does this run now");
    res.send({ groupNeeded: true });
  } else res.send({ groupNeeded: false });
});

const port = 3001;

app.get("/loggedin", async (req, res) => {
  if (req.session.status == "0") {
    res.send({ loggedInStatus: false, user: req.session.user, isAdmin: false });
  } else if (req.session.status == "1") {
    res.send({ loggedInStatus: true, user: req.session.user, email: req.session.email, groups: req.session.groupname });
  } else {
    res.send({ loggedInStatus: false });
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, async (err, hash) => {
    let result = await controller.loginFunction(username, password);
    if (result === "0") {
      res.send("0");
    } else if (result === "1") {
      res.send("1");
    } else {
      req.session.user = result.username;
      req.session.groupname = result.groupname;
      req.session.status = result.status;
      req.session.email = result.email;
      res.send(req.session.user);
    }
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send(false);
});

app.get("/UserManagement", async (req, res) => {
  let result = await controller.tableDataFunction();
  res.send(result);
});

app.post("/Usermanagement/Createuser/Submit", async (req, res) => {
  if (req.body.username == null || req.body.password == null) {
    res.send(false);
  } else {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const groupname = req.body.groupArray;

    if (passwordRegex.test(password)) {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        let result = await controller.createUserFunction(username, hash, email, groupname);
        if (result == true) {
          res.send(true);
        } else if (result == false) {
          res.send("Duplicate");
        }
      });
    } else res.send("0");
  }
});

app.get("/UserManagement/CreateGroup", async (req, res) => {
  let result = await controller.groupDataFunction();

  res.send(result);
});

app.post("/Usermanagement/CreateGroup/EnDisGroup", async (req, res) => {
  const groupname = req.body.groupnameS;
  const status = req.body.edStatus;

  let result = await controller.editGroupStatusFunction(groupname, status);
  res.send("group Successfully edited");
});

app.post("/UserManagement/CreateGroup/Submit", async (req, res) => {
  if (!req.body.usergroup_create) {
    res.send(false);
  } else {
    const usergroup_create = req.body.usergroup_create;
    let result = await controller.createGroupFunction(usergroup_create);

    if (result == true) {
      res.send(true);
    } else if (result == false) {
      res.send("Duplicate");
    }
  }
});

app.post("/UserManagement/User", async (req, res) => {
  const rowusername = req.body.rowusername;

  let result = await controller.userRolesFunction(rowusername);

  res.send(result);
});

app.post("/Usermanagement/SubmitEdit", async (req, res) => {
  if (!req.body.email && !req.body.password && !req.body.checked) {
    res.send(false);
  } else {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const groupname = req.body.checked;

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      let result = await controller.editUserFunction(username, hash, email, groupname);
      if (result === true) {
        res.send(true);
      }
    });
  }
});

app.post("/Usermanagement/EnDis", async (req, res) => {
  const username = req.body.usernameS;
  const status = req.body.edStatus;

  let result = await controller.editStatusFunction(username, status);
  res.send("User Successfully edited");
});

app.post("/EditProfile/ChangeEmail/Submit", async (req, res) => {
  const email = req.body.email;
  const username = req.session.user;
  let result = await controller.changeSelfEmailFunction(email, username);
  if (result == false) {
    res.send(null);
  } else if (result == true) {
    req.session.email = email;
    res.send(true);
  }
});

app.post("/EditProfile/ChangePassword/Submit", async (req, res) => {
  const password = req.body.password;
  const username = req.session.user;

  if (passwordRegex.test(password)) {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      let result = await controller.changeSelfPasswordFunction(hash, username);

      res.send(result);
    });
  } else res.send(false);
});

app.get("/TaskManagement/Applications", async (req, res) => {
  console.log("does this get function run");
  let result = await controllertask.applicationDataFunction();
  res.send(result);
});

app.post("/TaskManagement/CreateApplication/Submit", async (req, res) => {
  console.log(req.body);
  const acronym = req.body.acronym;
  const description = req.body.description;
  const rnumber = req.body.rnumber;
  const startdate = req.body.startdate;
  const enddate = req.body.enddate;
  const app_permitcreate = req.body.permitcreate;
  const app_permitopen = req.body.permitopen;
  const app_permittodo = req.body.permittodo;
  const app_doing = req.body.permitdoing;
  const app_done = req.body.permitdone;
  let result = await controllertask.createApplicationFunction(acronym, description, rnumber, startdate, enddate, app_permitcreate, app_permitopen, app_permittodo, app_doing, app_done);
  if (result == true) {
    res.send(true);
  } else if (result == false) {
    res.send("Duplicate");
  }
});

app.post("/TaskManagement/CreatePlan/Submit", async (req, res) => {
  console.log(req.body);
  const acronym = req.body.Acronym;
  const planname = req.body.createplans;
  const startdatep = req.body.startdatep;
  const enddatep = req.body.enddatep;

  let result = await controllertask.createPlanFunction(acronym, planname, startdatep, enddatep);
  if (result == true) {
    res.send(true);
  } else if (result == false) {
    res.send("Duplicate");
  }
});

app.post("/TaskManagement/Plans", async (req, res) => {
  const acronym = req.body.Acronym;
  console.log("does this get function run");
  let result = await controllertask.planDataFunction(acronym);
  console.log(result);
  res.send(result);
});

app.post("/TaskManagement/ViewTask", async (req, res) => {
  const planmvpname = req.body.planmvpname;
  console.log("does this get task function run");
  let result = await controllertask.taskDataFunction(planmvpname);
  console.log(result);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
