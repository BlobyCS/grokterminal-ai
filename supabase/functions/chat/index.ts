import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();
    
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured");
      throw new Error("GROQ_API_KEY is not configured");
    }

    console.log("Received message:", message);
    console.log("History length:", history?.length || 0);

    // Build messages array with system prompt and history
    const messages = [
      {
        role: "system",
        content: `Ty jsi webový AI terminálový asistent. Odpovídáš stručně, přesně a technicky. Používáš formátování vhodné pro terminál - krátké odstavce, seznamy s pomlčkami, a kód v backtickách. Jsi přátelský ale profesionální. Odpovídáš v češtině, pokud uživatel nepíše anglicky.`
      },
      ...(history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    console.log("Calling GROQ API with", messages.length, "messages");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GROQ API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("GROQ API response received");

    const aiMessage = data.choices?.[0]?.message?.content || "No response from AI";

    return new Response(
      JSON.stringify({ response: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
