import bcrybt from 'bcrypt';
import Admin from '../../../DB/models/admin.js';
import jwt from 'jsonwebtoken';

export const superAdmin = async (req, res, next) => {
    const superAdminExists = await Admin.findOne({ username: 'superAdmin' });
    const password = bcrybt.hashSync(process.env.SuperAdminPassword , +process.env.SALT_ROUNDS);

    if (!superAdminExists) {
        const superAdmin = new Admin({
            username: 'superAdmin',
            password: password,
            email: 'superadmin@example.com',
        });

        await superAdmin.save();
        return res.status(201).json({ message: 'Super Admin account created' });
    } else {
        return res.status(200).json({ message: 'Super Admin account already exists' });
    }
}

export const SignIn = async (req, res, next) => {
    const { email,username, password } = req.body;

    if(!username && !email)
        return res.status(400).json({ message: 'Please enter email or username' })
    
    if (!password) {
        return res.status(400).json({ message: 'Please fill all fields' })
    }
    
    const isUserExists = await Admin.findOne({ $or: [{ email }, { username }] })

    if (!isUserExists){
        return res.status(400).json({ message: 'Please Register first' })
    }

    const isPasswordValid = bcrybt.compareSync(password, isUserExists.password)

    if (!isPasswordValid){
        return res.status(400).json({ message: 'Invalid Password' })
    }

    const adminToken = jwt.sign(
        { 
          email: isUserExists.email,
          id: isUserExists._id,
          role: isUserExists.role
        },
        process.env.SIGN_IN_TOKEN_SECRET,
        { expiresIn: '2h' },
    )
    
    return res.status(200).json({ message: 'LoggedIn success', adminToken })
}

export const addAdmin = async (req, res, next) => {
    const {username, password, email} = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email' })
    }
    if(req.authUser.username !== 'superAdmin') {
        return res.status(400).json({ message: 'You are not authorized to add an admin' });
    }
    const adminExists = await Admin.findOne({ username });
    if (adminExists) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = bcrybt.hashSync(password, +process.env.SALT_ROUNDS);
    const admin = new Admin({
        username,
        password: hashedPassword,
        email,
    });
    await admin.save();
    return res.status(200).json({ message: 'Admin account created' });
}

export const getAllAdmins = async (req, res, next) => {
    const { authUser } = req;
    if ( authUser.username !== 'superAdmin') {
        return res.status(400).json({ message: 'You are not authorized to view all admins' });
    }
    // Get all admins except the super admin
    const admins = await Admin.find({ username: { $ne: 'superAdmin' } });
    return res.status(200).json({ admins });
}

export const deleteAdmin = async (req, res, next) => {
    const { authUser } = req;
    const { adminId } = req.query;
    if (!adminId) {
        return res.status(400).json({ message: 'Please enter admin id' });
    }
    if (authUser.username  !== 'superAdmin') {
        return res.status(400).json({ message: 'You are not authorized to delete this admin' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
    }
    await admin.deleteOne();
    return res.status(200).json({ message: 'Admin deleted successfully' });
}