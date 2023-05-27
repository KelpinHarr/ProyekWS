const db = require("../models/index");
const joi = require("joi").extend(require('@joi/date'));
const multer = require("multer");
const fs = require("fs");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const jwt = require("jsonwebtoken");
const upload = multer({
  dest : "./uploads",
});
const Sequelize = require('sequelize');
const { Op } = Sequelize;
//====================================
function keDate(dateString) {
  // Membagi string tanggal menjadi komponen hari, bulan, dan tahun
  const [day, month, year] = dateString.split('/');

  // Membuat objek Date dengan jam 00:00
  const dateTime = new Date(`${year}-${month}-${day}T00:00:00`);

  return dateTime;
}
const moment = require('moment');
const { group } = require("console");

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
  createGroup : async function (req, res) {
    const { name, description } = req.body;

    if(!name || !description){
      return res.status(400).send({
        message : "name and description cannot be empty"
      })
    }
    const UserId = req.user.id;
    groupCode = Math.random().toString(36).split(".")[1].toString().substring(0,6);
    console.log(groupCode)
    cariGroup = await db.Group.findOne({
      where : {
        groupCode : groupCode
      }
    })
    
    for (let i = 0; i < 10; i++) {
      if(cariGroup){
        code = Math.random().toString(36).split(".")[1].toString().substring(0,6);
        cariGroup = await db.Group.findOne({
          where : {
            groupCode : groupCode
          }
        })
      }
    }

    const group = await db.Group.create({
      name,
      description,
      groupCode
    });

    const tambahUser = await db.UserGroup.create({
      GroupId : group.id,
      UserId : UserId,
      status: 'joined'
    })

    return res.status(200).send({
      id : group.id,
      name : group.name,
      code : group.groupCode,
      description : group.description,
      members : 1
    });
  },
  joinGroup : async function (req, res) {
    const { code } = req.params;
    const UserId = req.user.id;
    if(!code){
      return res.status(400).send({
        message : "group code cannot be empty"
      })
    }

    cariGroup = await db.Group.findOne({
      where : {
        groupCode : code
      }
    })

    if(!cariGroup){
      return res.status(404).send({
        message : "group not found"
      })
    }

    cariGroupMember = await db.UserGroup.findOne({
      where : {
        GroupId : cariGroup.id,
        UserId : UserId,
        status : 'joined'
      }
    })

    if(cariGroupMember){
      return res.status(400).send({
        message : "user already joined this group"
      })
    }

    await db.UserGroup.create({
      GroupId : cariGroup.id,
      UserId : UserId,
      status : 'joined'
    })

    jumlahMember = await db.UserGroup.findAndCountAll({
      where : {
        GroupId : cariGroup.id,
        status : 'joined'
      }
    })

    return res.status(200).send({
      message : "success join group",
      group_name : cariGroup.name,
      members : jumlahMember.count
    })  
  },
  getGroupById : async function (req, res) {
    idGroup = req.params.id;
    if(!idGroup){
      return res.status(400).send({
        message : "id group cannot be empty"
      })
    }

    cariGroup = await db.Group.findByPk(idGroup)

    if(!cariGroup){
      return res.status(404).send({
        message : "group not found"
      })
    }

    cariJumlahMember = await db.UserGroup.findAndCountAll({
      where : {
        GroupId : idGroup
      }
    })

    return res.status(200).send({
      id : cariGroup.id,
      name : cariGroup.name,
      code : cariGroup.groupCode,
      description : cariGroup.description,
      members : cariJumlahMember.count
    })
  },
  addMeeting : async function(req, res){
    const { group_id, date, time } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    console.log(keDate(date))
           
    if (!group_id || !date || !time){
      const result = {
        "message" : "Field can't be empty!"
      }
      res.status(400).json(result);
    }
    else {
      const cariGroup2 = await db.UserGroup.findAll({
        where: {
          UserId: user1.id,
          GroupId: group_id
        }
      })
      if (cariGroup2.length == 0) {
        const result = {
          "message" : "You are not in this group!"
        }
        res.status(400).json(result);
      }
      else {
      //cek ada schedule atau meeting user yang sama dengan meeting yang ingin dibuat
        const cariSchedule = await db.Schedule.findAll({
          where: {
            [Op.or]: [
              {
                UserId1: user1.id,
                tanggal: keDate(date),
                waktu: time,
                status: {
                  [Op.notLike]: 'cancelled'
                }
              },
              {
                UserId2: user1.id,
                tanggal: keDate(date),
                waktu: time,
                status: {
                  [Op.notLike]: 'cancelled'
                }
              },
            ]
          }
        });
        var adaTabrakan=false;
        //dapatkan semua user dalam group
        const cariUser = await db.UserGroup.findAll({
          where: {
            GroupId: group_id
          }
        });
        //cek apakah ada user yang memiliki schedule atau meeting yang sama dengan meeting yang ingin dibuat
        for (let i = 0; i < cariUser.length; i++) {
          const cariSchedule2 = await db.Schedule.findAll({
            where: {
              [Op.or]: [
                {
                  UserId1: cariUser[i].UserId,
                  tanggal: keDate(date),
                  waktu: time
                },
                {
                  UserId2: cariUser[i].UserId,
                  tanggal: keDate(date),
                  waktu: time
                },
              ]
            }
          });

          const cariGroup = await db.UserGroup.findAll({
            where: {
              UserId: cariUser[i].UserId
            }
          })
          var adaMeeting=false;
          for (let i = 0; i < cariGroup.length; i++) {
            const cariMeeting = await db.Meeting.findAll({
              where: {
                GroupId: cariGroup[i].GroupId,
                tanggal: keDate(date),
                waktu: time
              }
            })
            if(cariMeeting.length>0){
              adaMeeting=true;
            }
          }

          if (cariSchedule2.length > 0 || adaMeeting){
            adaTabrakan=true;
          }
        }
        
        if(adaTabrakan==true){
          const result = {
            "message" : "There is a schedule or meeting at the same time"
          }
          res.status(400).json(result);
        }
        else{
          const createMeeting = await db.Meeting.create({
            GroupId: group_id,
            tanggal: keDate(date),
            waktu: time,
            UserId: user1.id,
            status: "valid"
          })
          const result = {
            "message" : "Meeting created"
          }
          res.status(200).json(result);
        }
      }
      
    }
  },
  deleteMeeting : async function(req, res){
    const { meeting_id } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    // console.log(keDate(date))
           
    if (!meeting_id){
      const result = {
        "message" : "Field can't be empty!"
      }
      res.status(400).json(result);
    }
    else {
      const cariMeeting = await db.Meeting.findAll({
        where: {
          id: meeting_id
        }
      })
      if (cariMeeting.length == 0) {
        const result = {
          "message" : "Meeting not found!"
        }
        res.status(400).json(result);
      }
      else {
        const cariGroup2 = await db.UserGroup.findAll({
          where: {
            UserId: user1.id,
            GroupId: group_id
          }
        })
        if (cariGroup2.length == 0) {
          const result = {
            "message" : "You are not in this group!"
          }
          res.status(400).json(result);
        }
        else {
          if(cariMeeting[0].UserId!=user1.id){
            const result = {
              "message" : "You can't cancel this meeting!"
            }
            res.status(400).json(result);
          }
          else{
            //delete meeting
            await db.Meeting.delete({
              where: {
                id: meeting_id
              }
            })
            const result = {
              "message" : "Meeting cancelled"
            }
            res.status(200).json(result);
          }
        }
      }
    }
  },
  getMeetingDetail : async function(req, res){
    // console.log("masuk")
    const { meeting_id } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    // console.log(keDate(date))
    
    if (!meeting_id){
      const result = {
        "message" : "Field can't be empty!"
      }
      res.status(400).json(result);
    }
    else {
      const cariMeeting = await db.Meeting.findAll({
        where: {
          id: meeting_id
        }
      })
      
      if (cariMeeting.length == 0) {
        const result = {
          "message" : "Meeting not found!"
        }
        res.status(400).json(result);
      }
      else {
        const cariGroup2 = await db.UserGroup.findAll({
          where: {
            UserId: user1.id,
            GroupId: cariMeeting[0].GroupId
          }
        })
        
        if (cariGroup2.length == 0) {
          
          const result = {
            "message" : "You are not in this group!"
          }
          res.status(400).json(result);
        }
        else {
          //get meeting detail
          const cariMeetingDetail = await db.Meeting.findAll({
            where: {
              id: meeting_id
            },
            include: [
              {
                model: db.Group,
                as: "Group"
              },
              {
                model: db.User,
                as: "User"
              }
            ]
          })
          const result = {
            "message" : "Meeting detail",
            "data" : cariMeetingDetail
          }
          res.status(200).json(result);
        }
      }
    }
  },
};
