import robot from 'robotjs';

export class Keyboard {
  private prefixes: string[];
  private suffixes: string[];
  private replacements: Record<string, string>;

  constructor(
    prefixes: string[],
    suffixes: string[],
    replacements: Record<string, string>,
  ) {
    this.prefixes = prefixes;
    this.suffixes = suffixes;
    this.replacements = replacements;
  }

  private executeSequence(sequence: string[]) {
    for (const item of sequence) {
      if (item.startsWith('key:')) {
        try {
          const keyName = item.replace('key:', '').trim();
          robot.keyTap(keyName);
        } catch (error) {
          console.error(error);
        }
      } else {
        robot.typeString(item);
      }
    }
  }

  private applyReplacements(data: string): string {
    let processedData = data;

    for (const [search, replaceWith] of Object.entries(this.replacements)) {
      processedData = processedData.replaceAll(search, replaceWith);
    }

    return processedData;
  }

  type(data: string) {
    this.executeSequence(this.prefixes);

    const cleanData = this.applyReplacements(data);
    robot.typeString(cleanData);

    this.executeSequence(this.suffixes);
  }
}
