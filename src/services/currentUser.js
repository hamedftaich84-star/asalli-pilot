import { supabase } from "./supabase";

export async function getCurrentUserProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", session.user.email)
    .single();

  if (error) {
    console.error("Erreur profil utilisateur :", error);
    return null;
  }

  return data;
}