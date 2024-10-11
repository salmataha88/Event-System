import { Schema, model } from 'mongoose';

var eventModel = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true,
    },
    eventDate:{
        type:Date,
        required:true,
    },
    time:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    seats:{
        type:Number,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    organizer:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    }
},{
    timestamps:true,
});

//Export the model
export default eventModel= model('Event', eventModel);