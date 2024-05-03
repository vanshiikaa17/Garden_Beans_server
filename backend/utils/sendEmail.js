const nodeMailer=require("nodemailer");

const sendEmail=async(mailCreds)=>{
    const transporter=nodeMailer.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        service:process.env.SMTP_SERVICE,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD
        }
    });

    const sendMailCreds={
        form:process.env.SMTP_MAIL,
        to:mailCreds.email,
        subject:mailCreds.subject,
        text:mailCreds.message
    }

   await transporter.sendMail(sendMailCreds);
}

module.exports=sendEmail;