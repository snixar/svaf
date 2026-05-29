/**
 * GitHub REST API client for content management.
 * All calls go directly from the browser to api.github.com.
 */

const API_BASE = 'https://api.github.com';

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface RepoFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface TreeEntry {
  path: string;
  mode: '100644' | '100755' | '040000' | '160000' | '120000';
  type: 'blob' | 'tree' | 'commit';
  sha?: string | null;
  content?: string;
}

export interface GitRef {
  ref: string;
  node_id: string;
  url: string;
  object: { sha: string; type: string; url: string };
}

export interface GitCommit {
  sha: string;
  message: string;
  tree: { sha: string };
  parents: { sha: string }[];
}

function getConfig(): GitHubConfig {
  const owner = import.meta.env.PUBLIC_GITHUB_OWNER || '';
  const repo = import.meta.env.PUBLIC_GITHUB_REPO || '';
  const branch = import.meta.env.PUBLIC_GITHUB_BRANCH || 'main';
  const token = sessionStorage.getItem('github-token') || '';
  if (!owner || !repo) {
    throw new Error('Missing GitHub config: PUBLIC_GITHUB_OWNER and PUBLIC_GITHUB_REPO must be set in .env');
  }
  if (!token) {
    throw new Error('Missing GitHub token: please enter your token on the /write page');
  }
  return { owner, repo, branch, token };
}

function headers(cfg: GitHubConfig): HeadersInit {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = getConfig();
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(cfg), ...(init?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.text();
    let msg = `GitHub API error ${res.status}: ${res.statusText}`;
    try {
      const json = JSON.parse(body);
      msg = json.message || msg;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Repository contents API ──

/** List files in a repo directory */
export async function listRepoFiles(path: string): Promise<RepoFile[]> {
  const cfg = getConfig();
  return apiFetch<RepoFile[]>(
    `/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`
  );
}

/** Get a single file from the repo */
export async function getFileContent(path: string): Promise<RepoFile> {
  const cfg = getConfig();
  return apiFetch<RepoFile>(
    `/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`
  );
}

/** Decode base64 content from a repo file (properly handles UTF-8 / Chinese) */
export function decodeContent(file: RepoFile): string {
  if (!file.content) return '';
  try {
    const binary = atob(file.content.replace(/\n/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

/** Search for files matching a slug in the posts directory */
export async function findPostBySlug(slug: string): Promise<RepoFile | null> {
  try {
    const files = await listRepoFiles('src/content/posts');
    const dir = files.find(
      f => f.type === 'dir' && f.name.toLowerCase() === slug.toLowerCase()
    );
    if (dir) {
      try {
        return await getFileContent(`src/content/posts/${dir.name}/index.md`);
      } catch {
        // Try .mdx
        try {
          return await getFileContent(`src/content/posts/${dir.name}/index.mdx`);
        } catch {
          return null;
        }
      }
    }
    // Try direct .md file match (flat structure)
    const file = files.find(
      f => f.type === 'file' &&
        f.name.toLowerCase().replace(/\.(md|mdx)$/, '') === slug.toLowerCase()
    );
    if (file) return await getFileContent(file.path);
    return null;
  } catch {
    return null;
  }
}

/** List all post slugs in the repo */
export async function listPostSlugs(): Promise<Array<{ slug: string; dir: string }>> {
  try {
    const files = await listRepoFiles('src/content/posts');
    return files
      .filter(f => f.type === 'dir')
      .map(f => ({ slug: f.name, dir: f.name }));
  } catch {
    return [];
  }
}

/** Create or update a file in the repo */
export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string,
  sha?: string | null,
): Promise<{ sha: string }> {
  const cfg = getConfig();
  const body: Record<string, unknown> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;
  return apiFetch(`/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** Delete a file from the repo */
export async function deleteFile(
  path: string,
  sha: string,
  message: string,
): Promise<void> {
  const cfg = getConfig();
  await apiFetch(`/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: cfg.branch }),
  });
}

// ── Git Data API (for batch operations) ──

export async function getRef(branch: string): Promise<GitRef> {
  const cfg = getConfig();
  return apiFetch<GitRef>(
    `/repos/${cfg.owner}/${cfg.repo}/git/ref/heads/${branch}`
  );
}

export async function createBlob(content: string): Promise<{ sha: string }> {
  const cfg = getConfig();
  return apiFetch(`/repos/${cfg.owner}/${cfg.repo}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({
      content: btoa(unescape(encodeURIComponent(content))),
      encoding: 'base64',
    }),
  });
}

export async function createTree(
  baseTreeSha: string,
  entries: TreeEntry[],
): Promise<{ sha: string }> {
  const cfg = getConfig();
  return apiFetch(`/repos/${cfg.owner}/${cfg.repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: entries }),
  });
}

export async function createCommit(
  message: string,
  treeSha: string,
  parentShas: string[],
): Promise<GitCommit> {
  const cfg = getConfig();
  return apiFetch<GitCommit>(`/repos/${cfg.owner}/${cfg.repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: treeSha, parents: parentShas }),
  });
}

export async function updateRef(ref: string, sha: string): Promise<void> {
  const cfg = getConfig();
  await apiFetch(`/repos/${cfg.owner}/${cfg.repo}/git/refs/${ref}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha, force: false }),
  });
}
