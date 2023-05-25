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
  }
};
