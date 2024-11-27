import { ImageResponse } from "next/og";
import { verify } from "@midday/invoice/token";
import { getInvoiceQuery } from "@midday/supabase/queries";
import { createClient } from "@midday/supabase/server";

export const contentType = "image/png";
export const runtime = "edge";

// Minimal template component to reduce bundle size
function MinimalOgTemplate({ name, amount, currency }: { 
  name: string;
  amount: number;
  currency: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        width: '100%',
        height: '100%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <h1 style={{ fontSize: '60px', color: '#000' }}>Invoice</h1>
      <p style={{ fontSize: '40px', color: '#666' }}>{name}</p>
      <p style={{ fontSize: '48px', color: '#000' }}>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency
        }).format(amount)}
      </p>
    </div>
  );
}

export default async function Image({ params }: { params: { token: string } }) {
  try {
    const supabase = createClient({ admin: true });
    const { id } = await verify(params.token);
    const { data: invoice } = await getInvoiceQuery(supabase, id);

    if (!invoice) {
      return new Response("Not found", { status: 404 });
    }

    return new ImageResponse(
      <MinimalOgTemplate
        name={invoice.customer_name || invoice.customer?.name}
        amount={invoice.amount}
        currency={invoice.currency}
      />,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OpenGraph generation error:', error);
    return new Response("Error generating image", { status: 500 });
  }
}