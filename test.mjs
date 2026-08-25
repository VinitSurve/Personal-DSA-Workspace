import { createClient } from "@supabase/supabase-js"; 
const supabase = createClient("https://vhdgxlwhvqphospqhncv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZGd4bHdodnFwaG9zcHFobmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NjgwNDAsImV4cCI6MjEwMzI0NDA0MH0.bA16qGipfevEh5bDs7UhjVSJbJI0LQC3tWy0OYz4vYI"); 

async function test() { 
  const { data, error } = await supabase.from("problems").select("*"); 
  console.log("Problems Data:", data, "Error:", error); 
  
  const { data: sol, error: err } = await supabase.from("solutions").select("*");
  console.log("Solutions Data:", sol, "Error:", err);
} 
test();
