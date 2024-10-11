import jwt from 'jsonwebtoken'
import userModel from '../../DB/models/user.js'
import Admin from '../../DB/models/admin.js'

export const isAuth = () => {
    return async (req, res, next) => {

        const { authorization } = req.headers

        if (!authorization) {
        return res.status(400).json({ message: 'Please login first' })
        }

        if (!authorization.startsWith('Event')) {
        return res.status(400).json({ message: 'invalid token prefix' })
        }

        const splitedToken = authorization.split(' ')[1]

        const decodedData = jwt.verify(
        splitedToken,
        process.env.SIGN_IN_TOKEN_SECRET,
        )

        if (!decodedData || !decodedData.id) {
        return res.status(400).json({ message: 'invalid token' })
        }

        const findUser = await userModel.findById(decodedData.id, 'email username role')

        const admin = await Admin.findById(decodedData.id, 'email username role')

        if (!findUser && !admin) {
        return res.status(400).json({ message: 'Please SignUp' })
        }

        if(findUser){
            req.authUser = findUser
        }
        else if(admin){
            req.authUser = admin
        }
        console.log(req.authUser)
        
        next();
    }
}