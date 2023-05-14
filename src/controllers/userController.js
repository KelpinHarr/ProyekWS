const db = require("../models/index");
const joi = require("joi").extend(require('@joi/date'));
const multer = require("multer");
const fs = require("fs");
const upload = multer({
  dest : "./uploads",
});

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

module.exports = {
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
        username : joi.string().alphanum().required().external(checkUsername).messages({
          'string.empty' : 'Invalid data field username',
          'any.required' : 'Invalid data field username',
          'any.alphanum' : 'Invalid data field username',
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
        password :  joi.string().alphanum().required().messages({
          'string.empty' : 'Invalid data field password',
          'any.required' : 'Invalid data field password',
          'any.alphanum' : 'Invalid data field password'
        }),
        confirm_password :  joi.string().alphanum().required().messages({
          'string.empty' : 'Invalid data field confirm password',
          'any.required' : 'Invalid data field confirm password',
          'any.alphanum' : 'Invalid data field confirm password'
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

  },
};
