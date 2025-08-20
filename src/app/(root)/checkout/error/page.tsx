import OrderError from "@/components/OrderError";

export default async function CheckoutErrorPage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string; msg?: string }>;
}) {
  const sp = (await searchParams) || {};
  return (
    <div className="py-12 min-h-screen">
      <OrderError code={sp.code} message={sp.msg} />
    </div>
  );
}
