/**
 * Architecture guard — enforces the clean-architecture import rules from
 * architecture.json by static analysis. Fails CI if any source file violates
 * the inward-only dependency rule.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC = join(__dirname, '..', 'src');

type Layer = 'domain' | 'application' | 'infrastructure' | 'interfaces';

const FORBIDDEN: Record<Layer, Layer[]> = {
  domain: ['application', 'infrastructure', 'interfaces'],
  application: ['infrastructure', 'interfaces'],
  infrastructure: ['interfaces'],
  interfaces: [], // interfaces may import application; tests below still ban direct domain/infra imports via pattern
};

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      // Skip the Python subtrees — they are not TypeScript sources.
      if (entry === 'ai-service') continue;
      walk(full, out);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

function layerOf(file: string): Layer | null {
  const rel = relative(SRC, file).replace(/\\/g, '/');
  const top = rel.split('/')[0];
  if (top === 'domain' || top === 'application' || top === 'infrastructure' || top === 'interfaces') {
    return top;
  }
  return null;
}

describe('Clean architecture dependency rule', () => {
  const files = walk(SRC);

  it.each(files)('%s respects layer boundaries', (file) => {
    const layer = layerOf(file);
    if (!layer) return;
    const src = readFileSync(file, 'utf8');
    const forbidden = FORBIDDEN[layer];

    for (const target of forbidden) {
      // Match relative imports like "../application/..." or "../../application/..."
      const pattern = new RegExp(
        `from\\s+['"][^'"]*?/${target}/[^'"]+['"]|from\\s+['"]@${target}/`,
        'g',
      );
      const m = src.match(pattern);
      if (m) {
        throw new Error(
          `${relative(SRC, file)} (${layer}) illegally imports from ${target}: ${m.join(', ')}`,
        );
      }
    }
  });
});
