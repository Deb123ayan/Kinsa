// @ts-ignore - Deno import for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno import for Nodemailer
import { createTransport } from "https://deno.land/x/nodemailer@1.0.0/mod.ts";

// Deno global declaration for Edge Functions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Email configuration from environment variables
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASS = Deno.env.get("SMTP_PASS");

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  from?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter (per isolate)
const IP_RATE_LIMIT = new Map<string, { count: number, resetTime: number }>();
const MAX_REQUESTS = 3; // Max 3 emails per minute per IP
const RESET_INTERVAL_MS = 60 * 1000; // 1 minute

// In-memory Idempotency Cache (per isolate)
const IDEMPOTENCY_CACHE = new Map<string, { data: any, status: number, timestamp: number }>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Rate Limiting Check
    const clientIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    if (clientIp !== "unknown") {
      const record = IP_RATE_LIMIT.get(clientIp);
      if (record && now < record.resetTime) {
        if (record.count >= MAX_REQUESTS) {
          return new Response(
            JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
          );
        }
        record.count++;
      } else {
        IP_RATE_LIMIT.set(clientIp, { count: 1, resetTime: now + RESET_INTERVAL_MS });
      }
    }

    // 2. Idempotency Check
    const idempotencyKey = req.headers.get("x-idempotency-key");
    if (idempotencyKey) {
      const cachedResponse = IDEMPOTENCY_CACHE.get(idempotencyKey);
      if (cachedResponse && (now - cachedResponse.timestamp < IDEMPOTENCY_TTL_MS)) {
        console.log(`Idempotency cache hit for key: ${idempotencyKey}`);
        return new Response(JSON.stringify(cachedResponse.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: cachedResponse.status,
        });
      }
    }

    const {
      to,
      subject,
      message,
      from = "KINSA Global <noreply@kinsa-global.com>",
    }: EmailRequest = await req.json();

    // Parse the contact form data from the message
    let contactData: ContactFormData;
    try {
      contactData = JSON.parse(message);
    } catch {
      // Fallback if message is not JSON
      contactData = {
        name: "Unknown",
        email: "unknown@example.com",
        subject: subject,
        message: message,
      };
    }

    // Create the email HTML content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          New Contact Form Submission - KINSA Global
        </h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Contact Details:</h3>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Subject:</strong> ${contactData.subject}</p>
        </div>
        
        <div style="background: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
          <h3 style="color: #2c3e50; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.6; color: #495057;">
            ${contactData.message.replace(/\n/g, "<br>")}
          </p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 8px; font-size: 12px; color: #6c757d;">
          <p>This email was sent from the KINSA Global contact form.</p>
          <p>Reply directly to this email to respond to: ${contactData.email}</p>
        </div>
      </div>
    `;

    // Always send to your email
    const recipientEmail = "mukherjeed556@gmail.com";
    const emailSubject = `[KINSA Contact] ${contactData.subject}`;

    if (!SMTP_USER || !SMTP_PASS) {
      // Fallback: Log email details (for development)
      console.log("Email would be sent:", {
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        from,
        smtp: {
          host: SMTP_HOST,
          port: SMTP_PORT,
          user: SMTP_USER ? "***configured***" : "not configured",
          pass: SMTP_PASS ? "***configured***" : "not configured",
        },
      });

      const devResponseData = {
        success: true,
        message: "Email logged successfully (development mode - configure SMTP_USER and SMTP_PASS to send emails)",
        data: {
          to: recipientEmail,
          subject: emailSubject,
          contactData,
        },
      };

      if (idempotencyKey) {
        IDEMPOTENCY_CACHE.set(idempotencyKey, {
          data: devResponseData,
          status: 200,
          timestamp: Date.now()
        });
      }

      return new Response(
        JSON.stringify(devResponseData),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create Nodemailer transporter
    const transporter = createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send email using Nodemailer
    try {
      const info = await transporter.sendMail({
        from: `"KINSA Global" <${SMTP_USER}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        replyTo: contactData.email, // Allow direct reply to the contact person
      });

      const successResponseData = {
        success: true,
        message: "Email sent successfully via Nodemailer",
        data: {
          messageId: info.messageId,
          to: recipientEmail,
          subject: emailSubject,
        },
      };

      if (idempotencyKey) {
        IDEMPOTENCY_CACHE.set(idempotencyKey, {
          data: successResponseData,
          status: 200,
          timestamp: Date.now()
        });
      }

      return new Response(
        JSON.stringify(successResponseData),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (emailError) {
      console.error("Nodemailer error:", emailError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to send email: ${emailError.message}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("General error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});