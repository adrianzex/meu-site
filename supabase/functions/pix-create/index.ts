import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();
    const { amount, description, email } = body;

    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: description || "Pagamento Pix",
        payment_method_id: "pix",
        payer: {
          email: email || "cliente@email.com",
        },
      }),
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        qr_code: data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
        copia_cola: data.point_of_interaction?.transaction_data?.qr_code,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});