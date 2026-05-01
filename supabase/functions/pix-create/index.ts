import mercadopago from "npm:mercadopago";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

mercadopago.configurations.setAccessToken(
  Deno.env.get("MP_ACCESS_TOKEN")!
);

Deno.serve(async (req) => {

  // 🔥 resolve o preflight (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, customer } = await req.json();

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(items[0].price),
      description: items[0].name,
      payment_method_id: "pix",
      payer: {
        email: customer.email,
        first_name: customer.name,
      },
    });

    const data =
      payment.body.point_of_interaction.transaction_data;

    return new Response(
      JSON.stringify({
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro ao gerar Pix" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});