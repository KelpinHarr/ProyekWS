const db = require("../models/index");
const joi = require("joi").extend(require('@joi/date'));
const multer = require("multer");
const fs = require("fs");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const mailjet = require('node-mailjet').connect("34e863ef1280dba6ab3dba7e0f11aded", "198e9705382ac5c517ba5a29297a4bb8")
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
  const dateTime = new Date(`${year}-${month}-${day}T11:00:00`);

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

function sendEmail(pemail, pusername) {
    // Variabel yang menampung desain email yang akan dikirim
    const contentEmail = `
    <h1>Hai ${pusername},</h1>
    <p>Selamat, kamu telah berhasil mengirim email menggunakan Mailjet!</p>`

  const request = mailjet
    .post("send", { 'version': 'v3.1' })
    .request({
        "Messages": [{
            "From": {
                "Email": "calvinharsono07@gmail.com",
                "Name": "Calvin"
            },
            "To": [{
                "Email": pemail, 
                "Name": pusername    
            }],
            "Subject": "Selamat, email kamu berhasil terkirim",
            "HTMLPart": contentEmail
        }]
    })
  request
    .then((result) => {
        // res.send({
        //     status: result.response.status,
        //     result: result.body
        // });
        return "sukses"
    })
    .catch((err) => {
        // res.send({
        //     status: err.statusCode,
        //     massage: err.message
        // });
        return "error"
    })
}
function keDatetime(tanggal,waktu) {
  const format = 'HH:mm'; // Format waktu yang diharapkan
  // console.log(tanggal);
  const time = moment(waktu, format);
  //tanggal masih dalam datetime
  const tanggalBaru = tanggalToString(tanggal);
  //tanggal baru=tanggal biasa
  // console.log(tanggalBaru);
  // console.log(`ini tanggalnya ${tanggalBaru} adasisdasidashd ${time}:00`);
  const dateTime = new Date(`${tanggalBaru} ${waktu}:00`);
  // console.log(dateTime);
  return dateTime;
}
function isTabrakan(tanggal,awal1,akhir1,awal2,akhir2) {

  const start1 = keDatetime(tanggal,awal1);
  const end1 = keDatetime(tanggal,akhir1);
  const start2 = keDatetime(tanggal,awal2);
  const end2 = keDatetime(tanggal,akhir2);

  // Pengecekan rentang waktu
  if (start1 <= start2 && start2 < end1) {
    return true; // Rentang waktu 2 dimulai di antara rentang waktu 1
  }

  if (start2 <= start1 && start1 < end2) {
    return true; // Rentang waktu 1 dimulai di antara rentang waktu 2
  }

  return false; // Tidak ada tabrakan rentang waktu
}
function isTabrakan2(awal1,akhir1,awal2,akhir2) {

  const start1 = awal1;
  const end1 = akhir1;
  const start2 = awal2;
  const end2 = akhir2;

  // Pengecekan rentang waktu
  if (start1 <= start2 && start2 < end1) {
    return true; // Rentang waktu 2 dimulai di antara rentang waktu 1
  }

  if (start2 <= start1 && start1 < end2) {
    return true; // Rentang waktu 1 dimulai di antara rentang waktu 2
  }

  return false; // Tidak ada tabrakan rentang waktu
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
    const { username, date, start, end } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
           
    if (!username || !date || !start || !end){
      const result = {
        "message" : "Field can't be empty!"
      }
      return res.status(400).json(result);
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
        return res.status(404).json(result);
      }
      else {
        user2 = cariUser[0].dataValues;

        if(user1.id == user2.id){
          return res.status(404).json({
            "message" : "You can't add yourself"
          })
        }

        if (start >= end){
          const result = {
            "message" : "Start time must be less than end time"
          }
          return res.status(400).json(result);
        }

        const cariSchedule = await db.Schedule.findAll({
          where: {
            UserId1: {
              [Op.or]: [user1.id, user2.id]
            },
            UserId2: {
              [Op.or]: [user1.id, user2.id]
            },
            tanggal: keDate(date),
            waktumulai: keTime(start),
            waktuselesai: keTime(end)
          }
        })

        const cariGroup = await db.UserGroup.findAll({
          where: {
            UserId: {
              [Op.or]: [user1.id, user2.id]
            }
          }
        })

        tambahSchedule = true
        const cariSchedule2 = await db.Schedule.findAll({
          where: {
            tanggal: keDate(date),
          }
        })

        for (let i = 0; i < cariSchedule2.length; i++) {
          if (tambahSchedule == true) {
            if (cariSchedule2[i].UserId1 == user1.id || cariSchedule2[i].UserId2 == user1.id){
              tambahSchedule=false;
            } 

            if (cariSchedule2[i].waktumulai.toString().substring(0,5) == start){
              tambahSchedule=false;
            }
          }
        }
        
        var adaMeeting=false;
        for (let i = 0; i < cariGroup.length; i++) {
          const cariMeeting = await db.Meeting.findAll({
            where: {
              GroupId: cariGroup[i].GroupId,
              tanggal: keDate(date),
              waktumulai: keTime(start),
              waktuselesai: keTime(end)
            }
          })
          if(cariMeeting.length>0){
            adaMeeting=true;
          }
        }
        if (cariSchedule.length > 0 || adaMeeting==true  || tambahSchedule==false){
          if (tambahSchedule==false) { 
            return res.status(404).json({"message" : "You have a meeting at that time"}) 
          }
          return res.status(404).json({
            "message" : "Schedule already exist"
          })
        }
        else {
          const schedule = await db.Schedule.create({
            UserId1: user1.id,
            UserId2: user2.id,
            status : "pending",
            tanggal: keDate(date),
            waktumulai: keTime(start),
            waktuselesai: keTime(end)
          })
          sendEmail(user1.email, user1.username)
          const result = {
            "message" : "Schedule Added",
            "schedule_id" : schedule.id,
            "UserId1" : user1.username,
            "UserId2" : user2.username,
            "date" : tanggalToString(schedule.tanggal),
            "waktu" : schedule.waktumulai + " - " + schedule.waktuselesai,
          }
          return res.status(201).json(result);
        }
      }
    }
  },
  cancelSchedule : async function(req, res){
    const { id_schedule } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
           
    if (!id_schedule){
      const result = {
        "message" : "Field can't be empty!"
      }
      return res.status(400).json(result);
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
        return res.status(404).json(result);
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
              "scheduleId" : cariSchedule[0].id,
              "UserId1" : user1.username,
              "UserId2" : cariSchedule[0].UserId2,
              "date" : cariSchedule[0].tanggal,
              "waktu_mulai" : cariSchedule[0].waktumulai,
              "waktu_selesai" : cariSchedule[0].waktuselesai,
            }
            return res.status(201).json(result);
          }
          else{
            const result = {
              "message" : "Unauthorized"
            }
            return res.status(400).json(result);
          }
        }
        else{
          const result = {
            "message" : "invalid schedule status"
          }
          return res.status(400).json(result);
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
      return res.status(400).json(result);
    }
    else {
      let temp = [];
      for (let i = 0; i < cariSchedule.length; i++) {
        if (user1.id == cariSchedule[i].UserId1){
          user2 = await db.User.findByPk(cariSchedule[i].UserId2);
          temp.push({
            id: cariSchedule[i].id,
            User1: user1.display_name,
            User2: user2.display_name,
            tanggal: tanggalToString(cariSchedule[i].tanggal),
            waktu: cariSchedule[i].waktumulai + " - " + cariSchedule[i].waktuselesai,
          })
        } else if (user1.id == cariSchedule[i].UserId2){
          user2 = await db.User.findByPk(cariSchedule[i].UserId1);
          temp.push({
            id: cariSchedule[i].id,
            User1: user2.display_name,
            User2 :user1.display_name,
            tanggal: tanggalToString(cariSchedule[i].tanggal),
            waktu: cariSchedule[i].waktumulai + " - " + cariSchedule[i].waktuselesai,
          })
        }
      }

      const result = {
        "Schedule" : temp
      }
      
      return res.status(200).json(result);
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
          waktu: cariSchedule[i].waktumulai + " - " + cariSchedule[i].waktuselesai,
        })
      }
    }

    const result = {
      "List Schedule" : temp
    }
    return res.status(200).json(result);
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
      return res.status(404).json(result);
    }
    else {
      if(user1.id == cariSchedule[0].UserId2){
        const updateStatus = await db.Schedule.update({
          status: "Approved"
        },{
          where: {
            id: req.body.id_schedule
          }
        })

        const result = {
          "message" : "Schedule Approved",
        }
        return res.status(200).json(result);
      }
      else {
        const result = {
          "message" : "Invalid User"
        }
        return res.status(400).json(result);
      }
    }
  },
  detailSchedule : async function(req, res){
    const idSchedule = req.params.id_schedule;
    const cariSchedule = await db.Schedule.findByPk(idSchedule)

    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;

    if (!cariSchedule){
      const result = {
        "message" : "Schedule not found"
      }
      return res.status(404).json(result)
    }
    else {
      if (user1.id==cariSchedule.UserId1||user1.id==cariSchedule.UserId2){
        const cariUser1 = await db.User.findAll({
          where: {
           id: cariSchedule.UserId1 
          }
        })
  
        const cariUser2 = await db.User.findAll({
          where: {
            id: cariSchedule.UserId2
          }
        })

        const result = {
          "id_schedule" : idSchedule,
          "tanggal" : tanggalToString(cariSchedule.tanggal),
          "waktu" : cariSchedule.waktumulai + " - " + cariSchedule.waktuselesai,
          "User 1" : cariUser1[0].username,
          "User 2" : cariUser2[0].username
        }
        return res.status(200).json(result);
      }
      else {
        const result = {
          "message" : "Invalid User"
        }
        return res.status(400).json(result);
      }
    }
  },
  getAlternativeSchedule : async function(req, res){
    // console.log("masuk")
    const { username,date,start_time,end_time  } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    // tes()
    // console.log('masuk')
    // console.log(keDate(date))
    // console.log(tanggalToString(keDate(date)))
    // console.log(keDatetime(keDate(date),'00:00'));
    
    if (!username||!date||!start_time||!end_time){
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
      if(cariUser.length==0){
        const result = {
          "message" : "User not found"
        }
        res.status(404).json(result);
      }
      else if(cariUser[0].id==user1.id){
        const result = {
          "message" : "Invalid User"
        }
        res.status(400).json(result);
      }
      else {
        let meeting = await db.sequelize.query(
          `SELECT m.id AS 'mid', m.tanggal AS 'tanggal', m.waktumulai AS 'waktumulai', m.waktuselesai AS 'waktuselesai' 
          FROM meetings m 
          RIGHT OUTER JOIN 
          (
          SELECT ug.GroupId AS "gid"
          FROM usergroups ug
          WHERE ug.UserId = '${user1.id}' OR ug.UserId='${cariUser[0].id}'
          GROUP BY ug.GroupId
          )sq1
          ON m.GroupId = sq1.gid
          GROUP BY m.id
          `,
          {
              type: Sequelize.QueryTypes.SELECT
          }
        )
        let schedule = await db.sequelize.query(
          `SELECT s.tanggal AS 'tanggal', s.waktumulai AS 'waktumulai', s.waktuselesai AS 'waktuselesai' 
          FROM
          schedules s
          WHERE s.UserId1 = '${user1.id}' OR s.UserId2 = '${user1.id}' OR s.UserId1 = '${cariUser[0].id}' OR s.UserId2 = '${cariUser[0].id}'
          GROUP BY s.id`,
          {
              type: Sequelize.QueryTypes.SELECT
          }
        )
        let avail=false;

        let tempstime=keDatetime(keDate(date),start_time);
        let tempeetime=keDatetime(keDate(date),end_time);
        // console.log(keDate(date))
        // console.log(start_time)
        // console.log(keDatetime(keDate(date),'14:00'));
        while(!avail){
          console.log(tempstime)
          console.log(tempeetime)
          let meetingPassed = true;
          let schedulePassed = true;
          if(meeting.length>0){
            for (let i = 0; i < meeting.length; i++) {
              if(meeting[i].tanggal!=null && meeting[i].waktumulai!=null && meeting[i].waktuselesai!=null){
                let tempsmeeting=keDatetime(meeting[i].tanggal,meeting[i].waktumulai);
                let tempemeeting=keDatetime(meeting[i].tanggal,meeting[i].waktuselesai);
                console.log(tempsmeeting)
                console.log(tempemeeting)
                if(isTabrakan2(tempstime,tempeetime,tempsmeeting,tempemeeting)){
                  meetingPassed=false;
                  console.log(`tabrakan sama meeting ${tempsmeeting} dan ${tempemeeting}`)
                  break;
                }
              }
            }
          }

          if(meetingPassed==true){
            if(schedule.length>0){
              for (let i = 0; i < schedule.length; i++) {
                if(schedule[i].tanggal!=null && schedule[i].waktumulai!=null && schedule[i].waktuselesai!=null){
                  // console.log(schedule[i].tanggal)
                  let tempsschedule=keDatetime(schedule[i].tanggal,schedule[i].waktumulai);
                  let tempeeschedule=keDatetime(schedule[i].tanggal,schedule[i].waktuselesai);
                  if(isTabrakan2(tempstime,tempeetime,tempsschedule,tempeeschedule)){
                    schedulePassed=false;
                    console.log(`tabrakan ${tempstime} dan ${tempeetime}sama schedule ${tempsschedule} dan ${tempeeschedule}`)
                    break;
                  }
                }
              }
            }
          }
          if(meetingPassed==true && schedulePassed==true){
            avail=true;
            // break;
          }
          else{
            tempstime=moment(tempstime).add(15, 'm').toDate();
            tempeetime=moment(tempeetime).add(15, 'm').toDate();
          }
        }
        const result = {
          "message" : "Alternative meeting",
          "Suggestion" : {
            "waktumulai" : new Date(tempstime).toString(),
            "waktuselesai" : new Date(tempeetime).toString()
          }
        }
        res.status(200).json(result);
      }
    }
  },
};
