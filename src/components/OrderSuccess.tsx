"use client";

import React from "react";
import { CheckCircle, BadgeCheck } from "lucide-react";
import Link from "next/link";

type OrderItemVM = {
  id: string;
  variantId: string;
  sku: string;
  product: { id: string; name: string };
  size: string | null;
  color: { name: string | null; hex: string | null };
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderVM = {
  id: string;
  status: string;
  totalAmount: number;
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
  const subtotal =
    order?.items?.reduce((acc, it) => acc + Number(it.lineTotal || 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-light-300 bg-light-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600 h-6 w-6" />
            <div>
              <h1 className="font-jost text-heading-3 text-dark-900">Payment successful</h1>
              {order ? (
                <p className="text-dark-700 font-jost text-body">
                  Order <span className="font-medium">{order.id}</span> •{" "}
                  <span className="capitalize">{order.status}</span>
                </p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            {order?.payment ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-light-300 px-3 py-1.5">
                <BadgeCheck className="h-4 w-4 text-dark-700" />
                <span className="font-jost text-body text-dark-700">
                  {order.payment.method} • {order.payment.transactionLast8 ? `…${order.payment.transactionLast8}` : "—"}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-light-300">
              {order?.items?.map((it) => (
                <li key={it.id} className="py-4 flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-light-200 overflow-hidden flex-shrink-0">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.product.name}
                        className="w-full h-full object-cover"
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
                          {it.color?.name ? (
                            <span className="inline-flex items-center gap-1">
                              <span
                                aria-hidden
                                className="inline-block w-3 h-3 rounded-full border border-light-300"
                                style={{
                                  backgroundColor: it.color?.hex || "#eee",
                                }}
                              />
                              {it.color.name}
                            </span>
                          ) : null}
                          {it.size ? <span>Size {it.size}</span> : null}
                          <span>Qty {it.quantity}</span>
                          <span className="hidden sm:inline">SKU {it.sku}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-jost text-dark-900">
                          ${(it.unitPrice / 100).toFixed(2)}
                        </div>
                        <div className="text-dark-700 text-sm">
                          Line total ${(it.lineTotal / 100).toFixed(2)}
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
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-medium">
                    ${(Number(order?.totalAmount || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {order?.addresses?.shipping || order?.addresses?.billing ? (
              <div className="mt-6 grid grid-cols-1 gap-4">
                {order.addresses.shipping ? (
                  <div className="rounded-xl border border-light-300 p-5">
                    <h4 className="font-jost text-dark-900 mb-2">Shipping Address</h4>
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
                    <h4 className="font-jost text-dark-900 mb-2">Billing Address</h4>
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
