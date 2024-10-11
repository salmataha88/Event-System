# Event System


I have created a simple event management system using nodejs and MongoDB.


**Installation**
   
    • Clone the repository:
        ○ git clone https://github.com/salmataha88/Event-System.git
    • Navigate to the project directory:
        ○ cd event-management-system

    Install the dependencies
        ○ npm install
    • Set up the MongoDB connection:
        ○ Update the connection URI in the connection.js file.
    • Start the server:
        ○ nodemon dev
    • Access the application in http://localhost:3000.

**Features**

    • User Registration:
        ○ Allow users to sign up for the system. 
        ○ Users can log in 
        ○ Users can register for various events. 
        
    • Event Management:
        ○ Create and store details for events (like event name, date, time, location, description).
        ○ Events can be viewed by users (public or logged in).
        ○ User can get event by Id. 
        ○ User can get events by organizer. 
        ○ Admins or organizer can manage event data 
            § create
            § update
            § delete events
        ○ Admins can view a list of all registered users for an event.
        
    • User Registration Management:
        ○ Users can view the events they've registered for.
        ○ Users can cancel their registration for an event (not before 12h from the event).
        
    • Admin Management:
        ○ Super Admin can add admins.
        ○ Super admin can login.
        ○ Super admin can view all admins.
        ○ Super Admin can delete admin.

