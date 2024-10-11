import { Schema, model } from 'mongoose'; 

var adminModel = new Schema({
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
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String, 
        default:'admin' 
    },
});

//Export the model
export default adminModel = model('Admin', adminModel);