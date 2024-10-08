const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
   constructor(userName, userEmail, url) {
      this.to = userEmail;
      this.firstName = userName.split(' ')[0];
      this.url = url;
      this.from = `Maxim Degtiarev <${process.env.EMAIL_FROM}>`;
   }

   newTransport() {
      if (process.env.NODE_ENV === 'production') {
         // sendgrid
         return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
               user: process.env.SENDGRID_USERNAME,
               pass: process.env.SENDGRID_PASSWORD,
            },
         });
      }
      return nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
         },
         // activate in gmail. 'less secure app' option
      });
   }

   // Send the actual email
   async send(template, subject) {
      // Render HTML based on a pug template
      const html = pug.renderFile(
         `${__dirname}/../views/email/${template}.pug`,
         {
            firstName: this.firstName,
            url: this.url,
            subject,
         },
      );

      // Define the email options
      const mailOptions = {
         from: this.from,
         to: this.to,
         subject,
         html,
         text: convert(html),
      };

      // Create a transport and send email
      this.newTransport();
      await this.newTransport().sendMail(mailOptions);
   }

   async sendWelcome() {
      await this.send('welcome', 'Welcome to the Natourex Family');
   }

   async sendPasswordReset() {
      await this.send(
         'passwordReset',
         'Your password reser token (VALID FOR ONLY 10 MIN)',
      );
   }
};
