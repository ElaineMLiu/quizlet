// Here, module.exports allows access outside to this object,
// and in app.js we put that object with these database, secret values into 'config' variablename

// in app.js, we have
// const config=require('./config/database');   //includes this file's contents 
// mongoose.connect(config.database);


module.exports = {
  database: 'mongodb://localhost:27017/nodeqb', //also include the mongodb default port 27017
  secret: 'yoursecret'
}
