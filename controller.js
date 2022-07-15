const { proposalPlugins } = require("@babel/preset-env/data/shipped-proposals.js");
const pool = require("./mysqlcon.js");
const bcrypt = require("bcrypt");
const session = require("express-session");

exports.checkgroupFunction = (username) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT groupname FROM accounts WHERE username = ?", [username], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else if (result.length > 0) {
        const adminResult = result[0].groupname.split(",");
        resolve(adminResult);
      }
    });
  });
};

exports.loginFunction = (username, password) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM accounts WHERE username = ?", [username], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (err, response) => {
          console.log(result[0] + "WHoISTHIS");

          if (response == true && result[0].status == "1") {
            resolve(result[0]);
          } else {
            resolve("0");
          }
        });
      } else {
        resolve("1");
      }
    });
  });
};

exports.tableDataFunction = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT  username, email, groupname, status FROM accounts ", (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        // console.log(results);
        resolve({ result });
      }
    });
  });
};

exports.createUserFunction = (username, hash, email, groupname) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM accounts WHERE username = ?", [username], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else if (result.length > 0) {
        resolve(false);
      } else {
        pool.query("INSERT INTO `accounts` (`username`, `password`, `email`, `groupname`,`status`) VALUES ( ?,?,?,?,?)", [username, hash, email, groupname, "1"], (err, result) => {
          console.log(hash);
          if (err) {
            console.log(err);
            reject(err);
          } else resolve(true);
        });
      }
    });
  });
};

exports.groupDataFunction = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM usergroup ", (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve({ result });
      }
    });
  });
};

exports.editGroupStatusFunction = (groupname, status) => {
  return new Promise((resolve, reject) => {
    console.log(groupname);
    console.log(status);
    pool.query("UPDATE `usergroup` SET `status` = ? WHERE (`usergroup_name` = ?)", [status, groupname], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log("group endis");
        resolve("success");
      }
    });
  });
};

exports.createGroupFunction = (usergroup_create) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM usergroup WHERE usergroup_name = ?", [usergroup_create], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else if (result.length > 0) {
        resolve(false);
      } else {
        pool.query("INSERT INTO `usergroup` (`usergroup_name`, `status`) VALUES (?,1)", [usergroup_create], (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else resolve(true);
        });
      }
    });
  });
};

exports.userRolesFunction = (rowusername) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT `groupname` FROM `accounts` WHERE (`username` = ?)", [rowusername], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        const aresult = result[0].groupname.split(",");
        console.log;
        resolve({ aresult });
      }
    });
  });
};

exports.editUserFunction = (username, hash, email, groupname) => {
  return new Promise((resolve, reject) => {
    if (hash) {
      pool.query("UPDATE `accounts` SET `password` = ? WHERE (`username` = ?)", [hash, username], (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        }
      });
    }
    if (email) {
      pool.query("UPDATE `accounts` SET `email` = ? WHERE (`username` = ?)", [email, username], (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        }
      });
    }
    if (groupname) {
      console.log(groupname + " sql groupname");
      pool.query("UPDATE `accounts` SET `groupname` = ? WHERE (`username` = ?)", [groupname + "", username], (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        }
      });
    }
    resolve(true);
  });
};

exports.editStatusFunction = (username, status) => {
  return new Promise((resolve, reject) => {
    console.log(username);
    pool.query("UPDATE `accounts` SET `status` = ? WHERE (`username` = ?)", [status, username], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log("why this runuser endis");
        resolve("success");
      }
    });
  });
};

exports.changeSelfEmailFunction = (email, username) => {
  return new Promise((resolve, reject) => {
    pool.query("UPDATE `accounts` SET `email`= ? WHERE `username`=? ", [email, username], (err, result) => {
      console.log(username);
      if (err) {
        console.log(err);
        reject(err);
      } else resolve(true);
    });
  });
};

exports.changeSelfPasswordFunction = (hash, username) => {
  return new Promise((resolve, reject) => {
    pool.query("UPDATE `accounts` SET `password`= ? WHERE `username`=? ", [hash, username], (err, result) => {
      console.log(username);
      if (err) {
        console.log(err);
        reject(err);
      } else resolve(true);
    });
  });
};
