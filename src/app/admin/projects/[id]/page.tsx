import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectEditorForm, {
  type EditableProject,
} from "./ProjectEditorForm";
import styles from "./project-editor.module.css";

type ProjectEditorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProjectRow = EditableProject & {
  created_at: string;
  updated_at: string;
};

export default async function ProjectEditorPage({
  params,
}: ProjectEditorPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    redirect("/admin/login?error=unauthorized");
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        id,
        slug,
        title,
        project_number,
        year,
        period,
        summary,
        categories,
        roles,
        status,
        featured,
        sort_order,
        live_url,
        accent_color,
        secondary_color,
        created_at,
        updated_at
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat project: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const project = data as ProjectRow;

  const { count: sectionCount, error: sectionCountError } = await supabase
    .from("project_sections")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("project_id", project.id);

  if (sectionCountError) {
    throw new Error(
      `Gagal menghitung project section: ${sectionCountError.message}`,
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.dot} />
            <span>NATSX / ADMIN</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <Link
              className={styles.backLink}
              href={`/admin/projects/${project.id}/sections`}
            >
              Content sections ↗
            </Link>

            <Link className={styles.backLink} href="/admin">
              ← Back to projects
            </Link>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroHeader}>
            <p>03 / PROJECT EDITOR</p>

            <span
              className={styles.statusBadge}
              data-status={project.status}
            >
              {project.status}
            </span>
          </div>

          <div className={styles.heroGrid}>
            <h1>
              {project.title}
              <span>.</span>
            </h1>

            <div className={styles.projectSummary}>
              <p>/{project.slug}</p>

              <dl>
                <div>
                  <dt>Project</dt>
                  <dd>{project.project_number}</dd>
                </div>

                <div>
                  <dt>Sections</dt>
                  <dd>{String(sectionCount ?? 0).padStart(2, "0")}</dd>
                </div>

                <div>
                  <dt>Year</dt>
                  <dd>{project.year}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className={styles.editorSection}>
          <p className={styles.sectionLabel}>PROJECT SETTINGS</p>

          <ProjectEditorForm project={project} />
        </section>
      </div>
    </main>
  );
}