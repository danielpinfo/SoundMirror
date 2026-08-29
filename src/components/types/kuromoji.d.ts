export interface KuromojiToken {
  surface_form?: string;
  reading?: string;
  pronunciation?: string;
  pos?: string;
  word_type?: string;
}

export interface KuromojiTokenizer {
  tokenize(text: string): KuromojiToken[];
}

export interface KuromojiBuilder {
  build(
    callback: (error: Error | null, tokenizer: KuromojiTokenizer) => void
  ): void;
}

declare const kuromoji: {
  builder(options: { dicPath: string }): KuromojiBuilder;
};

export default kuromoji;
