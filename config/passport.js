//configure the Local Strategy
// http://www.passportjs.org/docs/username-password/

//Export all this functionality, like ctrl+v this code into the app.js file
// In app.js we will have require('./config/passport')(passport);
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');  // bring in our User table
const config = require('../config/database'); // to connect to MongoDB
const bcrypt = require('bcryptjs');

module.exports = function(passport){
  // Local Strategy
  // make a new LocalStrategy which takes in a username, password from our form and uses a callpack called 'done'
  // THE FORM MUST HAVE INPUT FIELDs CALLED  'username'   and 'password'
  passport.use(new LocalStrategy(function(username, password, done){
    // Match the Email
    let query = {email: username};
    User.findOne(query, function(err, user){
      if(err) throw err;
      if(!user){  //if the user in the table is not found
        //done is the passport-local strategy callback function with null for no error, false for no user Object, flash message
        return done(null, false, {message: 'The email is not registered'} );
      }

      // If there is a user, Match Password, Need bcrypt to compare the hash from the DB's queried user.password
      // with the form's non-hashed password
      // It uses the callback function with error and true/false value isMatch
      bcrypt.compare(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        }else{
          return done(null, false, {message: 'Wrong password'});
        }
      }); // end matching password
    }); //end User query, finding the one user with the email
  })); //end passport.use function

  // Serialize and deserialize user, just part of the configuration
  // http://www.passportjs.org/docs/downloads/html/
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

} //end module.exports function
