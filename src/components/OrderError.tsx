"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function OrderError({
  code,
  message,
}: {
  code?: string | null;
  message?: string | null;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-light-300 bg-light-100 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-600 h-6 w-6" />
          <h1 className="font-jost text-heading-3 text-dark-900">Checkout failed</h1>
        </div>
        <p className="mt-3 font-jost text-body text-dark-700">
          We couldn&apos;t start your checkout. Please try again in a moment.
        </p>
        {message ? (
          <div className="mt-4 rounded-lg border border-light-300 bg-white p-4">
            <p className="font-jost text-dark-900">{message}</p>
            {code ? (
              <p className="font-jost text-dark-700 text-sm mt-1">Code: {code}</p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/cart"
            className="inline-flex justify-center items-center rounded-full bg-dark-900 hover:bg-dark-700 text-light-100 px-6 py-3 font-jost text-body"
          >
            Return to cart
          </Link>
          <Link
            href="/products"
            className="inline-flex justify-center items-center rounded-full border border-dark-900 text-dark-900 hover:bg-light-200 px-6 py-3 font-jost text-body"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
