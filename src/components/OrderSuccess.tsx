"use client";

import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/store/cart.store";
import {
  Banknote,
  Check,
  CheckCircle,
  Copy,
  CreditCard,
  Home,
  Package,
  Truck,
} from "lucide-react";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { useEffect, useState } from "react";

// View model for order success UI using furniture semantics
type OrderItemVM = {
  id: string;
  variantId: string;
  sku: string;
  product: { id: string; name: string };
  size: string | null;
  finish: { name: string | null; hex: string | null };
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderVM = {
  id: string;
  status: string;
  totalAmount: number;
  currency?: string;
  shippingAmount?: number;
  createdAt?: string;
  items: OrderItemVM[];
  addresses?: {
    shipping: {
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    } | null;
    billing: {
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    } | null;
  } | null;
  payment?: {
    method: string;
    status: string;
    transactionLast8: string | null;
    paidAt: string | null;
  } | null;
} | null;

export default function OrderSuccess({ order }: { order: OrderVM }) {
  const hydrate = useCart((s) => s.hydrate);
  const refresh = useCart((s) => s.refresh);
  const [copied, setCopied] = useState(false);
  // Ensure client cart UI is cleared immediately after a successful order
  useEffect(() => {
    hydrate({ id: null, items: [], subtotal: 0, count: 0 });
    // Also sync with server to be extra safe
    refresh().catch(() => void 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const subtotal =
    order?.items?.reduce((acc, it) => acc + Number(it.lineTotal || 0), 0) ?? 0;
  const shipping = Number(order?.shippingAmount || 0);
  // Stable ISO date slice to avoid SSR/CSR mismatch
  const placedDate = (order?.payment?.paidAt || order?.createdAt || "").slice(0, 10) || undefined;

  async function copyOrderId() {
    if (!order?.id) return;
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-light-300 bg-light-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600 h-6 w-6" />
            <div>
              <h1 className="font-jost text-heading-3 text-dark-900">
                {order?.payment?.method === "cod"
                  ? "Order placed (COD)"
                  : "Payment successful"}
              </h1>
              {order ? (
                <p className="text-dark-700 font-jost text-body">
                  Order <span className="font-medium">{order.id}</span> •{" "}
                  <span className="capitalize">{order.status}</span>
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-2 sm:mt-0 w-full sm:w-auto flex justify-start sm:justify-end">
            {order?.payment ? (
              <div
                className={`flex flex-wrap items-center gap-2 rounded-full px-3 py-1.5 border max-w-full justify-center ${
                  order.payment.method === "cod"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                {order.payment.method === "cod" ? (
                  <Banknote className="size-6 text-amber-700" />
                ) : (
                  <CreditCard className="size-6 text-green-700" />
                )}
                <span className="font-jost text-body text-dark-700 px-2">
                  {order.payment.method === "cod"
                    ? "Cash on Delivery • Pay at delivery"
                    : `Paid • ${
                        order.payment.transactionLast8
                          ? `…${order.payment.transactionLast8}`
                          : "—"
                      }`}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {order ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-light-200 border border-light-300 px-3 py-1.5 font-jost text-caption text-dark-700">
              <CheckCircle className="h-3.5 w-3.5" /> Order ID:{" "}
              {order.id.slice(0, 8)}…
              <button
                type="button"
                onClick={copyOrderId}
                className="ml-1 inline-flex items-center gap-1 text-dark-900 hover:text-dark-700"
                aria-label="Copy order ID"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-light-200 border border-light-300 px-3 py-1.5 font-jost text-caption text-dark-700">
              <CreditCard className="h-3.5 w-3.5" />{" "}
              {order.payment?.method?.toUpperCase() || "—"}
            </span>
            {placedDate ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-light-200 border border-light-300 px-3 py-1.5 font-jost text-caption text-dark-700">
                <Truck className="h-3.5 w-3.5" /> Placed on {placedDate}
              </span>
            ) : null}
          </div>
        ) : null}

        {order ? (
          <div className="mt-6">
            {(() => {
              const status = String(order.status || "").toLowerCase();
              const stepIndex = status === "delivered" ? 2 : status === "shipped" ? 1 : 0; // 0=Placed,1=Shipped,2=Delivered
              return (
                <div className="grid grid-cols-5 items-center gap-2">
                  {/* Step 1 */}
                  <div className="col-span-1 flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${stepIndex >= 0 ? "bg-dark-900 border-dark-900 text-light-100" : "bg-light-200 border-light-300 text-dark-700"}`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <span className="mt-2 font-jost text-caption text-dark-900">Placed</span>
                  </div>
                  {/* Connector 1 */}
                  <div className={`col-span-1 h-1 rounded ${stepIndex >= 1 ? "bg-dark-900" : "bg-light-300"}`} />
                  {/* Step 2 */}
                  <div className="col-span-1 flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${stepIndex >= 1 ? "bg-dark-900 border-dark-900 text-light-100" : "bg-light-200 border-light-300 text-dark-700"}`}>
                      <Truck className="h-5 w-5" />
                    </div>
                    <span className="mt-2 font-jost text-caption text-dark-900">Shipped</span>
                  </div>
                  {/* Connector 2 */}
                  <div className={`col-span-1 h-1 rounded ${stepIndex >= 2 ? "bg-dark-900" : "bg-light-300"}`} />
                  {/* Step 3 */}
                  <div className="col-span-1 flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${stepIndex >= 2 ? "bg-dark-900 border-dark-900 text-light-100" : "bg-light-200 border-light-300 text-dark-700"}`}>
                      <Home className="h-5 w-5" />
                    </div>
                    <span className="mt-2 font-jost text-caption text-dark-900">Delivered</span>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-light-300">
              {order?.items?.map((it) => (
                <li key={it.id} className="py-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg bg-light-200 overflow-hidden flex-shrink-0">
                    {it.imageUrl ? (
                      <SmartImage
                        src={it.imageUrl}
                        alt={it.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-jost text-dark-900 truncate">
                          {it.product.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-dark-700 text-sm">
                          {it.finish?.name ? (
                            <span className="inline-flex items-center gap-1">
                              <span
                                aria-hidden
                                className="inline-block w-3 h-3 rounded-full border border-light-300"
                                style={{
                                  backgroundColor: it.finish?.hex || "#eee",
                                }}
                              />
                              {it.finish.name}
                            </span>
                          ) : null}
                          {it.size ? <span>Size {it.size}</span> : null}
                          <span>Qty {it.quantity}</span>
                          <span className="hidden sm:inline">SKU {it.sku}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-jost text-dark-900">
                          {formatCurrency(it.unitPrice, order?.currency)}
                        </div>
                        <div className="text-dark-700 text-sm">
                          Line total{" "}
                          {formatCurrency(it.lineTotal, order?.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-light-300 p-5">
              <h3 className="font-jost text-dark-900 mb-4">Summary</h3>
              <div className="space-y-2 font-jost text-dark-900">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, order?.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0
                      ? "Free"
                      : formatCurrency(shipping, order?.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-medium">
                    {formatCurrency(
                      Number(order?.totalAmount || 0),
                      order?.currency
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-light-200 border border-light-300 p-4">
              <div className="flex items-start gap-3">
                <Truck className="size-8 text-dark-700 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-jost text-body-medium text-dark-900">
                    {order?.payment?.method === "cod"
                      ? "What happens next"
                      : "Thanks for your purchase"}
                  </p>
                  <p className="font-jost text-caption text-dark-700">
                    {order?.payment?.method === "cod"
                      ? "Your order has been placed. You’ll pay at delivery. We’ll email shipment updates shortly."
                      : "Your payment was successful. We’re preparing your order and will email shipment updates."}
                  </p>
                </div>
              </div>
            </div>

            {order?.addresses?.shipping || order?.addresses?.billing ? (
              <div className="mt-6 grid grid-cols-1 gap-4">
                {order.addresses.shipping ? (
                  <div className="rounded-xl border border-light-300 p-5">
                    <h4 className="font-jost text-dark-900 mb-2">
                      Shipping Address
                    </h4>
                    <AddressBlock
                      line1={order.addresses.shipping.line1}
                      line2={order.addresses.shipping.line2}
                      city={order.addresses.shipping.city}
                      state={order.addresses.shipping.state}
                      postalCode={order.addresses.shipping.postalCode}
                      country={order.addresses.shipping.country}
                    />
                  </div>
                ) : null}
                {order.addresses.billing ? (
                  <div className="rounded-xl border border-light-300 p-5">
                    <h4 className="font-jost text-dark-900 mb-2">
                      Billing Address
                    </h4>
                    <AddressBlock
                      line1={order.addresses.billing.line1}
                      line2={order.addresses.billing.line2}
                      city={order.addresses.billing.city}
                      state={order.addresses.billing.state}
                      postalCode={order.addresses.billing.postalCode}
                      country={order.addresses.billing.country}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="inline-flex justify-center items-center rounded-full bg-dark-900 hover:bg-dark-700 text-light-100 px-6 py-3 font-jost text-body"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="inline-flex justify-center items-center rounded-full border border-dark-900 text-dark-900 hover:bg-light-200 px-6 py-3 font-jost text-body"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

function AddressBlock(props: {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}) {
  return (
    <div className="text-dark-700 text-sm">
      <div>{props.line1}</div>
      {props.line2 ? <div>{props.line2}</div> : null}
      <div>
        {props.city}, {props.state} {props.postalCode}
      </div>
      <div>{props.country}</div>
    </div>
  );
}
