import type { AnalysisReport, SavedProject } from "@micro-saas-scout/shared";
import { supabase } from "../lib/supabase";

const memoryStore = new Map<string, SavedProject[]>();

export async function saveProject(userId: string, report: AnalysisReport) {
  const project: SavedProject = {
    id: crypto.randomUUID(),
    userId,
    report,
    favorite: false,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    const { error } = await supabase.from("projects").insert({
      id: project.id,
      user_id: userId,
      report,
      favorite: false,
    });
    if (error) throw error;
  } else {
    memoryStore.set(userId, [project, ...(memoryStore.get(userId) ?? [])]);
  }

  return project;
}

export async function listProjects(userId: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .select("id,user_id,report,favorite,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((item) => ({
      id: item.id as string,
      userId: item.user_id as string,
      report: item.report as AnalysisReport,
      favorite: Boolean(item.favorite),
      createdAt: item.created_at as string,
    }));
  }

  return memoryStore.get(userId) ?? [];
}
