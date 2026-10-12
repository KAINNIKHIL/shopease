import { stripePromise } from "../utils/stripe";

/**
 * Handles initiation of Stripe Checkout session and navigation.
 * 
 * @param {Array} cartItems - Current items in cart
 * @param {string} token - User auth JWT
 * @param {Function} setLoading - State updater for loading state
 * @param {Function} setError - State updater for error message
 */
const handleCheckout = async (cartItems, token, setLoading, setError) => {
  let isRedirecting = false;

  try {
    setLoading(true);
    setError("");

    if (!token) {
      throw new Error("Please log in before checkout.");
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const payload = {
      items: cartItems.map((item) => ({
        productId: item.productId || item.id,
        name: item.title || item.name || "Product",
        price: Number(item.price) || 0,
        quantity: Number(item.qty || item.quantity) || 1,
      })),
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/payment/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to create checkout session."
      );
    }

    // 1. Preferred modern Stripe workflow: direct session URL redirect
    if (data.url) {
      isRedirecting = true;
      window.location.assign(data.url);
      return;
    }

    // 2. Fallback to client-side SDK redirectToCheckout if backend only returns session ID
    const sessionId = data.id || data.sessionId;
    if (!sessionId) {
      throw new Error("Checkout session URL or ID was not returned by the server.");
    }

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error("Stripe failed to initialize. Please check your connection.");
    }

    isRedirecting = true;
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      isRedirecting = false;
      throw new Error(error.message);
    }
  } catch (err) {
    console.error("Checkout error:", err);
    setError(err.message || "Payment initiation failed. Please try again.");
  } finally {
    // Only reset loading if we didn't initiate an active window navigation
    if (!isRedirecting) {
      setLoading(false);
    }
  }
};

export default handleCheckout;