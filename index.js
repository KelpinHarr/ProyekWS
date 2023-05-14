// npm i multer express mysql2 sequelize jsonwebtoken bcryptjs dotenv axios 

require("dotenv").config();
const express = require("express");
const router = require("./src/routes/index");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/assets", express.static("assets"));
app.use("/api", router);

const port = process.env.PORT;  
app.listen(port, function () {
  console.log(`listening on port ${port}...`);
});

//npx sequelize-cli model:generate --name User --attributes display_name:string,email:string,username:string,password:string,birthdate:date,saldo:integer,api_hit:integer,profile_picture:string

// npx sequelize-cli seed:generate --name User

//npx sequelize-cli model:generate --name Group --attributes name:string,description:string

//npx sequelize-cli model:generate --name UserGroup --attributes GroupId:integer,UserId:integer

//npx sequelize-cli db:seed:all