export function needsQuoting(value: string) {
  return (
    value === '' || // empty string
    /^[#:>|-]/.test(value) || // starts with special char
    /^['"{}[\],&*#?|<>=!%@`]/.test(value) || // starts with indicator chars
    /^[\s]|[\s]$/.test(value) || // has leading/trailing whitespace
    /^[\d.+-]/.test(value) || // looks like a number/bool/null
    /[\n"'\\\s]/.test(value) || // contains newlines, quotes, backslash, or spaces
    /^(true|false|yes|no|null|on|off)$/i.test(value) // is a YAML keyword
  );
}

export function formatYamlKey(key: string) {
  return /[@/_.]/.test(key) ? `"${key}"` : key;
}

export function formatYamlValue(value: string, indent: number) {
  if (value.includes('\n')) {
    const indentedValue = value
      .split('\n')
      .map((line) => `${' '.repeat(indent)}${line}`)
      .join('\n');

    // Return the block indicator on the same line as the content
    return `|${indentedValue ? '\n' + indentedValue : ''}`;
  }

  if (needsQuoting(value)) {
    if (value.includes("'") && !value.includes('"')) {
      return `"${value.replace(/["\\]/g, '\\$&')}"`;
    }

    return `'${value.replace(/'/g, "''")}'`;
  }

  return value;
}

export function toYaml(obj: unknown, indent = 0): string {
  const spaces = ' '.repeat(indent);

  if (obj == null) return '';

  if (Array.isArray(obj)) {
    return obj.map((item) => `${spaces}- ${toYaml(item, indent + 2).trimStart()}`).join('\n');
  }

  if (typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([, v]) => v != null)
      .map(([key, value]) => {
        const formattedKey = formatYamlKey(key);
        const formattedValue = toYaml(value, indent + 2);

        if (Array.isArray(value)) {
          return `${spaces}${formattedKey}:\n${formattedValue}`;
        }

        if (typeof value === 'object' && value !== null) {
          return `${spaces}${formattedKey}:\n${formattedValue}`;
        }

        if (typeof value === 'string' && value.includes('\n')) {
          return `${spaces}${formattedKey}: ${formattedValue}`;
        }

        return `${spaces}${formattedKey}: ${formattedValue}`;
      })
      .join('\n');
  }

  return typeof obj === 'string' ? formatYamlValue(obj, indent) : String(obj);
}
