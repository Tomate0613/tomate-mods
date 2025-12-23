import fs from 'node:fs';
import crypto from 'node:crypto';

export function checkFile(filePath: string, hash: string) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const file = fs.readFileSync(filePath);
  const calculatedHash = crypto.createHash('sha1').update(file).digest('hex');

  if (calculatedHash !== hash) {
    console.warn(filePath, 'was downloaded incorrectly');
  }

  return calculatedHash === hash;
}
