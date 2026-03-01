// Types de blocs Markdown
export enum BlockType {
  HEADING       = 'heading',
  PARAGRAPH     = 'paragraph',
  UNORDERED_LIST = 'unordered_list',
  ORDERED_LIST  = 'ordered_list',
  BLOCKQUOTE    = 'blockquote',
  CODE_BLOCK    = 'code_block',
  HORIZONTAL_RULE = 'horizontal_rule',
  TABLE         = 'table',
  EMPTY         = 'empty',
}

// Un bloc parsé
export interface Block {
  type: BlockType;
  content: string;
  level?: number;       // pour les headings (1-6)
  language?: string;    // pour les code blocks
  rows?: string[][];    // pour les tableaux
  headers?: string[];   // pour les tableaux
}

// Options de conversion
export interface ConvertOptions {
  includeStyles: boolean;    // inclure le CSS inline
  theme: 'light' | 'dark';  // thème du HTML généré
  title?: string;            // titre de la page HTML
  addTableOfContents: boolean;
}

// Résultat de la conversion
export interface ConvertResult {
  html: string;
  stats: ConvertStats;
}

// Statistiques de conversion
export interface ConvertStats {
  blocks: number;
  headings: number;
  paragraphs: number;
  codeBlocks: number;
  tables: number;
  lists: number;
  inputSize: number;   // bytes
  outputSize: number;  // bytes
}

// Une règle inline (regex + remplacement)
export interface InlineRule {
  name: string;
  pattern: RegExp;
  replacement: string | ((...args: string[]) => string);
}