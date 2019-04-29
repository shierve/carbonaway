import strip = require("stripe");
const stripe = new strip(process.env.STRIPE_KEY!);
const stripePub = new strip(process.env.STRIPE_PUB!);

export const createPayment = async (userId: string, trees: number, amount: number) => {
  const session = await (stripe as any).checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      name: "Trees",
      description: "Plant trees to offset your carbon footprint",
      amount,
      currency: "usd",
      quantity: trees,
    }],
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });
  const r = await (stripePub as any).redirectToCheckout({
    sessionId: session.id,
  });
  return r;
};
