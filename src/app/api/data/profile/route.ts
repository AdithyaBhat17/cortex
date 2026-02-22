import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }

  return NextResponse.json(data ?? null);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { height_cm, date_of_birth, gender } = body;

  // Validation
  if (height_cm !== undefined && height_cm !== null) {
    if (typeof height_cm !== "number" || height_cm < 50 || height_cm > 300) {
      return NextResponse.json({ error: "Height must be between 50 and 300 cm" }, { status: 400 });
    }
  }

  if (gender !== undefined && gender !== null) {
    if (gender !== "male" && gender !== "female") {
      return NextResponse.json({ error: "Gender must be 'male' or 'female'" }, { status: 400 });
    }
  }

  if (date_of_birth !== undefined && date_of_birth !== null) {
    const dob = new Date(date_of_birth);
    if (isNaN(dob.getTime()) || dob > new Date() || dob < new Date("1900-01-01")) {
      return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: user.id,
        height_cm: height_cm ?? null,
        date_of_birth: date_of_birth ?? null,
        gender: gender ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Profile upsert error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }

  return NextResponse.json(data);
}
