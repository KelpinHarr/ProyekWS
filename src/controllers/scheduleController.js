const db = require("../models/index");
const joi = require("joi").extend(require('@joi/date'));
const multer = require("multer");
const fs = require("fs");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const jwt = require("jsonwebtoken");
const upload = multer({
  dest : "./uploads",
});

//====================================
function keDate(dateString) {
  // Membagi string tanggal menjadi komponen hari, bulan, dan tahun
  const [day, month, year] = dateString.split('/');

  // Membuat objek Date dengan jam 00:00
  const dateTime = new Date(`${year}-${month}-${day}T00:00:00`);

  return dateTime;
}
const moment = require('moment');

function keTime(timeString) {
  const format = 'HH:mm'; // Format waktu yang diharapkan
  const time = moment(timeString, format);

  return timeString;
}

function tanggalToString(tanggal) {
  return (tanggal.toISOString().slice(0, 10).replace('T', ' '))
}

//====================================
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
    console.log(keDate(date))
           
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

        if(user1.id == user2.id){
          res.status(404).json({
            "message" : "You can't add yourself"
          })
        }

        const cariSchedule = await db.Schedule.findAll({
          where: {
            UserId1: user1.id,
            UserId2: user2.id,
            tanggal: keDate(date),
            waktu: keTime(time)
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
            tanggal: keDate(date),
            waktu: keTime(time)
          })
          const result = {
            "message" : "Schedule Added",
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
  },
  cancelSchedule : async function(req, res){
    const { id_schedule } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    // console.log(keDate(date))
           
    if (!id_schedule){
      const result = {
        "message" : "Field can't be empty!"
      }
      res.status(400).json(result);
    }
    else {
      const cariSchedule = await db.Schedule.findAll({
        where: {
          id: id_schedule
        }
      })
      if (cariSchedule.length == 0){
        const result = {
          "message" : "Schedule not found"
        }
        res.status(404).json(result);
      }
      else {
        if(cariSchedule[0].status=='pending'||cariSchedule[0].status=='approved'){

          if(user1.id==cariSchedule[0].UserId1||user1.id==cariSchedule[0].UserId2){
            const schedule = await db.Schedule.update({
              status : "cancelled",
            },{
              where:{
                id:id_schedule
              }
            })
            const result = {
              "message" : "Schedule Cancelled",
              // date : date,
              // time : time,
              "scheduleId" : cariSchedule[0].id,
              "UserId1" : user1.username,
              "UserId2" : cariSchedule[0].UserId2,
              "date" : cariSchedule[0].tanggal,
              "time" : cariSchedule[0].waktu
            }
            res.status(201).json(result);
          }
          else{
            // console.log(user1.id)
            // console.log(cariSchedule[0].UserId1)
            // console.log(cariSchedule[0].UserId2)
            const result = {
              "message" : "Unauthorized"
            }
            res.status(400).json(result);
          }
        }
        else{
          const result = {
            "message" : "invalid schedule status"
          }
          res.status(400).json(result);
        }
      }
    }
  },
  showPendingSchedule : async function(req, res){
    const cariSchedule = await db.Schedule.findAll({
      where: {
        status: "pending"
      }
    })
    const userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    if (cariSchedule.length == 0){
      const result = {
        "message" : "There are no pending schedule"
      }
      res.status(400).json(result);
    }
    else {

      let temp = [];
      for (let i = 0; i < cariSchedule.length; i++) {
        if (user1.id == cariSchedule[i].UserId1 || user1.id == cariSchedule[i].UserId2){
          temp.push({
            id: cariSchedule[i].id,
            tanggal: tanggalToString(cariSchedule[i].tanggal),
            waktu: cariSchedule[i].waktu,
          })
        }
      }

      const result = {
        "Schedule" : temp
      }
      
      res.status(200).json(result);
    }
  },
  listSchedule : async function(req, res){
    const cariSchedule = await db.Schedule.findAll();
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    
    let temp = [];
    for (let i = 0; i < cariSchedule.length; i++) {
      if (user1.id==cariSchedule[i].UserId1||user1.id==cariSchedule[i].UserId2){
        temp.push({
          id: cariSchedule[i].id,
          status: cariSchedule[i].status,
          tanggal: tanggalToString(cariSchedule[i].tanggal),
          waktu: cariSchedule[i].waktu,
        })
      }
    }

    const result = {
      "List Schedule" : temp
    }
    res.status(200).json(result);
  },
  approveSchedule : async function(req, res){
    const { id_schedule, status } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    const cariSchedule = await db.Schedule.findAll({
      where: {
        id: req.body.id_schedule,
        status: "pending"
      }
    })

    if (cariSchedule.length == 0){
      const result = {
        "message" : "Schedule not found"
      }
      res.status(404).json(result);
    }
    else {
      if(user1.id == cariSchedule[0].UserId2){
        const updateStatus = await db.Schedule.update({
          status: req.body.status
        },{
          where: {
            id: req.body.id_schedule
          }
        })

        const result = {
          "message" : "Schedule Approved",
        }
        res.status(200).json(result);
      }
      else {
        const result = {
          "message" : "Invalid User"
        }
        res.status(400).json(result);
      }
    }
  }
};
