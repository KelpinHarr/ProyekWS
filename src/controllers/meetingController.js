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
const { Op,DataTypes } = Sequelize;
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
  addMeeting : async function(req, res){
    const { group_id, date, start_time,end_time } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    console.log(keDate(date))
           
    if (!group_id || !date || !start_time|| !end_time){
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
      let meeting = await db.sequelize.query(
        `SELECT m.id AS 'mid', m.tanggal AS 'tanggal', m.waktumulai AS 'waktumulai', m.waktuselesai AS 'waktuselesai' 
        FROM meetings m 
        RIGHT OUTER JOIN 
        (SELECT ug.id,ug.GroupId AS 'gid'
        FROM
        usergroups ug 
        RIGHT OUTER JOIN
        (
        SELECT u.id AS "uid"
        FROM users u RIGHT OUTER JOIN usergroups ug ON ug.UserId = u.id
        WHERE ug.GroupId = '${group_id}'
        )sq1
        ON sq1.uid = ug.UserId
        GROUP BY ug.GroupId) sq2
        ON m.GroupId = sq2.gid
        GROUP BY m.id`,
        {
            type: Sequelize.QueryTypes.SELECT
        }
      )
      let schedule = await db.sequelize.query(
        `SELECT s.tanggal AS 'tanggal', s.waktumulai AS 'waktumulai', s.waktuselesai AS 'waktuselesai' 
        FROM
        schedules s,
        (
        SELECT u.id AS "uid"
        FROM users u RIGHT OUTER JOIN usergroups ug ON ug.UserId = u.id
        WHERE ug.GroupId = '${group_id}'
        )sq1
        WHERE sq1.uid = s.UserId1
        GROUP BY s.id
        UNION
        SELECT s.tanggal AS 'tanggal', s.waktumulai AS 'waktumulai', s.waktuselesai AS 'waktuselesai' 
        FROM
        schedules s,
        (
        SELECT u.id AS "uid"
        FROM users u RIGHT OUTER JOIN usergroups ug ON ug.UserId = u.id
        WHERE ug.GroupId = '${group_id}'
        )sq3
        WHERE sq3.uid = s.UserId2
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
        if(meetingPassed==false || schedulePassed==false){
          const result = {
            "message" : "There is a schedule or meeting at the same time"
          }
          res.status(400).json(result);
        }
        else{
          const createMeeting = await db.Meeting.create({
            GroupId: group_id,
            tanggal: keDate(date),
            waktumulai: start_time,
            waktuselesai: end_time,
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
    const { meeting_id} = req.body;
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
  getAlternativeMeeting : async function(req, res){
    // console.log("masuk")
    const { group_id,date,start_time,end_time  } = req.body;
    userLogin = req.user.id;
    user1 = await db.User.findByPk(userLogin);
    user1 = user1.dataValues;
    // tes()
    // console.log('masuk')
    // console.log(keDate(date))
    // console.log(tanggalToString(keDate(date)))
    // console.log(keDatetime(keDate(date),'00:00'));
    
    if (!group_id||!date||!start_time||!end_time){
      const result = {
        "message" : "Field can't be empty!"
      }
      res.status(400).json(result);
    }
    else {
      const cariGroup = await db.Group.findAll({
        where: {
          id: group_id
        }
      })
      
      if (cariGroup.length == 0) {
        const result = {
          "message" : "Group not found!"
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
          let meeting = await db.sequelize.query(
            `SELECT m.id AS 'mid', m.tanggal AS 'tanggal', m.waktumulai AS 'waktumulai', m.waktuselesai AS 'waktuselesai' 
            FROM meetings m 
            RIGHT OUTER JOIN 
            (SELECT ug.id,ug.GroupId AS 'gid'
            FROM
            usergroups ug 
            RIGHT OUTER JOIN
            (
            SELECT u.id AS "uid"
            FROM users u RIGHT OUTER JOIN usergroups ug ON ug.UserId = u.id
            WHERE ug.GroupId = '${group_id}'
            )sq1
            ON sq1.uid = ug.UserId
            GROUP BY ug.GroupId) sq2
            ON m.GroupId = sq2.gid
            GROUP BY m.id`,
            {
                type: Sequelize.QueryTypes.SELECT
            }
          )
          let schedule = await db.sequelize.query(
            `SELECT s.tanggal AS 'tanggal', s.waktumulai AS 'waktumulai', s.waktuselesai AS 'waktuselesai' 
            FROM
            schedules s,
            (
            SELECT u.id AS "uid"
            FROM users u RIGHT OUTER JOIN usergroups ug ON ug.UserId = u.id
            WHERE ug.GroupId = '${group_id}'
            )sq1
            WHERE sq1.uid = s.UserId1
            GROUP BY s.id
            UNION
            SELECT s.tanggal AS 'tanggal', s.waktumulai AS 'waktumulai', s.waktuselesai AS 'waktuselesai' 
            FROM
            schedules s,
            (
            SELECT u.id AS "uid"
            FROM users u RIGHT OUTER JOIN usergroups ug ON ug.UserId = u.id
            WHERE ug.GroupId = '${group_id}'
            )sq3
            WHERE sq3.uid = s.UserId2
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
            console.log(meeting.length)
            console.log(schedule.length)
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
    }
  },
addMeetingNote: async function(req, res) {
  const { groupid, meetingid, notes } = req.body;

  try {
    const group = await db.Group.findOne({ where: { id: groupid } });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const meeting = await db.Meeting.findOne({ where: { id: meetingid, groupid } });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const note = await db.GroupMeeting.create({
      GroupId: groupid,
      MeetingId: meetingid,
      notes,
    });

    res.status(200).json({
      note_id: note.id,
      notes: note.notes
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to add meeting note" });
  }
},
getMeetingNote: async function(req, res) {
  const { note_id } = req.query;

  try {
    let meetingNotes;
    if (note_id) {
      meetingNotes = await db.GroupMeeting.findOne({ where: { id: note_id } });
    } else {
      meetingNotes = await db.GroupMeeting.findAll();
    }

    if (!meetingNotes) {
      return res.status(404).json({ message: "Meeting note not found" });
    }

    res.status(200).json(meetingNotes);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to retrieve meeting note" });
  }
},

};