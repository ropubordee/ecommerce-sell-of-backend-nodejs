const prisma = require("../config/prisma");
const stripe = require("stripe")(
  "sk_test_51QjBNaBr75o1Azj8LOY7IAMcibwvnUq6MsdHGRHVxVLDbaEKrUxGqGyeRoZzOmwsJg9QoYHv4QlqfvacEULBwrBA00nD0jERZS"
);

exports.payment = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: req.user.id,
      },
    });

    const amountTHB = cart.cartTotal * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.listPayment = async (req, res) => {
  try {
    const payments = await stripe.paymentIntents.list({
      limit: 10, 
    });

    // console.log("Payments:", payments.data);
    res.send ({datalistpayment : payments})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
