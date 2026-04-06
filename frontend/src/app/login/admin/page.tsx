"use client";

import { Shield } from "lucide-react";

import PortalAuth from "@/components/PortalAuth";

export default function AdminLoginPage() {
  return (
    <PortalAuth
      role="admin"
      title="Admin Console"
      description="Enter the executive workspace for business oversight, user monitoring, and platform analytics."
      accentClassName="bg-[linear-gradient(135deg,#ff6b81,#ff9f43)] shadow-[0_20px_50px_rgba(255,107,129,0.28)]"
      icon={<Shield className="h-7 w-7 text-white" />}
    />
  );
}
