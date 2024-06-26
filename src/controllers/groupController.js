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
  inviteGroup: async function (req, res) {
    const { groupCode, user_id } = req.body;
  
    if (!groupCode || !user_id) {
      return res.status(400).send({
        message: "Group code and invited user ID cannot be empty",
      });
    }
  
    const inviterId = req.user.id;
  
    try {
      const group = await db.Group.findOne({
        where: {
          groupCode: groupCode,
        },
      });
  
      if (!group) {
        return res.status(404).send({
          message: "Group not found",
        });
      }
  
      const inviter = await db.User.findByPk(inviterId);
      const invitedUser = await db.User.findByPk(user_id);
  
      if (!inviter || !invitedUser) {
        return res.status(404).send({
          message: "User not found",
        });
      }
  
      const inviterGroupMember = await db.UserGroup.findOne({
        where: {
          GroupId: group.id,
          UserId: inviterId,
          status: "joined",
        },
      });
  
      if (!inviterGroupMember) {
        return res.status(400).send({
          message: "You are not a member of this group",
        });
      }
  
      const invitedGroupMember = await db.UserGroup.findOne({
        where: {
          GroupId: group.id,
          UserId: user_id,
          status: "joined",
        },
      });

      if (invitedGroupMember.status=="joined") {
        return res.status(400).send({
          message: "User is already a member of this group",
        });
      }
  
      await db.UserGroup.create({
        GroupId: group.id,
        UserId: user_id,
        status: "joined",
      });
  
      return res.status(200).send({
        inviter: inviter.display_name,
        invitedUser: invitedUser.display_name,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal server error",
      });
    }
  },
  removeFromGroup: async function (req, res) {
    const { user_id, groupCode } = req.body;
  
    if (!user_id) {
      return res.status(400).send({
        message: "User ID cannot be empty",
      });
    }
  
    const removerId = req.user.id;
  
    try {
      const remover = await db.User.findByPk(removerId);
      const removedUser = await db.User.findByPk(user_id);
  
      if (!remover || !removedUser) {
        return res.status(404).send({
          message: "User not found",
        });
      }
  
      if (removerId === user_id) {
        return res.status(400).send({
          message: "You cannot remove yourself from the group",
        });
      }
  
      const removerGroupMember = await db.UserGroup.findOne({
        where: {
          UserId: removerId,
          status: "joined",
        },
      });
  
      if (!removerGroupMember) {
        return res.status(400).send({
          message: "You are not a member of any group",
        });
      }
  
      let removedGroupMember;
      let group;
  
      if (groupCode) {
        group = await db.Group.findOne({
          where: {
            groupCode: groupCode,
          },
        });
  
        if (!group) {
          return res.status(404).send({
            message: "Group not found",
          });
        }
  
        removedGroupMember = await db.UserGroup.findOne({
          where: {
            UserId: user_id,
            GroupId: group.id,
            status: "joined",
          },
        });
  
        if (!removedGroupMember) {
          return res.status(400).send({
            message: "User is not a member of the specified group",
          });
        }
      } else {
        removedGroupMember = await db.UserGroup.findOne({
          where: {
            UserId: user_id,
            status: "joined",
          },
        });
  
        if (!removedGroupMember) {
          return res.status(400).send({
            message: "User is not a member of any group",
          });
        }
  
        group = await db.Group.findByPk(removedGroupMember.GroupId);
  
        if (!group) {
          return res.status(404).send({
            message: "Group not found",
          });
        }
      }
  
      await db.UserGroup.destroy({
        where: {
          UserId: user_id,
          GroupId: group.id,
        },
      });
  
      return res.status(200).send({
        remover: remover.display_name,
        removedUser: removedUser.display_name,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal server error",
      });
    }
  },  
};
