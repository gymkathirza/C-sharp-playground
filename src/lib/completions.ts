import { CompletionContext, type Completion, type CompletionResult } from "@codemirror/autocomplete";

const KEYWORDS: Completion[] = [
  "abstract", "as", "async", "await", "base", "bool", "break", "byte", "case", "catch",
  "char", "checked", "class", "const", "continue", "decimal", "default", "delegate", "do",
  "double", "else", "enum", "event", "explicit", "extern", "false", "finally", "fixed",
  "float", "for", "foreach", "goto", "if", "implicit", "in", "int", "interface", "internal",
  "is", "lock", "long", "namespace", "new", "null", "object", "operator", "out", "override",
  "params", "private", "protected", "public", "readonly", "record", "ref", "return", "sbyte",
  "sealed", "short", "sizeof", "stackalloc", "static", "string", "struct", "switch", "this",
  "throw", "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort", "using",
  "virtual", "void", "volatile", "while", "var", "yield",
].map((label) => ({ label, type: "keyword" }));

const APIS: Completion[] = [
  { label: "Console", type: "class", info: "System.Console" },
  { label: "WriteLine", type: "function", info: "Console.WriteLine" },
  { label: "Write", type: "function", info: "Console.Write" },
  { label: "ReadLine", type: "function", info: "Console.ReadLine" },
  { label: "String", type: "class" },
  { label: "List", type: "class", info: "System.Collections.Generic.List<T>" },
  { label: "Dictionary", type: "class" },
  { label: "IEnumerable", type: "class" },
  { label: "Enumerable", type: "class", info: "System.Linq.Enumerable" },
  { label: "Where", type: "function" },
  { label: "Select", type: "function" },
  { label: "OrderBy", type: "function" },
  { label: "First", type: "function" },
  { label: "ToList", type: "function" },
  { label: "ToArray", type: "function" },
  { label: "Sum", type: "function" },
  { label: "Count", type: "function" },
  { label: "Convert", type: "class" },
  { label: "Math", type: "class" },
  { label: "DateTime", type: "class" },
  { label: "TimeSpan", type: "class" },
  { label: "Guid", type: "class" },
  { label: "Exception", type: "class" },
  { label: "ArgumentException", type: "class" },
  { label: "StringBuilder", type: "class" },
  { label: "Task", type: "class" },
];

const IDENT = /\b[A-Z][A-Za-z0-9_]{2,}\b/g;

export function harvestIdentifiers(files: Record<string, string>): Completion[] {
  const seen = new Set<string>();
  const out: Completion[] = [];
  for (const source of Object.values(files)) {
    for (const match of source.matchAll(IDENT)) {
      const label = match[0];
      if (seen.has(label)) continue;
      seen.add(label);
      out.push({ label, type: "variable" });
    }
  }
  return out;
}

export function csharpCompletions(files: Record<string, string>) {
  const extras = harvestIdentifiers(files);
  const options = [...KEYWORDS, ...APIS, ...extras];
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return { from: word.from, options, validFor: /^[A-Za-z_][A-Za-z0-9_]*$/ };
  };
}
