import nodemailer from 'nodemailer'

export async function sendEmailService ({
    to,
    subject,
    message,
    attachments = []
} = {}){
    //configurations

    const transporter = nodemailer.createTransport({
        host : 'localhost',
        port: 587,
        secure : false,
        service : 'gmail',
        auth : {
            user : process.env.EMAIL,
            pass : process.env.PASSWORD
        },
    })

    const emailInfo = await transporter.sendMail({
        from : '"Event System 😄" <process.env.EMAIL>',
        to: to ? to : '',
        subject : subject ? subject : 'Hello',
        html : message ? message : '',
        attachments,
    })
    console.log(emailInfo)
}
