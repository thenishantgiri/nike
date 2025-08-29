"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCodOrder } from "@/lib/actions/orders";

export default function CheckoutCodForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingSame, setBillingSame] = useState(true);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    if (billingSame) form.set("billing_same", "on");
    const res = await createCodOrder(form);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setError(res.error);
      return;
    }
    if (res && "ok" in res && res.ok && "orderId" in res && res.orderId) {
      router.push(`/checkout/success?orderId=${res.orderId}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      ) : null}

      <h2 className="font-jost text-heading-3 text-dark-900">Cash on Delivery</h2>
      <p className="font-jost text-body text-dark-700">Enter your shipping and billing details to place a COD order.</p>

      <fieldset className="border border-light-300 rounded-lg p-4">
        <legend className="px-2 font-jost text-body-medium text-dark-900">Shipping Address</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-dark-900 font-jost mb-1">Address Line 1</label>
            <input name="shipping_line1" required className="w-full px-3 py-2 border border-light-300 rounded" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-dark-900 font-jost mb-1">Address Line 2</label>
            <input name="shipping_line2" className="w-full px-3 py-2 border border-light-300 rounded" />
          </div>
          <div>
            <label className="block text-sm text-dark-900 font-jost mb-1">City</label>
            <input name="shipping_city" required className="w-full px-3 py-2 border border-light-300 rounded" />
          </div>
          <div>
            <label className="block text-sm text-dark-900 font-jost mb-1">State / County</label>
            <input name="shipping_state" required className="w-full px-3 py-2 border border-light-300 rounded" />
          </div>
          <div>
            <label className="block text-sm text-dark-900 font-jost mb-1">Postal Code</label>
            <input name="shipping_postalCode" required className="w-full px-3 py-2 border border-light-300 rounded" />
          </div>
          <div>
            <label className="block text-sm text-dark-900 font-jost mb-1">Country</label>
            <input name="shipping_country" defaultValue="GB" required className="w-full px-3 py-2 border border-light-300 rounded" />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-2">
        <input id="billing_same" type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} />
        <label htmlFor="billing_same" className="font-jost text-body">Billing address same as shipping</label>
      </div>

      {!billingSame && (
        <fieldset className="border border-light-300 rounded-lg p-4">
          <legend className="px-2 font-jost text-body-medium text-dark-900">Billing Address</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-dark-900 font-jost mb-1">Address Line 1</label>
              <input name="billing_line1" required className="w-full px-3 py-2 border border-light-300 rounded" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-dark-900 font-jost mb-1">Address Line 2</label>
              <input name="billing_line2" className="w-full px-3 py-2 border border-light-300 rounded" />
            </div>
            <div>
              <label className="block text-sm text-dark-900 font-jost mb-1">City</label>
              <input name="billing_city" required className="w-full px-3 py-2 border border-light-300 rounded" />
            </div>
            <div>
              <label className="block text-sm text-dark-900 font-jost mb-1">State / County</label>
              <input name="billing_state" required className="w-full px-3 py-2 border border-light-300 rounded" />
            </div>
            <div>
              <label className="block text-sm text-dark-900 font-jost mb-1">Postal Code</label>
              <input name="billing_postalCode" required className="w-full px-3 py-2 border border-light-300 rounded" />
            </div>
            <div>
              <label className="block text-sm text-dark-900 font-jost mb-1">Country</label>
              <input name="billing_country" defaultValue="GB" required className="w-full px-3 py-2 border border-light-300 rounded" />
            </div>
          </div>
        </fieldset>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-dark-900 text-light-100 rounded-full px-6 py-3 font-jost">
          {loading ? "Placing order..." : "Place COD Order"}
        </button>
      </div>
    </form>
  );
}

