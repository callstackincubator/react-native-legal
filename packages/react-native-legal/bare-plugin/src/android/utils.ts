import fs from 'node:fs';

import xml2js from 'xml2js';

/**
 * Used to modify a file at a specified file path
 *
 * It provides the file content as a utf-8 string inside a callback parameter.
 * The modified result should be returned from a callback parameter as a utf-8 string
 */
export function modifyFileContent(filepath: string, transformFile: (fileContent: string) => string) {
  const content = fs.readFileSync(filepath, { encoding: 'utf-8' });
  const modifiedContent = transformFile(content);

  fs.writeFileSync(filepath, modifiedContent);
}

/**
 * Used to modify a XML file at a specified file path
 *
 * It provides XML content parsed to a JS object inside a callback parameter
 * The modified result should be a JS object returned from a callback parameter
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function modifyXMLFileContent(filepath: string, transformXMLFile: (xmlObj: any) => any) {
  const content = fs.readFileSync(filepath, { encoding: 'utf-8' });
  const parser = new xml2js.Parser();
  const obj = await parser.parseStringPromise(content);
  const modifiedObj = transformXMLFile(obj);
  const builder = new xml2js.Builder({ headless: true });
  const modifiedContent = builder.buildObject(modifiedObj);

  fs.writeFileSync(filepath, modifiedContent);
}
