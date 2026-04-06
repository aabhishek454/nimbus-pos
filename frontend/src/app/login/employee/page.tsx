"use client";

import { UserCircle } from "lucide-react";

import PortalAuth from "@/components/PortalAuth";

export default function EmployeeLoginPage() {
  return (
    <PortalAuth
      role="employee"
      title="Employee POS"
      description="Fast, focused sign-in for the counter team. Take orders, print receipts, and keep service moving."
      accentClassName="bg-[linear-gradient(135deg,#23c483,#1d9bf0)] shadow-[0_20px_50px_rgba(35,196,131,0.28)]"
      icon={<UserCircle className="h-7 w-7 text-white" />}
    />
  );
}
