import { Block, BlockType } from '../types/markdown.types';

export class BlockParser {

  parse(markdown: string): Block[] {
    const lines  = markdown.split('\n');
    const blocks: Block[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // ─── Ligne vide ───────────────────────────────────
      if (line.trim() === '') {
        i++;
        continue;
      }

      // ─── Code block ───────────────────────────────────
      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;

        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }

        blocks.push({
          type: BlockType.CODE_BLOCK,
          content: codeLines.join('\n'),
          language: language || 'plaintext',
        });
        i++;
        continue;
      }

      // ─── Tableau ──────────────────────────────────────
      if (line.includes('|') && lines[i + 1]?.includes('---')) {
        const tableBlock = this.parseTable(lines, i);
        blocks.push(tableBlock.block);
        i = tableBlock.nextIndex;
        continue;
      }

      // ─── Titre ────────────────────────────────────────
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        blocks.push({
          type: BlockType.HEADING,
          content: headingMatch[2],
          level: headingMatch[1].length,
        });
        i++;
        continue;
      }

      // ─── Séparateur horizontal ────────────────────────
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        blocks.push({ type: BlockType.HORIZONTAL_RULE, content: '' });
        i++;
        continue;
      }

      // ─── Citation ─────────────────────────────────────
      if (line.startsWith('>')) {
        const quoteLines: string[] = [];

        while (i < lines.length && lines[i].startsWith('>')) {
          quoteLines.push(lines[i].slice(1).trim());
          i++;
        }

        blocks.push({
          type: BlockType.BLOCKQUOTE,
          content: quoteLines.join('\n'),
        });
        continue;
      }

      // ─── Liste non ordonnée ───────────────────────────
      if (/^[-*+]\s/.test(line)) {
        const listLines: string[] = [];

        while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
          listLines.push(lines[i].replace(/^[-*+]\s/, ''));
          i++;
        }

        blocks.push({
          type: BlockType.UNORDERED_LIST,
          content: listLines.join('\n'),
        });
        continue;
      }

      // ─── Liste ordonnée ───────────────────────────────
      if (/^\d+\.\s/.test(line)) {
        const listLines: string[] = [];

        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          listLines.push(lines[i].replace(/^\d+\.\s/, ''));
          i++;
        }

        blocks.push({
          type: BlockType.ORDERED_LIST,
          content: listLines.join('\n'),
        });
        continue;
      }

      // ─── Paragraphe ───────────────────────────────────
      const paraLines: string[] = [];

      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].startsWith('#') &&
        !lines[i].startsWith('>') &&
        !lines[i].startsWith('```') &&
        !/^[-*+]\s/.test(lines[i]) &&
        !/^\d+\.\s/.test(lines[i])
      ) {
        paraLines.push(lines[i]);
        i++;
      }

      if (paraLines.length > 0) {
        blocks.push({
          type: BlockType.PARAGRAPH,
          content: paraLines.join(' '),
        });
      }
    }

    return blocks;
  }

  // Parse un tableau Markdown
  private parseTable(
    lines: string[],
    startIndex: number
  ): { block: Block; nextIndex: number } {
    const headers = lines[startIndex]
      .split('|')
      .map((h) => h.trim())
      .filter((h) => h !== '');

    let i = startIndex + 2; // skip header + separator
    const rows: string[][] = [];

    while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
      const row = lines[i]
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell !== '');
      rows.push(row);
      i++;
    }

    return {
      block: { type: BlockType.TABLE, content: '', headers, rows },
      nextIndex: i,
    };
  }
}