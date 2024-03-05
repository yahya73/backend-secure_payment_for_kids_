import { validationResult } from 'express-validator';
import Product from "../models/product.js";

// Controller function to create a new product
// Controller function to create a new product
export function addOnce(req, res) {
    // Check if there are validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Respond with 400 Bad Request and the validation errors
        return res.status(400).json({ errors: errors.array() });
    } else {
        // If there are no validation errors, create a new product
        Product.create({
            // Extracting product details from the request body
            SellerId: req.body.SellerId,
            ProductName: req.body.ProductName,
            image:req.body.image,
            Description: req.body.Description,
            Price: req.body.Price,
            Type: req.body.Type
        })
            .then((newProduct) => {
                // Respond with 201 Created and the created product details
                res.status(201).json({
                    SellerId: newProduct.SellerId,
                    ProductName: newProduct.ProductName,

                    Description: newProduct.Description,
                    Price: newProduct.Price,
                    Type: newProduct.Type
                });
            })
            .catch((err) => {
                // Respond with 500 Internal Server Error and the error details
                res.status(500).json({ error: err });
            });
    }
}

// Controller function to get all products
export function getAll(req, res) {
    // Retrieve all products from the database
    Product.find()
        .then((products) => {
            // Respond with the array of products
            res.status(202).json(products);
        })
        .catch((err) => {
            // Respond with 500 Internal Server Error and the error details
            res.status(500).json({ error: err });
        });
}

// Controller function to get a product by ID
export function getOneById(req, res) {
    // Find the product by ID in the database
    Product.findById(req.params.id)
        .then((foundProduct) => {
            // Check if the product exists
            if (!foundProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            // Respond with the product details
            res.status(202).json(foundProduct);
        })
        .catch((err) => {
            // Respond with 500 Internal Server Error and the error details
            res.status(500).json({ error: err });
        });
}
// Controller function to delete a product by ID
export function deleteProduct(req, res) {
    // Find the product by ID and delete it from the database
    Product.findByIdAndDelete(req.params.id)
        .then((deletedProduct) => {
            // Check if the product exists
            if (!deletedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            // Respond with 200 OK and a success message
            res.status(200).json({ message: 'Product deleted successfully' });
        })
        .catch((err) => {
            // Respond with 500 Internal Server Error and the error details
            res.status(500).json({ error: err });
        });
}
