const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.book"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check if all items are in stock
    for (const item of cart.items) {
      const book = item.book;
      if (book.stock < item.quantity) {
        return res.status(400).json({
          message: `${book.title} does not have enough stock. Available: ${book.stock}`,
        });
      }
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: cart.totalAmount,
      shippingAddress,
    });

    // Update stock for each book
    for (const item of cart.items) {
      const book = await Book.findById(item.book._id);
      book.stock -= item.quantity;
      await book.save();
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    // Populate order with book details
    const populatedOrder = await Order.findById(order._id).populate(
      "items.book",
      "title author"
    );

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.book", "title author imageURL")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.book", "title author imageURL price")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send order confirmation email
exports.sendOrderConfirmation = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate("items.book", "title author price")
      .populate("user", "name email");

    if (!order) {
      console.error("Order not found for email confirmation");
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // HTML email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { width: 100%; max-width: 600px; margin: 0 auto; }
          .header { background-color: #4b70e2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order!</h2>
            <p>Hello ${order.user.name},</p>
            <p>Your order has been received and is being processed. Here's a summary of your order:</p>
            
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Order Status:</strong> ${order.orderStatus}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            
            <h3>Items Ordered</h3>
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.book.title}</td>
                    <td>${item.book.author}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
                  <td>$${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <h3>Shipping Address</h3>
            <p>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
      order.shippingAddress.zipCode
    }<br>
              ${order.shippingAddress.country}
            </p>
            
            <p>If you have any questions about your order, please contact our customer service.</p>
            <p>Thank you for shopping with us!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Bookstore. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email,
      subject: `Order Confirmation #${order._id}`,
      html: emailHtml,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Order confirmation email sent for order ${orderId}`);
  } catch (error) {
    console.error("Send order confirmation email error:", error);
  }
};
