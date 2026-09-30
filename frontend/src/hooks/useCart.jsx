import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Cart parse error", err);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product) => {
    if (!product?.id) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          qty: 1,
          id: null, 
        },
      ];
    });

    if (token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id, qty: 1 }),
        });
        const data = await res.json();

        setCartItems((prev) =>
          prev.map((item) =>
            item.productId === product.id ? { ...item, id: data.cartItem.id } : item
          )
        );
      } catch (err) {
        console.error("Add to cart backend failed", err);
      }
    }
  };

  const updateQty = async (cartItemId, qty, productId) => {
  if (qty < 1) {
    removeFromCart(cartItemId || productId);
    return;
  }

  // Update frontend/localStorage for both guest and logged-in users
  setCartItems((prev) =>
    prev.map((item) =>
      item.id === cartItemId || item.productId === productId
        ? { ...item, qty }
        : item
    )
  );

  // Only logged-in users have backend cart
  if (token && cartItemId) {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/cart/update/${cartItemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ qty }),
        }
      );
    } catch (err) {
      console.error("Update qty backend failed", err);
    }
  }
};

  const removeItem = (cartItemId) => {
  setCartItems((prev) =>
    prev.filter(
      (item) => item.id !== cartItemId && item.productId !== cartItemId
    )
  );
};

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeItem,
        setCartItems,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
