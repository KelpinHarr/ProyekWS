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

const checkUsername = async (username) => { 
  cariUser =  await db.User.findAndCountAll({
    where: {
      username: username
    }
  })
  if (cariUser.count > 0){
    throw new Error("Username has already been taken")
  }
}

const cekUserAda = async (username) => {
  cariUser = await db.User.findAndCountAll({
    where: {
      username: username
    }
  })
  if (cariUser.count == 0){
    throw new Error("Username not found")
  }
}

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
  getAll: async function (req, res) {
    const users = await db.User.findAll();
    return res.status(200).send(users);
  },
  registerUser: async function (req, res) {
    const uploadFile = upload.single("profile_picture")
    uploadFile(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).send({ msg: "File too large" });
      } else if (err) {
        return res.status(400).send({ msg: "File not supported" });
      } 
      const {username, email, display_name, date_of_birth, password, confirm_password} = req.body;

      const schema = joi.object({
        username : joi.string().required().external(checkUsername).messages({
          'string.empty' : 'Invalid data field username',
          'any.required' : 'Invalid data field username',
          'any.external' : 'Username has already been taken'
        }),
        email : joi.string().email().required().messages({
          'string.empty' : 'Invalid data field email',
          'any.required' : 'Invalid data field email',
          'string.email' : 'Invalid email address'
        }),
        display_name : joi.string().required().messages({
          'string.empty' : 'Invalid data field name',
          'any.required' : 'Invalid data field name'
        }),
        date_of_birth : joi.date().format('YYYY-MM-DD').required().messages({
          'string.empty' : 'Invalid data field date',
          'any.required' : 'Invalid data field date',
          'date.format' : 'Invalid date format',
        }),
        password :  joi.string().required().messages({
          'string.empty' : 'Invalid data field password',
          'any.required' : 'Invalid data field password',
        }),
        confirm_password :  joi.string().required().messages({
          'string.empty' : 'Invalid data field confirm password',
          'any.required' : 'Invalid data field confirm password',
        }),
      })

      try {
        await schema.validateAsync(req.body)
      } catch (error) {
        return res.status(400).send({
            "message" : error.message
        })
      }
     
      if(password != confirm_password){
        return res.status(404).send({"msg" : "Password and Confirm Password doesn't match"})
      }

      fs.renameSync(
        `./uploads/${req.file.filename}`,
        `./assets/${username}.png`
      );

      const ins = db.User.create({
        display_name : display_name,
        email : email,
        username : username,
        password : password,
        birthdate : date_of_birth,
        saldo : 0,
        api_hit : 0,
        profile_picture : `/assets/${username}.png`
      })

      return res.status(201).send({
        msg : "Registration successful",
        username : username,
        email : email,
        display_name : display_name,
        saldo : 0,
        profile_picture : `/assets/${username}.png`
      })
    })
  },
  login: async function (req, res) {
    const {username, password} = req.body;
    const schema = joi.object({
      username : joi.string().required().external(cekUserAda).messages({
        'string.empty' : 'Invalid data field username',
        'any.required' : 'Invalid data field username',
        'any.external' : 'Username not found'
      }),
      password :  joi.string().required().messages({
        'string.empty' : 'Invalid data field password',
        'any.required' : 'Invalid data field password',
      }),
    })

    try {
      await schema.validateAsync(req.body)
    } catch (error) {
      return res.status(400).send({
          "message" : error.message
      })
    }

    const userLogin = await db.User.findOne({
      where : {
        username : username,
      }
    })

    if(userLogin.password != password){
      return res.status(404).send({"msg" : "Password is incorrect"})
    }

    const token = jwt.sign({
      id: userLogin.id,
      username: userLogin.username,
    }, PRIVATE_KEY, {
      expiresIn: 86400 // 24 hours
    });

    return res.status(200).json({
        message: "Login success",
        username: userLogin.username,
        token: token
    })

  },
  topupSaldo : async function (req, res) {
    user = req.user
    const {saldo} = req.body;
    if(!saldo){
      return res.status(400).send({
        message : "Invalid data field topup"
      })
    }
    if(saldo < 10000){
      return res.status(400).send({
        message : "Minimum topup is 10000"
      })
    }
    userLogin = await db.User.findByPk(user.id)
    if(!userLogin){
      return res.status(400).send({
        message : "User not found"
      })
    }
    saldoAwal = parseInt(userLogin.saldo)
    saldoAkhir = saldoAwal + parseInt(saldo)
    await userLogin.update({
      saldo : saldoAkhir
    })
    return res.status(200).send({
      message : "Topup successful",
      username : userLogin.username,
      saldo_awal : saldoAwal,
      saldo_akhir : saldoAkhir
    })
  },  
  subscribe: async function (req, res) {
    const user = req.user;

    const cariUser = await db.User.findByPk(user.id);
    if (!cariUser) {
        return res.status(404).json({
            message: "User not found"
        })
    }
    if(cariUser.saldo < 50000) {
      return res.status(400).json({
          message: "Insufficient amount of balance"
      })
    }
    saldo = cariUser.saldo - 50000;
    apiHit = cariUser.api_hit + 10;

    updateSaldo = await db.User.update({
        saldo: saldo,
        api_hit : apiHit
    }, {
        where: {
            id: user.id
        }
    })

    return res.status(200).json({
      new_balance : saldo,
      api_hit: apiHit,
      message: "Subscription successfully done",
    })
  },
  updateProfilePic : async function (req, res) {
    const user = req.user
    const uploadFile = upload.single("profile_picture")
    uploadFile(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).send({ msg: "File too large" });
      } else if (err) {
        return res.status(400).send({ msg: "File not supported" });
      } 
      const userLogin = await db.User.findByPk(user.id)
      if(!userLogin){
        return res.status(400).send({
          message : "User not found"
        })
      }
      fs.renameSync(
        `./uploads/${req.file.filename}`,
        `./assets/${userLogin.username}.png`
      );
      await userLogin.update({
        profile_picture : `/assets/${userLogin.username}.png`
      }, {
        where : {
          id : user.id
        }
      })

      return res.status(200).send({
        message : "Update profile picture successful",
        username : userLogin.username,
        profile_picture : `/assets/${userLogin.username}.png`
      })
    })
  }
};
