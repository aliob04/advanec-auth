"use server"
import * as z from 'zod'
import { signIn } from '@/auth'
import { LoginSchema } from '@/schemas/index' 
import { generateVerificationToken } from '@/lib/tokens'

import { DEFAULT_LOGIN_REDIRECT } from '@/route'
import { AuthError } from 'next-auth'
import { getUserbyEmail } from '@/data/user'
import { sendVerificationEmail } from '@/lib/mail'
export const login = async (values : z.infer<typeof LoginSchema>) => {

    const validatedFields = LoginSchema.safeParse(values)

    if(!validatedFields.success)  return {error:"Invalid fields!"}

    const {email,password} = validatedFields.data
    
    const existingUser = await getUserbyEmail(email)
    
    if(!existingUser || !existingUser.email || !existingUser.password) return {error:"Email doesn't exist!"}
    
    if(!existingUser.emailVerified){
        
        const verificationToken = await generateVerificationToken(existingUser.email)
        await sendVerificationEmail(verificationToken.email,verificationToken.token)
        return {success: "Confimation is done"}
    }
    try{
        await signIn("credentials",{email,password,redirectTo:DEFAULT_LOGIN_REDIRECT})
    }catch(error){
        if(error instanceof AuthError){
            switch(error.type){
                case "CredentialsSignin":
                    return {error:"Invalid Credentials"}
                default:
                    return {error:"Something went wrong!"}
            }

        }
        throw error
    }

    return {success: "successful login"}
}


