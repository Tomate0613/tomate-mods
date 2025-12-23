import fs from "node:fs";
import path from "node:path";

const examplesDirectory = path.join("examples");
const templatePath = path.join(examplesDirectory, "README.template.md");
const outputPath = "README.md";

let template = fs.readFileSync(templatePath, "utf-8");

template = template.replace(/{{\s*(.+?)\s*}}/g, (_, filePath) => {
  const fullPath = path.resolve(examplesDirectory, `${filePath}.ts`);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    return `\`\`\`ts\n// ERROR: File not found: ${filePath}.ts\n\`\`\``;
  }

  let code = fs.readFileSync(fullPath, "utf-8");

  code = code.replace(/^\s*import\s+\{.*}\s+from\s+['"]setup['"];?\s*$/gm, "");
  code = code.replace(
    /^\s*import\s+\{.*}\s+from\s+['"]\.\/stub['"];?\s*$/gm,
    "",
  );

  code = code.replace(/^\s*\n+/g, "");

  return `\`\`\`ts\n${code.trim()}\n\`\`\``;
});

fs.writeFileSync(outputPath, template, "utf-8");
console.log("README.md generated");
