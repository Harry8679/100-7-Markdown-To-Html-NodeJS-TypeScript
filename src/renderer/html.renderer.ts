import { Block, BlockType, ConvertOptions, ConvertResult, ConvertStats } from '../types/markdown.types';
import { InlineParser } from '../parser/inline.parser';

export class HtmlRenderer {
  private inline: InlineParser;

  constructor() {
    this.inline = new InlineParser();
  }

  render(blocks: Block[], options: ConvertOptions): ConvertResult {
    const stats: ConvertStats = {
      blocks: blocks.length,
      headings: 0,
      paragraphs: 0,
      codeBlocks: 0,
      tables: 0,
      lists: 0,
      inputSize: 0,
      outputSize: 0,
    };

    // Génère la table des matières
    let toc = '';
    if (options.addTableOfContents) {
      toc = this.buildToc(blocks);
    }

    // Génère le body HTML
    const bodyParts: string[] = [];

    for (const block of blocks) {
      const html = this.renderBlock(block, stats);
      if (html) bodyParts.push(html);
    }

    const body = [toc, ...bodyParts].join('\n');
    const html = this.wrapInPage(body, options);

    stats.outputSize = Buffer.byteLength(html, 'utf-8');

    return { html, stats };
  }

  // Rend un bloc individuel
  private renderBlock(block: Block, stats: ConvertStats): string {
    switch (block.type) {

      case BlockType.HEADING: {
        stats.headings++;
        const level = block.level ?? 1;
        const id    = block.content.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const text  = this.inline.parse(block.content);
        return `<h${level} id="${id}">${text}</h${level}>`;
      }

      case BlockType.PARAGRAPH: {
        stats.paragraphs++;
        return `<p>${this.inline.parse(block.content)}</p>`;
      }

      case BlockType.UNORDERED_LIST: {
        stats.lists++;
        const items = block.content
          .split('\n')
          .map((item) => `  <li>${this.inline.parse(item)}</li>`)
          .join('\n');
        return `<ul>\n${items}\n</ul>`;
      }

      case BlockType.ORDERED_LIST: {
        stats.lists++;
        const items = block.content
          .split('\n')
          .map((item) => `  <li>${this.inline.parse(item)}</li>`)
          .join('\n');
        return `<ol>\n${items}\n</ol>`;
      }

      case BlockType.BLOCKQUOTE: {
        const lines = block.content
          .split('\n')
          .map((line) => this.inline.parse(line))
          .join('<br>');
        return `<blockquote>${lines}</blockquote>`;
      }

      case BlockType.CODE_BLOCK: {
        stats.codeBlocks++;
        const escaped = block.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<pre><code class="language-${block.language}">${escaped}</code></pre>`;
      }

      case BlockType.HORIZONTAL_RULE:
        return '<hr>';

      case BlockType.TABLE: {
        stats.tables++;
        return this.renderTable(block);
      }

      default:
        return '';
    }
  }

  // Rend un tableau HTML
  private renderTable(block: Block): string {
    const headers = (block.headers ?? [])
      .map((h) => `    <th>${this.inline.parse(h)}</th>`)
      .join('\n');

    const rows = (block.rows ?? [])
      .map((row) => {
        const cells = row
          .map((cell) => `      <td>${this.inline.parse(cell)}</td>`)
          .join('\n');
        return `    <tr>\n${cells}\n    </tr>`;
      })
      .join('\n');

    return `<table>\n  <thead>\n    <tr>\n${headers}\n    </tr>\n  </thead>\n  <tbody>\n${rows}\n  </tbody>\n</table>`;
  }

  // Génère la table des matières
  private buildToc(blocks: Block[]): string {
    const headings = blocks.filter((b) => b.type === BlockType.HEADING && (b.level ?? 1) <= 3);

    if (headings.length === 0) return '';

    const items = headings
      .map((h) => {
        const id     = h.content.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const indent = '  '.repeat((h.level ?? 1) - 1);
        return `${indent}<li><a href="#${id}">${h.content}</a></li>`;
      })
      .join('\n');

    return `<nav class="toc">\n<h2>Table des matières</h2>\n<ul>\n${items}\n</ul>\n</nav>`;
  }

  // Enveloppe le contenu dans une page HTML complète
  private wrapInPage(body: string, options: ConvertOptions): string {
    const title = options.title ?? 'Document';
    const styles = options.includeStyles ? this.getStyles(options.theme) : '';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${styles}
</head>
<body>
  <div class="container">
${body}
  </div>
</body>
</html>`;
  }

  // CSS intégré selon le thème
  private getStyles(theme: 'light' | 'dark'): string {
    const isDark = theme === 'dark';
    const bg     = isDark ? '#1e1e1e' : '#ffffff';
    const text   = isDark ? '#d4d4d4' : '#333333';
    const code   = isDark ? '#2d2d2d' : '#f5f5f5';
    const border = isDark ? '#444444' : '#dddddd';
    const quote  = isDark ? '#2a2a2a' : '#f9f9f9';
    const link   = isDark ? '#569cd6' : '#0066cc';

    return `<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: ${bg}; color: ${text}; line-height: 1.6; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; }
    h1, h2, h3, h4, h5, h6 { margin: 1.5rem 0 0.75rem; font-weight: 600; }
    h1 { font-size: 2rem; border-bottom: 2px solid ${border}; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; border-bottom: 1px solid ${border}; padding-bottom: 0.3rem; }
    p { margin: 0.75rem 0; }
    a { color: ${link}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: ${code}; padding: 0.2em 0.4em; border-radius: 3px;
           font-family: 'Courier New', monospace; font-size: 0.9em; }
    pre { background: ${code}; padding: 1rem; border-radius: 6px;
          overflow-x: auto; margin: 1rem 0; border: 1px solid ${border}; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid ${link}; padding: 0.5rem 1rem;
                 background: ${quote}; margin: 1rem 0; border-radius: 0 4px 4px 0; }
    ul, ol { padding-left: 1.5rem; margin: 0.75rem 0; }
    li { margin: 0.25rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid ${border}; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: ${code}; font-weight: 600; }
    tr:nth-child(even) { background: ${quote}; }
    hr { border: none; border-top: 2px solid ${border}; margin: 1.5rem 0; }
    .toc { background: ${quote}; padding: 1rem 1.5rem;
           border-radius: 6px; margin-bottom: 2rem; border: 1px solid ${border}; }
    .toc h2 { margin-top: 0; font-size: 1rem; }
    .toc ul { margin: 0.5rem 0 0; }
    img { max-width: 100%; border-radius: 4px; }
  </style>`;
  }
}