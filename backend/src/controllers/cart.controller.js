// cart.controller.js
import * as CartService from "../services/cart.services.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();


export const mergeCart = async (req, res) => {
  const cart = await CartService.mergeGuestCart(
    req.user.id,
    req.body.items
  );
  res.json(cart);
};

export const myCart = async (req, res) => {
    //console.log("USER FROM AUTH ", req.user);
  const cart = await CartService.getOrCreateCart(req.user.id);
  res.json(cart);
};

export const clearCart = async (req, res) => {
  try {
    //  Find user's cart
    const userCart = await prisma.cart.findUnique({
      where: { userId: req.user.id }, // unique relation
      include: { items: true },
    });

    if (!userCart || userCart.items.length === 0) {
      return res.status(200).json({ message: "Cart is already empty" });
    }

    //  Delete all items in that cart
    await prisma.cartItem.deleteMany({
      where: { cartId: userCart.id },
    });

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    //console.error("Clear cart error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
export const removeCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  const userId = req.user.id;
  //console.log("AUTH USER:", req.user.id);

  try {
    await CartService.removeItem(userId, cartItemId);
    return res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    if (err.message === "Item not found or unauthorized") {
      return res.status(403).json({ message: err.message });
    }

    //console.error(err);
    return res.status(500).json({ message: "Failed to remove item" });
  }
};


export const addToCart = async (req, res) => {

  const userId = req.user?.id;
  const { productId, qty = 1 } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({
      message: "Missing userId or productId",
    });
  }

  try {
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    //console.log("CART:", cart);

     const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const item = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        qty: { increment: qty },
      },
      create: {
        cartId: cart.id,
        productId,
        qty,
        price: product.price,
      },
    });

    //console.log("CART ITEM:", item);

     res.json({ success: true, cartItem: item });
  } catch (err) {
    //console.error("ADD CART ERROR:", err);
    res.status(500).json({ message: "Add to cart failed" });
  }
};

export const updateCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  const { qty } = req.body;
  const userId = req.user.id;

  if (!qty || qty < 1) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  try {
    const updatedItem = await CartService.updateItemQty(userId, cartItemId, qty);
    
    res.json({ success: true, cartItem: updatedItem });
  } catch (err) {
    //console.error("Update cart item error:", err);
    if (err.message === "Item not found or unauthorized") {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to update cart item" });
  }
};
