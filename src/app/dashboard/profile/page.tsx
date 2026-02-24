"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { getRestaurantDetails } from "@/app/actions/get-restaurant";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [restaurant, setRestaurant] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }

      // Get Restaurant
      try {
        const data = await getRestaurantDetails();
        if (data) {
          setRestaurant(data);
        }
      } catch (error) {
        console.error("Failed to load restaurant details", error);
        toast.error("Failed to load restaurant details");
      }
    }
    loadData();
  }, [supabase.auth]);

  const initials = email ? email.substring(0, 2).toUpperCase() : "VP";

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          View your account and restaurant details
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{email || "Loading..."}</CardTitle>
                  <CardDescription>Free plan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input value={email} readOnly className="h-10 bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Restaurant Details */}
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">Restaurant Details</CardTitle>
                <CardDescription>Read-only information</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:admin@example.com?subject=Update Restaurant Details">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Admin
                </a>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input value={restaurant?.name || ""} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={restaurant?.phone || restaurant?.twilio_phone_number || ""} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={restaurant?.address || ""} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={restaurant?.email || ""} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={restaurant?.website || ""} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input value={restaurant?.timezone || ""} readOnly className="bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
