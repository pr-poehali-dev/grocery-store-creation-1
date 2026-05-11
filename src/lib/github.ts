import { getSettings } from "./store";
import type { ProjectFiles } from "./files";

async function gh(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`GitHub ${res.status}: ${t.slice(0, 200) || res.statusText}`);
  }
  return res.json();
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

export async function commitToGitHub(files: ProjectFiles, message = "Коммит из Муравей 2.0"): Promise<string> {
  const s = getSettings().github;
  if (!s.token) throw new Error("Не задан токен GitHub. Откройте «Ядро → GitHub».");
  if (!s.repo || !s.repo.includes("/")) throw new Error("Укажите путь репозитория в формате «пользователь/репо».");

  const branch = s.branch || "main";
  const [owner, repo] = s.repo.split("/");

  const ref = await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, s.token);
  const latestSha: string = ref.object.sha;

  const baseCommit = await gh(`/repos/${owner}/${repo}/git/commits/${latestSha}`, s.token);
  const baseTree: string = baseCommit.tree.sha;

  const blobs = await Promise.all(
    Object.entries(files).map(async ([path, content]) => {
      const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, s.token, {
        method: "POST",
        body: JSON.stringify({ content: utf8ToBase64(content), encoding: "base64" }),
      });
      return { path, mode: "100644", type: "blob", sha: blob.sha };
    })
  );

  const newTree = await gh(`/repos/${owner}/${repo}/git/trees`, s.token, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree: blobs }),
  });

  const newCommit = await gh(`/repos/${owner}/${repo}/git/commits`, s.token, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [latestSha] }),
  });

  await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, s.token, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha }),
  });

  return newCommit.sha as string;
}
