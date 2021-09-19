import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());


const stripe = new Stripe(process.env.PRIVATE_STRIPE_KEY);

const taxRates = await stripe.taxRates.create({
   display_name: 'HST',
   inclusive: false,
   percentage: 13.00,
   country: 'CA', 
   state: 'ON',
   jurisdiction: 'CA',
   description: 'Harmonized Sales Tax,'
});

// Checkout POST request 

app.post('/create-checkout-session', async(req, res) => {

   const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      shipping_rates:[process.env.SHIPPING_KEY],
      shipping_address_collection: {
         allowed_countries: ['CA']
      },
      line_items: req.body.map(item => {
         return {
            price_data: {
               currency: 'cad',
               product_data: {
                  name: item.title, 
               },
               unit_amount: item.price * 100
            },
            quantity: item.qty,
            tax_rates: [process.env.ON_TAX_RATE],
         }
      }),
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
   })

   res.json({ url: session.url});

})

app.post('/create-checkout-session-free-shipping', async(req, res) => {

   const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      shipping_rates: [process.env.FREE_SHIPPING_KEY],
      shipping_address_collection: {
         allowed_countries: ['CA']
      },
      line_items: req.body.map(item => {
         return {
            price_data: {
               currency: 'cad',
               product_data: {
                  name: item.title, 
               },
               unit_amount: item.price * 100
            },
            quantity: item.qty,
            tax_rates: [process.env.ON_TAX_RATE],
         }
      }),
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
   })

   res.json({ url: session.url});

})

app.listen('4000', () => console.log('Running on port 4000'));


