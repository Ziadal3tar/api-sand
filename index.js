import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
const __direname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__direname, './config/.env') })
import express from 'express';
const app = express()
import axios from 'axios';
import cors from "cors"
var corsOption = {
  origin: "*",
  optionsSuccessStatus: 200
}
app.use(cors("*"))
const port = process.env.PORT || 3000

const clientId = process.env.APPLICATIONID;
const clientSecret = process.env.CLIENTSECRET;
let oAuthToken;

async function sendEmail(message2, subject) {
  let msgPayload = {
    message: {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: message2
      },
      // toRecipients: [{ emailAddress: { address: 'info@sandstonetires.com' } }]
      from: {
        emailAddress: {
          address: 'info@sandstonetires.com',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'info@sandstonetires.com',
          },
        },
      ],
    }
  };
  await axios({ // Get OAuth token to connect as OAuth client
    method: 'post',
    url: 'https://login.microsoftonline.com/aa762ec4-ccb8-4644-88ab-b4a09a20404a/oauth2/token',
    data: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      resource: "https://graph.microsoft.com",
      grant_type: "client_credentials"
    }).toString()
  })
    .then((r) => {
      oAuthToken = r.data.access_token
    })
  return await axios({ // Send Email using Microsoft Graph
    method: 'post',
    url: `https://graph.microsoft.com/v1.0/users/info@sandstonetires.com/sendMail`,
    headers: {
      'Authorization': "Bearer " + oAuthToken,
      'Content-Type': 'application/json'
    },
    data: msgPayload
  })
    .catch(error => {
      console.error(error);
    });
}
app.use(express.json());
app.post('/sendMail', async (req, res) => {
  let { name, email, notes, phone, quantity } = req.body;
  let message2 = 'customers emails'
  let subject = `<h4>From: ${email}</h4><br><h4> Name:${name}</h4><br><h4>Phone: ${phone}</h4><br><h4>Message: ${notes}</h4><br><h4>quantity: ${quantity}</h4><br>`
  let emailRes = await sendEmail(subject, message2);
  if (emailRes.statusText == 'Accepted') {
    res.status(201).json({ message: "sended" })
  } else {
    res.status(404).json({ message: "invalid email" })
  }
})
app.get('/redirect', async (req, res) => {
  console.log('done');
  res.status(201).json({ message: "DONE" })
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))