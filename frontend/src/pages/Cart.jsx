import Navbar from "../components/Navbar";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
//import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import api from "../services/axios"

const Cart = () => {
  const { cartItems, updateQty, totalPrice, totalItems, setCartItems, removeItem } = useCart();
  const navigate = useNavigate();
 // const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); 
  }, []);

 

  return (
    <>
      <Navbar />

      <div className="min-h-screen pb-32 md:pb-10" style={{ backgroundColor: "var(--bg-main)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-8" style={{ color: "var(--text-main)" }}>
            Shopping Cart
          </h1>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 w-full bg-gray-300 rounded-xl animate-skeleton"></div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ backgroundColor: "var(--card-bg)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
            >
              <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
                Your cart is empty 🛒
              </p>

              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 rounded-xl font-medium transition"
                style={{ backgroundColor: "var(--primary)", color: "#fff" }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-hover)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-10">
              {/* LEFT – ITEMS */}
              <div className="md:col-span-2 space-y-6">
                {cartItems.map((item) => {
                  const price = item.product?.price || item.price;
                  const title = item.product?.title || item.title;
                  const image = item.product?.images?.[0] || item.image;
                  const subtotal = price * item.qty;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl p-5 flex gap-5"
                      style={{ backgroundColor: "var(--card-bg)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    >
                      <img src={image} alt={title} className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl" />

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="font-medium text-base md:text-lg" style={{ color: "var(--text-main)" }}>{title}</h2>
                          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>₹{price} each</p>
                          {item.selectedVariant && (
                            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                              {Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(", ")}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-5">
                          {/* QTY */}
                          <div className="flex items-center rounded-lg overflow-hidden border border-gray-400">
                            <button
                              onClick={() => updateQty(item.id, Math.max(0, item.qty - 1), item.productId)}
                              className="px-3 py-1 text-lg transition active:scale-[0.95]"
                            >
                              −
                            </button>

                            <span className="px-4 font-medium" style={{ color: "var(--text-main)" }}>{item.qty}</span>

                            <button
                              onClick={() => updateQty(item.id, item.qty + 1, item.productId)}
                              className="px-3 py-1 text-lg transition active:scale-[0.95]"
                            >
                              +
                            </button>
                          </div>

                          {/* SUBTOTAL */}
                          <div className="text-right">
                            <p className="font-semibold" style={{ color: "var(--text-main)" }}>₹{subtotal}</p>
                            <button
  onClick={() => removeItem(item.id || item.productId)}
  className="text-xs mt-1"
  style={{ color: "var(--primary)" }}
>
  Remove
</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT – SUMMARY */}
              <div className="rounded-2xl p-6 h-fit md:sticky md:top-24" style={{ backgroundColor: "var(--card-bg)", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--text-main)" }}>Order Summary</h2>

                <div className="flex justify-between text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  <span>Items ({totalItems})</span>
                  <span>₹{totalPrice}</span>
                </div>

                <div className="flex justify-between text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  <span>Shipping</span>
                  <span style={{ color: "var(--primary)" }}>Free</span>
                </div>

                <div className="pt-4 flex justify-between font-semibold text-lg" style={{ borderTop: "1px solid var(--text-secondary)", color: "var(--text-main)" }}>
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="hidden md:block w-full mt-6 py-3 rounded-xl font-medium transition"
                  style={{ backgroundColor: "var(--primary)", color: "#fff" }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE CHECKOUT */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-4 md:hidden" style={{ backgroundColor: "var(--card-bg)", borderTop: "1px solid var(--text-secondary)" }}>
          <div className="flex justify-between text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            <span>{totalItems} items</span>
            <span style={{ color: "var(--text-main)" }}>₹{totalPrice}</span>
          </div>
          <button onClick={() => navigate("/checkout")} className="w-full py-3 rounded-xl font-medium" style={{ backgroundColor: "var(--primary)", color: "#fff" }}>
            Checkout
          </button>
        </div>
      )}
    </>
  );
};

export default Cart;
