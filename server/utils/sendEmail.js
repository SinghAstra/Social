import nodemailer from "nodemailer";

export default async function sendEmail(email, subject, html) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}
