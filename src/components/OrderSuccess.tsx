"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

type OrderSuccessProps = {
  order: {
    id: string;
    status: string;
    totalAmount: number; // cents
    items: { id: string; productVariantId: string; quantity: number; priceAtPurchase: number }[]; // cents
  } | null;
};

export default function OrderSuccess({ order }: OrderSuccessProps) {
  return (
    <div className="max-w-3xl mx-auto bg-light-100 border border-light-300 rounded-lg p-8">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle className="text-green-600" />
        <h1 className="font-jost text-heading-3 text-dark-900">Payment successful</h1>
      </div>
      {order ? (
        <div className="space-y-4">
          <div className="font-jost text-dark-900">
            <div className="flex justify-between">
              <span>Order ID</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-medium capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">${(order.totalAmount / 100).toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t border-light-300 pt-4">
            <h2 className="font-jost text-dark-900 mb-2">Items</h2>
            <ul className="space-y-2">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between text-dark-900 font-jost text-body">
                  <span>Variant: {it.productVariantId}</span>
                  <span>
                    {it.quantity} × ${(it.priceAtPurchase / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="font-jost text-body text-dark-700">Your payment was processed. We will email your order details shortly.</p>
      )}
      <Link
        href="/products"
        className="inline-block mt-6 bg-dark-900 hover:bg-dark-700 text-light-100 rounded-full px-6 py-3 font-jost text-body"
      >
        Continue shopping
      </Link>
    </div>
  );
}
