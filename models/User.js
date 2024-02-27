import mongoose from "mongoose";

// Destructuring the Schema and model objects from the mongoose module
const { Schema, model } = mongoose;

// Creating a new Mongoose schema for the 'Test' model
const UserSchema = new Schema({
    // Defining a field 'name' of type String, which is required
    
    Username :{
        type: String,
        required: true  
    },
    Email:{
        type: String,
        required: true
    },
    Password:{
        type: String,
        required: true
    },
    Role:{
        type: String,
        required: true,
        enum:['admin','parent','partner','child'],
        
    },
    // Defining a field 'image' of type String, which is required
    image: {
        type: String,
        required: true
    },
    Parentid:{
        type: String,
        
    },
    PhoneNumber:{
        type: Number,
        required: true
    },
    Adressblockchain:{
        type: String,
       
    },
ProhibitedProductTypes:{
    type: [String],

       
},
    Verified: {
        type: Boolean,
        required: true
    },
    Banned: {
        type: Boolean, // Define Banned as a single boolean value
        default: false // Default value is false (user is not banned by default)
    }

});

// Creating and exporting the 'Test' model using the defined schema
export default model('User', UserSchema);
