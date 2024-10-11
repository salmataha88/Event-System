import moment from 'moment-timezone';
import eventModel from '../../../DB/models/event.js';
import userModel from '../../../DB/models/user.js';

/-------------------------------------------------For everyOne------------------------------------------------*/
export const getEvents = async (req, res, next) => {
        const events = await eventModel.find().populate([{
            path: 'organizer',
            select: 'username -_id'
        }])
        .select('-__v -_id')
        return res.status(200).json({ events })
};
export const getEventsByOrganizer = async (req, res, next) => {
        const {id} = req.query;
        const events = await eventModel.find({ organizer: id }).populate([{
            path: 'organizer',
            select: 'username -_id'
        }])
        .select('-__v -_id')
        return res.status(200).json({ events })
};
export const getEventByName = async (req, res, next) => {
        const { name } = req.query;
        const event = await eventModel.find({name}).populate([{
            path: 'organizer',
            select: 'username -_id'
        }])
        .select('-__v -_id')
        return res.status(200).json({ event })
};

/-------------------------------------------------For Admins--------------------------------------------------*/
export const createEvent = async (req, res, next) => {
        const { name, description, eventDate, time, price, seats, location} = req.body;

        if (!name || !description || !eventDate || !time || !price || !seats || !location) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if(req.authUser.role !== 'admin' && req.authUser.role !== 'organizer') {
            return res.status(400).json({ message: 'You are not authorized to create an event' });
        }

        // Combine eventDate and time to create a date-time string
        const eventDateTimeString = `${eventDate} ${time}`;
        
        // Convert combined date-time string to Cairo timezone
        const eventDateTime = moment.tz(eventDateTimeString, 'YYYY-MM-DD HH:mm', 'Africa/Cairo');
        console.log("Event DateTime:", eventDateTime.format()); // Displays the full event date and time

        const newEvent = new eventModel({
            name,
            description,
            eventDate: eventDateTime.toDate(),
            time,
            price,
            seats,
            location,
            organizer : req.authUser.id
        });

        const savedEvent = await newEvent.save();

        res.status(201).json({ message: 'Event created successfully', event: savedEvent });
};

export const updateEvent = async (req, res, next) => {
    const {authUser} = req
    const { eventId } = req.query;
    const updates = req.body;
    if (!eventId) {
        return res.status(400).json({ message: 'Please enter event id' });
    }
    const event = await eventModel.findById(eventId);
    if (!event) {
        return res.status(400).json({ message: 'Event not found' });
    }
    if (event.organizer.toString() !== authUser.id && authUser.role !== 'admin') {
        return res.status(404).json({ message: 'You are not authorized to update this event' });
    }

    const allowedUpdates = ['name', 'description', 'eventDate', 'time', 'price', 'seats', 'location'];
    const isValidUpdate = Object.keys(updates).every(update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
        return res.status(400).json({ message: 'Invalid update fields' });
    }

    // Update event fields with new values from request body
    Object.keys(updates).forEach(key => {
        if (event[key] !== undefined) {
            event[key] = updates[key];
        }
    });

    await event.save();

    await event.save();

    return res.status(200).json({ message: 'Event updated successfully', event });
}

export const deleteEvent = async (req, res, next) => {
    const { eventId } = req.query;
    if (!eventId) {
        return res.status(400).json({ message: 'Please enter event id' });
    }
    if (req.authUser.role !== 'admin' && req.authUser.role !== 'organizer') {
        return res.status(404).json({ message: 'You are not authorized to delete this event' });
    }
    const event = await eventModel.findById(eventId);
    if (!event) {
        return res.status(400).json({ message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.authUser.id && req.authUser.role !== 'admin') {
        return res.status(404).json({ message: 'You are not authorized to delete this event' });
    }

    const countRegisteredUsers = await userModel.countDocuments({ registerdEvents: eventId });
    
    const deleteEvents = await userModel.updateMany(
        { registerdEvents: eventId }, 
        { $pull: { registerdEvents: eventId } 
    });
    
    deleteEvents.modifiedCount > 0 ? console.log('Deleted successfully') : console.log('No documents were updated');
    
    console.log(deleteEvents);
    console.log(countRegisteredUsers);
    
    if (countRegisteredUsers !== deleteEvents.modifiedCount) {
        return res.status(400).json({ message: 'You cannot delete this event, there is an issue' });
    }

    await event.deleteOne();

    return res.status(200).json({ message: 'Event deleted successfully' });
}

export const viewRegisteredUsers = async (req, res, next) => {
    if (req.authUser.role !== 'admin') {
        return res.status(404).json({ message: 'You are not authorized to view Registered Users' });
    }
    const { eventId } = req.query;
    if (!eventId) {
        return res.status(400).json({ message: 'Please enter event id' });
    }
    const event = await eventModel.findById(eventId);
    if (!event) {
        return res.status(400).json({ message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.authUser.id && req.authUser.role !== 'admin') {
        return res.status(404).json({ message: 'You are not authorized to view this event' });
    }
    const registeredUsers = await userModel.find({ registerdEvents: eventId }).select('-__v -password -registerdEvents -role');

    return res.status(200).json({ registeredUsers });
}

/--------------------------------------------------For Users---------------------------------------------------*/
export const RegisterEvent = async (req, res, next) => {
    const { authUser } = req
    const { eventId } = req.query

    if (!eventId) {
        return res.status(400).json({ message: 'Please enter event id' })
    }

    const user = await userModel.findById(authUser.id)
    const event = await eventModel.findById(eventId)

    if (!event) {
        return res.status(400).json({ message: 'Event not found' })
    }
    if (user.registerdEvents.includes(eventId)) {
        return res.status(400).json({ message: 'You already registered this event' })
    }
    if (event.seats <= 0) {
        return res.status(400).json({ message: 'Event is full' })
    }

    user.registerdEvents.push(eventId)
    await user.save()

    event.seats--
    await event.save()

    return res.status(200).json({ message: 'Event Registered Successfully' , event})
}

export const getUserEvents = async (req, res, next) => {
    const { authUser } = req
    const user = await userModel.findById(authUser.id);
    const userEvents = await eventModel.find({ _id: { $in: user.registerdEvents } })
    .populate([{
        path: 'organizer',
        select: 'username -_id'
    }])
    .select('-__v -_id')
    
    return res.status(200).json({userEvents})
}

export const cancelEvent = async (req, res, next) => {
    const { authUser } = req
    const { eventId } = req.query
    if (!eventId) {
        return res.status(400).json({ message: 'Please enter event id' })
    }
    const user = await userModel.findById(authUser.id)
    const event = await eventModel.findById(eventId)
    if (!event) {
        return res.status(400).json({ message: 'Event not found' })
    }
    if (!user.registerdEvents.includes(eventId)) {
        return res.status(400).json({ message: 'You are not registered in this event' })
    }

    // Calculate the time difference in hours between the current time and the event date
    const currentTime = moment.tz('Africa/Cairo');
    const eventDateTime = moment.tz(event.eventDate, 'Africa/Cairo');
    const timeDifference = eventDateTime.diff(currentTime, 'hours');

    console.log('Current Time:', currentTime.format());
    console.log('Event Date:', eventDateTime.format());
    console.log(timeDifference);

    if (timeDifference <= 12 && timeDifference > 0) {
        return res.status(403).json({ message: 'You cannot cancel within 12 hours of the event.' });
    }

    user.registerdEvents.pull(eventId)
    await user.save()

    event.seats++
    await event.save()

    return res.status(200).json({ message: 'Event Canceled Successfully' })

}
