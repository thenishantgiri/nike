import OrderSuccess from "@/components/OrderSuccess";
import { getOrder } from "@/lib/actions/orders";
import { getStripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema/payments";
import { eq } from "drizzle-orm";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ session_id?: string; orderId?: string }>;
}) {
  const sp = (await searchParams) || {};
  let orderId = sp.orderId;

  if (!orderId && sp.session_id) {
    const session = await getStripe().checkout.sessions.retrieve(sp.session_id);
    const transactionId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || session.id;

    if (transactionId) {
      const pay = await db
        .select({ orderId: payments.orderId })
        .from(payments)
        .where(eq(payments.transactionId, transactionId))
        .limit(1);
      if (pay[0]?.orderId) {
        orderId = String(pay[0].orderId);
      }
    }
  }

  const order = orderId ? await getOrder(orderId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <OrderSuccess order={order} />
    </div>
  );
}
