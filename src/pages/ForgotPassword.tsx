import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else setSent(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-border/40">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Reset Password</CardTitle>
            <CardDescription>{sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}</CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@armanagroup.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-10" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <p className="text-center text-sm text-muted-foreground">We've sent a password reset link to <strong>{email}</strong>.</p>
            )}
            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
