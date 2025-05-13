require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const { sendOrderConfirmation } = require("./orderController");
const { validationResult } = require("express-validator");

// Create stripe checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, billingDetails } = req.body;

    // Find order
    const order = await Order.findById(orderId).populate("items.book");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Create line items for Stripe
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.book.title,
          description: `Author: ${item.book.author}`,
          images: [item.book.imageURL],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/order-success?order_id=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/order/${orderId}`,
      metadata: {
        orderId: orderId,
      },
      customer_email: billingDetails?.email || req.user.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Add more countries as needed
      },
      billing_address_collection: 'required',
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Handle stripe webhook
exports.handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Update order payment status
    const orderId = session.metadata.orderId;

    try {
      const order = await Order.findById(orderId);

      if (order) {
        order.paymentStatus = "paid";
        order.paymentId = session.payment_intent;
        await order.save();

        // Send order confirmation email
        await sendOrderConfirmation(orderId);
      }
    } catch (error) {
      console.error("Order update error:", error);
    }
  }

  res.status(200).end();
};
