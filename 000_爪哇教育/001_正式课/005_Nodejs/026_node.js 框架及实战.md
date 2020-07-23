# node.js 框架及实战


### nodejs框架
  express

  egg

  koa

  think


### express


```js

const path = require("path");

const fs = require("fs");

const express = require("express");

const app = express()


app.get("/test",function(req,res){
    const filePath = path.resolve(__dirname,'./index.html');

    const content = fs.readFileSync(filePath,'utf-8')

    const text = `hello ${new Date().getTime()}`;

})

app.listen(8080,function(){
    console.log("serer run at http://127.0.0.1:8080")
})

```






### ORM




### sequelize



```js

const cookieParser = require("cookie-parser");

const {User} = require("./sequelize");

app.use(bodyParser.json());

app.use(cookieP)




```