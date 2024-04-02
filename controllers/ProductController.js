import { validationResult } from 'express-validator';
import Product from "../models/product.js";
import admin from 'firebase-admin';
admin.initializeApp({
    credential: admin.credential.cert('./firebase-admin-config.json'), // Provide the path to your service account key JSON file
  });
  const db = admin.firestore();
  async function sendNotification(message, token) {
    try {
        // Send the notification
        await admin.messaging().send({
            notification: {
                title: message.title,
                body: message.body,
            },
            token: token,
        });

        // Store notification data in Cloud Firestore
        await db.collection('notifications').add({
            title: message.title,
            body: message.body,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (err) {
        console.log(err);
        throw new Error('Failed to send notification');
    }
}

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
                console.log(err)
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


export async function deleteProduct(req, res) {
    try {
        // Find the product by ID and delete it from the database
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        // Check if the product exists
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Prepare notification message
        const message = {
            title: 'Product Deleted',
            body: `The product ${deletedProduct.productName} has been deleted`,
        };

        // Token for the device to send notification
        const token = 'eJ4RjaRtSIK7UI-EjuTtq7:APA91bFuKfbMooXj6N-2hvxjI0RoPIdcAN65wo01trY9tnkSJ61i2BvIYvbVwEYGHrzErXAu3QV0IKhn_lvKR8bM8Iz9LdIG7HmGOvDp19gK5me-B2MnQGDgMrOjOoF_wA0BTnreGOKQ';
        console.log(token);
        await sendNotification(message, token);

        // Respond with 200 OK and a success message
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.log(err);
        // Respond with 500 Internal Server Error and the error details
        res.status(500).json({ error: err.message });
    }
}

// Create a new product
const addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    const { sellerId } = req.params;
    try {
        const products = await Product.find({ sellerId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json(product);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product by ID
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json(product);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product by ID


export { addProduct, getAllProducts, getProductById, updateProduct };
