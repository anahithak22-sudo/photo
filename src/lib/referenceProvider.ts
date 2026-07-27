export interface ReferenceProvider {
  getReferences(query: string): Promise<string[] | null>;
}

export class TextOnlyProvider implements ReferenceProvider {
  async getReferences(_query: string): Promise<string[] | null> {
    return null;
  }
}

export const referenceProvider: ReferenceProvider = new TextOnlyProvider();
