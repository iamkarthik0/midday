import { verify } from "@midday/invoice/token";
import { getInvoiceQuery } from "@midday/supabase/queries";
import { createClient } from "@midday/supabase/server";
import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const runtime = "edge";

const CDN_URL = "https://cdn.midday.ai";

export default async function Image({ params }: { params: { token: string } }) {
  const supabase = createClient({ admin: true });

  const { id } = await verify(params.token);
  const { data: invoice } = await getInvoiceQuery(supabase, id);

  if (!invoice) {
    return new Response("Not found", { status: 404 });
  }

  const OgTemplate = (await import("@midday/invoice")).OgTemplate;

  return new ImageResponse(
    <OgTemplate
      {...invoice}
      name={invoice.customer_name || invoice.customer?.name}
      isValidLogo={true}
      logoUrl={"logoUrl"}
    />,
    {
      width: 1200,
      height: 630,
    },
  );
}

