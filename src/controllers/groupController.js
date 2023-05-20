const db = require("../models/index");
const joi = require("joi").extend(require('@joi/date'));
const multer = require("multer");
const fs = require("fs");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const jwt = require("jsonwebtoken");
const upload = multer({
  dest : "./uploads",
});

//==========================================



//==========================================

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
    const group = await db.Group.create({
      name,
      description,
    });

    await db.UserGroup.create({
      GroupId : group.id,
      UserId : UserId
    })

    return res.status(200).send({
      id : group.id,
      name : group.name,
      description : group.description,
      members : 1
    });
  },
  joinGroup : async function (req, res) {
    const { id } = req.params;
    const UserId = req.user.id;
    if(!id){
      return res.status(400).send({
        message : "id group cannot be empty"
      })
    }

    cariGroup = await db.Group.findOne({
      where : {
        id : id
      }
    })

    if(!cariGroup){
      return res.status(404).send({
        message : "group not found"
      })
    }

    cariGroupMember = await db.UserGroup.findOne({
      where : {
        GroupId : id,
        UserId : UserId
      }
    })

    if(cariGroupMember){
      return res.status(400).send({
        message : "user already joined this group"
      })
    }

    await db.UserGroup.create({
      GroupId : id,
      UserId : UserId
    })

    return res.status(200).send({
      message : "success join group",
      group_name : cariGroup.name
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
      description : cariGroup.description,
      members : cariJumlahMember.count
    })
  },

//add schedule
  addSchedule : async function(req, res){
    const { username, date, time } = req.body;
    
    if (!username || !date || !time){
      const result = {
        "message" : "Field can'\t be empty!"
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
        const result = {
          "message" : "Schedule Added"
        }
        res.status(201).json(result);
      }
    }
  }
};
