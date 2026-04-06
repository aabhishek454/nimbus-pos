"use client";

import { Briefcase } from "lucide-react";

import PortalAuth from "@/components/PortalAuth";

export default function OwnerLoginPage() {
  return (
    <PortalAuth
      role="owner"
      title="Owner Portal"
      description="Sign in to run staff, orders, expenses, exports, and reporting from a polished command center."
      accentClassName="bg-[linear-gradient(135deg,#4f79ff,#7c5cff)] shadow-[0_20px_50px_rgba(79,121,255,0.28)]"
      icon={<Briefcase className="h-7 w-7 text-white" />}
      allowRegister
    />
  );
}
