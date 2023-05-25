const db = require("../models/index");
const joi = require("joi").extend(require('@joi/date'));
const multer = require("multer");
const fs = require("fs");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const jwt = require("jsonwebtoken");
const upload = multer({
  dest : "./uploads",
});

module.exports = {
  cekToken : async function (req, res, next){
    const token = req.headers["x-auth-token"];
    if(!token){
      return res.status(401).send({
        message : "unauthorized!"
      })
    }
  
    try{
      const user = jwt.verify(token, PRIVATE_KEY)
      req.user = user;
      next()
    }catch(e){
      console.log(e);
      return res.status(400).send(e);
    }
  },

  addSchedule : async function(req, res){
    const { username, date, time } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
           
    if (!username || !date || !time){
      const result = {
        "message" : "Field can't be empty!"
      }
      res.status(400).json(result);
    }
    else {
      const cariUser = await db.User.findAll({
        where: {
          username: username
        }
      })
      if (cariUser.length == 0){
        const result = {
          "message" : "User not found"
        }
        res.status(404).json(result);
      }
      else {
        user2 = cariUser[0].dataValues;


        
        const cariSchedule = await db.Schedule.findAll({
          where: {
            UserId1: user1.id,
            UserId2: user2.id,
            tanggal: date,
            waktu: time
          }
        })
        if (cariSchedule.length > 0){
          res.status(404).json({
            "message" : "Schedule already exist"
          })
        }
        else {
          const schedule = await db.Schedule.create({
            UserId1: user1.id,
            UserId2: user2.id,
            status : "pending",
            tanggal: date,
            waktu: time
          })
          const result = {
            "message" : "Schedule Added",
            // date : date,
            // time : time,
            "scheduleId" : schedule.id,
            "UserId1" : user1.username,
            "UserId2" : user2.username,
            "date" : schedule.tanggal,
            "time" : schedule.waktu
          }
          res.status(201).json(result);
        }
      }
    }
  }
};
