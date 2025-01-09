const prisma = require("../config/prisma");

exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        address: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: { enabled: enabled },
    });
    res.send("Update Status Success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: { role: role },
    });
    res.send("Update Role Success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;
    console.log(req.user.id);

    const user = await prisma.user.findFirst({
      where: { id: Number(req.user.id) },
    });

    await prisma.productOnCart.deleteMany({
      where: {
        cart: {
          orderedById: user.id,
        },
      },
    });

    await prisma.cart.deleteMany({
      where: {
        orderedById: user.id,
      },
    });

    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));
    console.log(products);

    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,
        },
        cartTotal: cartTotal,
        orderedById: user.id,
      },
    });
    console.log(newCart);
    res.send("Add Cart OK");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.emptyCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
    });

    if (!cart) {
      return res.status(400).json({ message: "No cart" });
    }

    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    const result = await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });
    console.log(cart);
    res.json({ message: "Cart Empty Success", deletedCount: result.count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.saveAddress = async (req, res) => {
  try {
    const { address } = req.body;
    console.log(address);
    const addressUser = await prisma.user.update({
      where: {
        id: Number(req.user.id),
      },
      data: {
        address: address,
      },
    });
    res.json({ ok: true, message: "Address update success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.saveOrder = async (req, res) => {
  try {
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedBy: {
          id: Number(req.user.id),
        },
      },
      include: {
        products: true,
      },
    });

    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ ok: false, message: "Cart is Empty" });
    }

    for (const item of userCart.products) {
      console.log(item);
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { quantity: true, title: true },
      });

      if (!product || item.count > product.quantity) {
        return res.status(400).json({
          ok: false,
          message: `ขออภัย : สินค้า ${product?.title || "product"} หมด `,
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: { id: req.user.id },
        },
        cartTotal: userCart.cartTotal,
      },
    });

    const update = userCart.products.map((item) => ({
      where: {
        id: item.productId,
      },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));

    await Promise.all(update.map((item) => prisma.product.update(item)));

    await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });
    console.log(update);

    res.json({ ok: true, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findMany({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (order.length === 0) {
      res.status(400).json({ ok: false, message: "No orders" });
    }
    res.json({ ok: true, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
