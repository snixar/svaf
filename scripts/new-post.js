#!/usr/bin/env node
/**
 * Create a new blog post skeleton.
 * Usage: node scripts/new-post.js "文章标题" [--dir 技术] [--slug my-slug]
 */

import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsDir = join(__dirname, '..', 'src', 'content', 'posts');

// Parse args
const args = process.argv.slice(2);
let title = '';
let dir = '';
let slug = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i + 1]) {
    dir = args[++i];
  } else if (args[i] === '--slug' && args[i + 1]) {
    slug = args[++i];
  } else if (!title) {
    title = args[i];
  }
}

if (!title) {
  console.log('Usage: node scripts/new-post.js "文章标题" [--dir 分类] [--slug 自定义slug]');
  console.log('Example: node scripts/new-post.js "我的新文章" --dir 技术 --slug my-post');
  process.exit(1);
}

// Generate slug
if (!slug) {
  slug = title
    .toLowerCase()
    .replace(/[\s　]+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Create post directory
const postDir = join(postsDir, slug);
mkdirSync(postDir, { recursive: true });

// Frontmatter fields
const today = new Date().toISOString().split('T')[0];
const frontmatter = [
  '---',
  `title: "${title}"`,
  `description: ""`,
  `published: ${today}`,
  dir ? `dir: "${dir}"` : 'dir: "未分类"',
  'pinned: false',
  '---',
  '',
  `## ${title}`,
  '',
  '在这里写文章内容...',
  '',
].join('\n');

// Write index.md
const indexPath = join(postDir, 'index.md');
writeFileSync(indexPath, frontmatter, 'utf-8');

console.log(`Created: ${postDir}/`);
console.log(`  └── index.md`);
console.log(`Title: ${title}`);
console.log(`Slug:  ${slug}`);
console.log(`Dir:   ${dir || '未分类'}`);
if (dir) {
  console.log(`\nTip: 首页会按目录分组，dir="${dir}" 的文章归入同一张卡片。`);
}
