const { proposalPlugins } = require("@babel/preset-env/data/shipped-proposals.js");
const pool = require("./mysqlcon.js");
const session = require("express-session");

exports.createApplicationFunction = (app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permitcreate, app_permitopen, app_permittodo, app_doing, app_done) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM application WHERE app_acronym = ?", [app_acronym], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else if (result.length > 0) {
        resolve(false);
      } else {
        pool.query("INSERT INTO `application` (app_Acronym, app_Description, app_Rnumber, app_startDate, app_endDate, app_permit_Create, app_permit_Open, app_permit_ToDoList, app_permit_Doing, App_permit_Done) VALUES ( ?,?,?,?,?,?,?,?,?,?)", [app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permitcreate, app_permitopen, app_permittodo, app_doing, app_done], (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else resolve(true);
        });
      }
    });
  });
};

exports.applicationDataFunction = () => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT App_Acronym, App_Description, App_Rnumber, DATE_FORMAT(App_startDate, "%Y-%m-%d") AS App_startDate, DATE_FORMAT(App_endDate, "%Y-%m-%d") AS App_endDate, App_permit_Create, App_permit_Open, App_permit_ToDoList, App_permit_Doing, App_permit_Done FROM application ', (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve({ result });
      }
    });
  });
};

exports.createPlanFunction = (acronym, planname, startdatep, enddatep) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM plan WHERE Plan_MVP_name = ?", [planname], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else if (result.length > 0) {
        resolve(false);
      } else {
        pool.query("INSERT INTO `plan` (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym) VALUES ( ?,?,?,?)", [planname, startdatep, enddatep, acronym], (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else resolve(true);
        });
      }
    });
  });
};

exports.planDataFunction = (acronym) => {
  return new Promise((resolve, reject) => {
    console.log(acronym);
    pool.query(`SELECT Plan_MVP_name, DATE_FORMAT(Plan_startDate, "%Y-%m-%d") AS Plan_startDate, DATE_FORMAT(Plan_endDate, "%Y-%m-%d") AS Plan_endDate, Plan_app_Acronym FROM plan WHERE Plan_app_Acronym = ?`, [acronym], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(result);
        console.log("yoyoyoyo");
        resolve(result);
      }
    });
  });
};

exports.taskDataFunction = (planmvpname) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM task WHERE Task_plan = ?", [planmvpname], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve({ result });
      }
    });
  });
};
