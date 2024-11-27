import { ImageResponse } from "next/og";
import dynamic from 'next/dynamic';

const OgTemplate = dynamic(() => 
  import("@midday/invoice/components/og-template").then(mod => mod.OgTemplate)
);

export const contentType = "image/png";
export const runtime = "edge";

const CDN_URL = "https://cdn.midday.ai";

export default async function Image({ params }: { params: { token: string } }) {
  // Import only what we need
  const { verify } = await import("@midday/invoice/token");
  const { getInvoiceQuery } = await import("@midday/supabase/queries");
  const { createClient } = await import("@midday/supabase/server");

  const supabase = createClient({ admin: true });

  const { id } = await verify(params.token);
  const { data: invoice } = await getInvoiceQuery(supabase, id);

  if (!invoice) {
    return new Response("Not found", { status: 404 });
  }

  // Load fonts in parallel
  const [geistMonoRegular] = await Promise.all([
    fetch(`${CDN_URL}/fonts/GeistMono/og/GeistMono-Regular.otf`).then(res => res.arrayBuffer())
  ]);

  // Simplified logo handling
  const logoUrl = invoice.customer?.website ? 
    `https://img.logo.dev/${invoice.customer.website}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ&size=60` : 
    null;

  return new ImageResponse(
    <OgTemplate
      {...invoice}
      name={invoice.customer_name || invoice.customer?.name}
      isValidLogo={!!logoUrl}
      logoUrl={logoUrl}
    />,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "GeistMono",
          data: geistMonoRegular,
          style: "normal",
          weight: 400,
        }
      ],
    },
  );
}
