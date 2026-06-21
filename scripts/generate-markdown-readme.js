import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import nunjucks from "nunjucks";

const ROOT = join(import.meta.dirname, "..");
const PERSONAL_FILE = join(ROOT, "data", "personal.yaml");
const RESUME_FILE = join(ROOT, "data", "resume.yaml");
const COMMON_FILE = join(ROOT, "data", "common.yaml");
const TEMPLATES_DIR = join(ROOT, "templates");

const MONTHS = {
  pt: {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
    "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
    "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
  },
  en: {
    "01": "January", "02": "February", "03": "March", "04": "April",
    "05": "May", "06": "June", "07": "July", "08": "August",
    "09": "September", "10": "October", "11": "November", "12": "December",
  },
};

function get(field, lang) {
  if (field == null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field[lang] !== undefined) return field[lang];
  return "";
}

function formatPhone(phone, lang) {
  const digits = phone.replace(/\+/g, "");
  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const number = digits.slice(4);
  const formatted = `(${area}) ${number.slice(0, 1)} ${number.slice(1, 5)}-${number.slice(5)}`;
  return lang === "en" ? `+${country} ${formatted}` : formatted;
}

function formatDate(dateStr, lang) {
  if (!dateStr || dateStr === "present") {
    if (dateStr === "present") return lang === "pt" ? "Presente" : "Present";
    return "";
  }
  const [year, month] = dateStr.split("-");
  const monthName = MONTHS[lang]?.[month] || month;
  return `${monthName} ${year}`;
}

function loadData() {
  const personal = YAML.parse(readFileSync(PERSONAL_FILE, "utf8"));
  const resume = YAML.parse(readFileSync(RESUME_FILE, "utf8"));
  const common = YAML.parse(readFileSync(COMMON_FILE, "utf8"));
  return { personal, resume, common };
}

function createEnv() {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(TEMPLATES_DIR), {
    autoescape: false,
  });

  env.addFilter("field", function (field, lang) {
    return get(field, lang);
  });

  env.addFilter("phone", function (phone, lang) {
    return formatPhone(phone, lang);
  });

  env.addFilter("formatDate", function (dateStr, lang) {
    return formatDate(dateStr, lang);
  });

  env.addFilter("skillDetails", function (details, lang) {
    if (details == null) return "";
    if (typeof details === "string") return details;
    if (typeof details === "object") return details[lang] || "";
    return "";
  });

  env.addFilter("split", function (str, separator) {
    if (typeof str !== "string") return [];
    return str.split(separator);
  });

  env.addFilter("replace", function (str, search, replacement) {
    if (typeof str !== "string") return "";
    return str.split(search).join(replacement);
  });

  return env;
}

function normalizeMarkdown(text) {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n*$/, "\n");
}

function main() {
  const { personal, resume, common } = loadData();
  const env = createEnv();
  const data = { personal, resume };

  const outputs = [
    { template: "readme.njk", file: "README.md" },
    { template: "readme-en.njk", file: "README-EN.md" },
  ];

  for (const { template, file } of outputs) {
    const rendered = env.render(template, { data, common });
    const normalized = normalizeMarkdown(rendered);
    const outPath = join(ROOT, file);
    writeFileSync(outPath, normalized, "utf8");
    console.log(`  -> ${file}`);
  }

  console.log("\nDone!");
}

main();
