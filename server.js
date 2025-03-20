import express from "express";
import nodemailer from "nodemailer";
import { shopifyApi } from "@shopify/shopify-api";
import dotenv from "dotenv";
const PORT = process.env.PORT || 3000;

dotenv.config();

const app = express();
app.use(express.json());

const sender = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

async function getAllProducts() {
  const response = await fetch(
    `https://${process.env.SHOPIFY_SHOPNAME}.myshopify.com/admin/api/2025-01/products.json`,
    {
      method: "GET",
      headers: {
        "X-shopify-Access-Token": process.env.SHOPIFY_APIKEY,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();
  const products = data.products;
  let lowInventory = [];
  for (const product of products) {
    let productVariants = product.variants;

    for (const variant of productVariants) {
      if (variant.inventory_quantity < 5) {
        lowInventory.push({
          ...variant,
          prd_name: product.title,
          prd_id: product.id,
        });
      }
    }
  }

  sendMail(lowInventory);
}

async function sendMail(lowInventory) {
  let mail = `
        <h2>Liste des produit en bas stock</h2>
        <table border="1">
        <tr><th>Produit</th><th>Variante</th><th>Quantité</th></tr>
    `;

  lowInventory.forEach((item) => {
    mail += `<tr>
          <td>${item.prd_name}</td>
          <td>${item.title}</td>
          <td>${item.inventory_quantity}</td>
        </tr>`;
  });

  mail += "</table>";

  const sendMail = {
    from: process.env.SENDER_MAIL,
    to: process.env.SHOPIFY_ADMINMAIL,
    subject: "Notification stock en baisse !!!",
    html: mail,
  };

  await sender.sendMail(sendMail);
}

app.post("/notify-low-stock", async (req, res) => {
  await getAllProducts();
  res.status(200).json({
    message: "Mail sent"
  })
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
