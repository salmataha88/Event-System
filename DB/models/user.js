import { Schema, model } from 'mongoose'; 

var userModel = new Schema({
    Fullname:{
        type:String,
        required:true,
        index:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum: ['user','organizer'], //organizer can add update delete events and user can only view events and register
        default:'user' 
    },
    registerdEvents:[{
        type:Schema.Types.ObjectId,
        ref:'Event'
    }],
});

//Export the model
export default userModel = model('User', userModel);