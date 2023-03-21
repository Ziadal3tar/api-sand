
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
const __direname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__direname, './config/.env') })

import express from 'express';
const app = express()
import cors  from "cors"
var corsOption = {
    origin: "*",
    optionsSuccessStatus: 200
}
app.use(cors("*"))
const port = process.env.PORT || 3000
import nodemailer from 'nodemailer';
import { google } from 'googleapis';





const OAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL)
OAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

async function sendEmail(email, subject, message) {
  try {
    const accessToken = await OAuth2Client.getAccessToken()
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'ziadalattar22@gmail.com',

        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken
      },
    });
    let info = await transport.sendMail({
      from: email,
      to: 'ziadalattar22@gmail.com',
      subject,
      html: message,
    });

    return info

  } catch (error) {
    return error
  }
}
app.use(express.json());


app.post('/sendEmail', async (req, res) => { //("image",7) the num to tell allow how many images
console.log(req.body);

  let {name, email, notes ,phone,quantity} = req.body;
  let message = `<h4>From: ${email}</h4><br><h4> Name:${name}</h4><br><h4>Phone: ${phone}</h4><br><h4>Message: ${notes}</h4><br></h4><br><h4>quantity: ${quantity}</h4><br>`

  let subject =  "Costumers Emails"
  let emailRes = await sendEmail(email,subject,message);

  if (emailRes.accepted.length) {
      res.status(201).json({ message: "sended" })
  } else {
      res.status(404).json({ message: "invalid email" })
  }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
