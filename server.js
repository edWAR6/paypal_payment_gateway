const express = require('express');
const path = require('path');
const paypal = require('paypal-rest-sdk');

const app = express();

paypal.configure({
  mode: 'sandbox',
  client_id: 'Afe2T4tWFNVVNebUF8lnmBwTY_p1lavndc0vfy7D6zogvjHn0pdzJk24dKaon0x3r3nSsNy4TCrRY2hK',
  client_secret: 'ELpX6Aeu1nR8BBJEnfYArvHlYhVWASEYff07hkIcGxMlYjzRjZutrzi4OggRcNeTnNUEWeZIRSNNpUIo'
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.get('/buy', (req, res) => {
  const payment = {
    intent: "authorize",
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: 'http://127.0.0.1:3000/success',
      cancel_url: 'http://127.0.0.1:3000/error',
    },
    transactions: [{
      amount: {
        total: 39.00,
        currency: 'USD'
      },
      description: 'Pepperoni Pizza'
    }]
  };

  createPay(payment).then((transaction) => {
    const id = transaction.id;
    const links = transaction.links;
    let counter = links.length;
    while (counter --) {
      if (links[counter].method == 'REDIRECT') {
        return res.redirect(links[counter].href)
      }
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

var createPay = (payment) => {
  return new Promise((resolve, reject) => {
    paypal.payment.create(payment, function(error, payment) {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });
};

app.get('/success', (req, res) => {
  console.log(req.query);
  res.redirect('/success.html');
});

app.get('/error', (req, res) => {
  console.log(req.query);
  res.redirect('/error.html');
});

app.listen( 3000, ()=> {
  console.log('Server runnign on http://localhost:3000');
});
