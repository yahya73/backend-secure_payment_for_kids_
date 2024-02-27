import mongoose from "mongoose";

// Destructuring the Schema and model objects from the mongoose module
const { Schema, model } = mongoose;

// Enum for product types
const ProductTypes = ['Toys', 'Books', 'Games', 'School Supplies', 'Clothes', 'Snacks', 'Stationery', 'Art Supplies', 'Sports Equipment', 'Electronics', 'DiabeticSnacks'];

// Creating a new Mongoose schema for the 'Product' model
const ProductSchema = new Schema({
    // Defining a field 'SellerId' of type String, which is required
    SellerId: {
        type: String,
        required: true
    },
    // Defining a field 'ProductName' of type String, which is required
    ProductName: {
        type: String,
        required: true
    },
    // Defining a field 'Description' of type String, which is required
    Description: {
        type: String,
        required: true
    },
    // Defining a field 'Price' of type Number, which is required
    Price: {
        type: Number,
        required: true
    },
    // Defining a field 'Type' of type String with enum values, which is required
    Type: {
        type: String,
        enum: ProductTypes,
        required: true
    }
});

// Creating and exporting the 'Product' model using the defined schema
export default model('Product', ProductSchema);
