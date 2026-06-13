/* =========================================================
   FrachtHub Analyse-Workshop — Supabase Client
   Wird vor app.jsx geladen; setzt window.supabaseClient.
   ========================================================= */
(function () {
  const SUPABASE_URL = "https://bspsckyzjdrytlpxpdjr.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcHNja3l6amRyeXRscHhwZGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTEzMDcsImV4cCI6MjA5Njg4NzMwN30.TOC2FqJPed-KAMROngOxndalkB4-sP0Sn4aTjMw-Wyg";

  if (window.supabase && window.supabase.createClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    console.log("[FH] Supabase Client initialisiert ✓");
  } else {
    console.error("[FH] Supabase NICHT initialisiert — window.supabase:", window.supabase);
  }
})();
