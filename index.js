const express = require("express");
const cron = require("node-cron");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const mysql = require("mysql2/promise");

// Configure your Twilio and email credentials
const twilioAccountSid = "AC1e664b5aa9c2ed6fc9d00ab81064a62a";
const twilioAuthToken = "f6b301aa69cb9e1780c70642d85bd814";
const twilioPhoneNumber = "+13158094614";
// const twilioAccountSid = "AC1e664b5aa9c2ed6fc9d00ab81064a62a";
// const twilioAuthToken = "f6b301aa69cb9e1780c70642d85bd814";
// const twilioPhoneNumber = "+13158094614";
// gmail password nodemailer = twwuohpoxyhsiyas

const emailSender = "ayush.budtech@gmail.com";
const emailRecipient = "infoayushyadav96@gmail.com";
const emailUsername = "ayush.budtech@gmail.com";
const emailPassword = "twwuohpoxyhsiyas";
// const emailSender = "YOUR_EMAIL_SENDER";
// const emailRecipient = "YOUR_EMAIL_RECIPIENT";
// const emailUsername = "YOUR_EMAIL_USERNAME";
// const emailPassword = "YOUR_EMAIL_PASSWORD";

const app = express();

// Function to fetch data from the database and compare the date
async function fetchDataAndCompareDate() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "datalinx_prod",
  });

  try {
    const [user] = await connection.query("SELECT * FROM se_user");
    const [eq_batchData] = await connection.query(
      "SELECT * FROM eq_batch WHERE DATE(end_dt) = CURDATE();"
    );
    const [rows] = await connection.query("SELECT * FROM eq_batch");
    const [equipment] = await connection.query("SELECT * FROM equipment");
    const currentDate = new Date();

    equpData = {
      eqpName: equipment[0].equipment,
    };
    const userData = {
      email: user[3].Email,
      phoneNumber: user[3].mobile_no,
    };

    console.log(userData);
    const data = {
      sampleDate: rows[0].sample_dt,
      endDate: rows[0].end_dt,
      startDate: rows[0].start_dt,
      rackNumber: rows[0].location_id,
      bachNumber: rows[0].batch_no,
      // equipment: rows[0].batch_no,
      sampleNumber: rows[0].sample_no,
      sampleName: rows[0].sample_name,
    };
    console.log(data);
    const databaseDate = new Date(rows[0].end_dt);

    if (currentDate.toDateString() === databaseDate.toDateString()) {
      sendSMS(
        userData.phoneNumber,
        data.sampleDate,
        data.endDate,
        data.startDate,
        data.rackNumber,
        data.bachNumber,
        equpData.eqpName,
        data.sampleNumber,
        data.sampleName
      );
      sendEmail(
        userData.email,
        data.sampleDate,
        data.endDate,
        data.startDate,
        data.rackNumber,
        data.bachNumber,
        data.equipment,
        data.sampleNumber,
        data.sampleName
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    await connection.end();
  }
}

// Function to send SMS using Twilio
function sendSMS(
  phoneNumber,
  sampleDate,
  endDate,
  startDate,
  rackNumber,
  bachNumber,
  equipment,
  sampleNumber,
  sampleName
) {
  const client = twilio(twilioAccountSid, twilioAuthToken);

  client.messages
    .create({
      body: `This is a test email from budtech. Your Sample Date is ${sampleDate}
      and Your End Date of Sample is ${endDate} your start date is ${startDate} is place in rack number ${rackNumber} and its Batch Number is ${bachNumber} 
      your equipment Name is ${equipment} and your Sample Name is ${sampleName} and Sample Number is ${sampleNumber} `,
      from: twilioPhoneNumber,
      to: `${phoneNumber}`,
    })
    .then((message) => console.log("SMS sent:", message.sid))
    .catch((error) => console.error("Error sending SMS:", error));
}

// Function to send email using Nodemailer
function sendEmail(
  userEmail,
  sampleDate,
  endDate,
  startDate,
  rackNumber,
  bachNumber,
  equipment,
  sampleNumber,
  sampleName
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailUsername,
      pass: emailPassword,
    },
  });

  const mailOptions = {
    from: emailSender,
    to: userEmail,
    subject: "Test Email from Budventure ",
    text: `This is a test email from budtech. Your Sample Date is ${sampleDate}
     and Your End Date of Sample is ${endDate} your start date is ${startDate} is place in rack number ${rackNumber} and its Batch Number is ${bachNumber} 
     your equipment Name is ${equipment} and your Sample Name is ${sampleName} and Sample Number is ${sampleNumber} `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

fetchDataAndCompareDate();
// Schedule the cron job to execute the tasks
cron.schedule("*/1 * * * *", () => {
  //   sendSMS();
  //   sendEmail();
  // Run the tasks at 9:00 AM every day
  fetchDataAndCompareDate();
});
// cron.schedule("0 9 * * *", () => {
//   sendSMS();
//   sendEmail();
//   // Run the tasks at 9:00 AM every day
//   //   fetchDataAndCompareDate();
// });

// Define your API routes
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
