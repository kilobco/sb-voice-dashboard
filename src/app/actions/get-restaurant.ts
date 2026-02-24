"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getRestaurantDetails() {
    const supabase = createAdminClient();
    const restaurantId = process.env.DEFAULT_RESTAURANT_ID;

    if (!restaurantId) {
        throw new Error("Restaurant ID not set");
    }

    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

    if (error) {
        console.error("Error fetching restaurant:", error);
        return null;
    }

    return data;
}
