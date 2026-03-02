import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const question = (prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));

export const closePrompt = (): void => rl.close();