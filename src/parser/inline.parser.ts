import { InlineRule } from '../types/markdown.types';

export class InlineParser {
  private rules: InlineRule[] = [
    // Code inline — doit passer AVANT gras/italique
    {
      name: 'code',
      pattern: /`([^`]+)`/g,
      replacement: '<code>$1</code>',
    },
    // Gras + italique
    {
      name: 'bold-italic',
      pattern: /\*\*\*(.+?)\*\*\*/g,
      replacement: '<strong><em>$1</em></strong>',
    },
    // Gras
    {
      name: 'bold',
      pattern: /\*\*(.+?)\*\*/g,
      replacement: '<strong>$1</strong>',
    },
    // Italique
    {
      name: 'italic',
      pattern: /\*(.+?)\*/g,
      replacement: '<em>$1</em>',
    },
    // Barré
    {
      name: 'strikethrough',
      pattern: /~~(.+?)~~/g,
      replacement: '<del>$1</del>',
    },
    // Lien avec titre
    {
      name: 'link-with-title',
      pattern: /\[([^\]]+)\]\(([^)]+)\s"([^"]+)"\)/g,
      replacement: '<a href="$2" title="$3">$1</a>',
    },
    // Lien simple
    {
      name: 'link',
      pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
      replacement: '<a href="$2" target="_blank" rel="noopener">$1</a>',
    },
    // Image
    {
      name: 'image',
      pattern: /!\[([^\]]*)\]\(([^)]+)\)/g,
      replacement: '<img src="$2" alt="$1" />',
    },
  ];

  parse(text: string): string {
    let result = this.escapeHtml(text);

    for (const rule of this.rules) {
      if (typeof rule.replacement === 'string') {
        result = result.replace(rule.pattern, rule.replacement);
      } else {
        result = result.replace(rule.pattern, rule.replacement);
      }
    }

    return result;
  }

  // Échappe les caractères HTML dangereux
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}