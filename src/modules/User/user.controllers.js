import userModel from '../../../DB/models/user.js'
import eventModel from '../../../DB/models/event.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import moment from 'moment-timezone'

export const SignUp = async (req, res, next) => {
    const { Fullname, username, email, mobile, password, role } = req.body;
    if (!Fullname || !username || !email || !mobile || !password || !role) {
        return res.status(400).json({ message: 'Please fill all fields' })
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email' })
    }
    if (!/^\d{11}$/.test(mobile)) {
        return res.status(400).json({ message: 'Please enter a valid mobile number' })
    }

    var isUserExists = await userModel.findOne({ email })
    if (isUserExists) {
        return res.status(400).json({ message: 'Email is already exists' })
    }
    isUserExists = await userModel.findOne({ username })
    if (isUserExists) {
        return res.status(400).json({ message: 'Choose another username please ^_^' })
    }
    isUserExists = await userModel.findOne({ mobile })
    if (isUserExists) {
        return res.status(400).json({ message: 'Mobile is already exists' })
    }
    if (role == 'admin') {
        return res.status(400).json({ message: 'You are not authorized to create an admin account' })
    }

    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)
    const user = new userModel({ 
        Fullname, 
        username, 
        email, 
        mobile, 
        password: hashedPassword, 
        role 
    })
    await user.save()
    res.status(201).json({ message: 'User Registered Successfully', user })
}

export const SignIn = async (req, res, next) => {
    const { email,username, password } = req.body;

    if(!username && !email)
        return res.status(400).json({ message: 'Please enter email or username' })
    
    if (!password) {
        return res.status(400).json({ message: 'Please fill all fields' })
    }
    
    const isUserExists = await userModel.findOne({ $or: [{ email }, { username }] })

    if (!isUserExists){
        return res.status(400).json({ message: 'Please Register first' })
    }

    const isPasswordValid = bcrypt.compareSync(password, isUserExists.password)

    if (!isPasswordValid){
        return res.status(400).json({ message: 'Invalid Password' })
    }

    const userToken = jwt.sign(
        { 
          email: isUserExists.email,
          id: isUserExists._id,
          role: isUserExists.role
        },
        process.env.SIGN_IN_TOKEN_SECRET,
        { expiresIn: '2h' },
    )
    
    return res.status(200).json({ message: 'LoggedIn success', userToken })
}

export const updateUser = async (req, res, next) => {
    const { authUser } = req;
    const {userId} = req.query;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Please enter update fields' });
    }
    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (userId !== authUser.id) {
        return res.status(403).json({ message: 'You are not authorized to update this user' });
    }

    if(updates.email){
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(updates.email)) {
            return res.status(400).json({ message: 'Please enter a valid email' })
        }
        var isUserExists = await userModel.findOne({ email: updates.email })
        if (isUserExists) {
            return res.status(400).json({ message: 'Email is already exists' })
        }
    }
    if(updates.username){
        var isUserExists = await userModel.findOne({ username : updates.username })
        if (isUserExists) {
            return res.status(400).json({ message: 'Choose another username please ^_^' })
        }
    }

    if(updates.mobile){
        if (!/^\d{11}$/.test(updates.mobile)) {
            return res.status(400).json({ message: 'Please enter a valid mobile number' })
        }
        var isUserExists = await userModel.findOne({ mobile })
        if (isUserExists) {
            return res.status(400).json({ message: 'Mobile is already exists' })
        }
    }

    if (updates.password) {
        if (updates.password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        updates.password = bcrypt.hashSync(updates.password, +process.env.SALT_ROUNDS);
    }
    
    const allowedUpdates = ['Fullname', 'email', 'mobile', 'password' , 'username'];

    const isValidUpdate = Object.keys(updates).every(update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
        return res.status(400).json({ message: 'Invalid update fields' });
    }

    const newuser = await userModel.findByIdAndUpdate(userId, updates, { new: true });

    return res.status(200).json({ message: 'User updated successfully', newuser });

};

export const getUserById = async (req, res, next) => {
    const { authUser } = req
    const user = await userModel.findById(authUser.id).populate([{
        path: 'registerdEvents',
        select: 'name -_id',
        populate: {
            path: 'organizer',
            select: 'username -_id'
        }
    }])
    .select('-password -__v -_id')


    return res.status(200).json({user})
}
