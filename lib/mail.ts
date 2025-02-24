import {Resend} from 'resend'


const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (email:string,token:string) => {
    //to detect the validity of the token
    const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`
    await resend.emails.send({
        from:"onboarding@resend.dev",
        to:email,
        subject: "Confirm your email",
        html: `<p>Click <a href="${confirmLink}">to confirm email.</a></p>`
    })
}