import express from 'express';
import nodemailer from 'nodemailer';
import { shopifyApi } from '@shopify/shopify-api';
import dotenv from 'dotenv';
const PORT = process.env.PORT || 3000;

dotenv.config();

const app = express();
app.use(express.json());

async function getAllProducts(){
    const response = await fetch(`https://${process.env.SHOPIFY_SHOPNAME}.myshopify.com/admin/api/2025-01/product.json`,{
        method: "GET",
        headers: {
            "X-shopify-Access-Token": process.env.SHOPIFY_APIKEY,
            "Content-Type":"application/json"
        }
    })

    console.log(response.data)
}
await getAllProducts()
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
