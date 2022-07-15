import type {
  CatchallKeyParsed,
  DeclarationParsed,
  LiteralParsed,
  MessageParsed,
  NmtokenParsed,
  PatternParsed,
  PatternMessageParsed,
  PlaceholderParsed,
  SelectMessageParsed,
  TextParsed,
  ParseError,
  VariantParsed
} from './data-model.js';
import { parseDeclarations } from './declarations.js';
import { parseNmtoken } from './names.js';
import { parsePlaceholder } from './placeholder.js';
import { whitespaces } from './util.js';
import { parseLiteral, parseText } from './values.js';

// Message ::= Declaration* ( Pattern | Selector Variant+ )
// Selector ::= 'match' ( '{' Expression '}' )+
export function parseMessage(src: string): MessageParsed {
  const errors: ParseError[] = [];
  const { declarations, end: pos } = parseDeclarations(src, errors);

  if (src.startsWith('match', pos)) {
    return parseSelectMessage(src, pos, declarations, errors);
  } else if (src[pos] === '{') {
    return parsePatternMessage(src, pos, declarations, errors);
  } else {
    errors.push({ type: 'parse-error', start: pos, end: src.length });
    return { type: 'junk', declarations, errors, source: src };
  }
}

function parsePatternMessage(
  src: string,
  start: number,
  declarations: DeclarationParsed[],
  errors: ParseError[]
): PatternMessageParsed {
  const pattern = parsePattern(src, start, errors);
  let pos = pattern.end;
  pos += whitespaces(src, pos);

  if (pos < src.length) {
    errors.push({ type: 'extra-content', start: pos, end: src.length });
  }

  return { type: 'message', declarations, pattern, errors };
}

function parseSelectMessage(
  src: string,
  start: number,
  declarations: DeclarationParsed[],
  errors: ParseError[]
): SelectMessageParsed {
  let pos = start + 5; // 'match'
  pos += whitespaces(src, pos);

  const selectors: PlaceholderParsed[] = [];
  while (src[pos] === '{') {
    const ph = parsePlaceholder(src, pos, errors);
    switch (ph.body.type) {
      case 'expression':
      case 'literal':
      case 'variable':
        break;
      default: {
        const { start, end } = ph.body;
        errors.push({ type: 'bad-selector', start, end });
      }
    }
    selectors.push(ph);
    pos = ph.end;
    pos += whitespaces(src, pos);
  }
  if (selectors.length === 0) {
    errors.push({ type: 'empty-token', start: pos });
  }

  const variants: VariantParsed[] = [];
  pos += whitespaces(src, pos);
  while (src.startsWith('when', pos)) {
    const variant = parseVariant(src, pos, selectors.length, errors);
    variants.push(variant);
    pos = variant.end;
    pos += whitespaces(src, pos);
  }

  if (pos < src.length) {
    errors.push({ type: 'extra-content', start: pos, end: src.length });
  }

  return { type: 'select', declarations, selectors, variants, errors };
}

// Variant ::= 'when' ( WhiteSpace VariantKey )+ Pattern
// VariantKey ::= Literal | Nmtoken | '*'
function parseVariant(
  src: string,
  start: number,
  selCount: number,
  errors: ParseError[]
): VariantParsed {
  let pos = start + 4; // 'when'
  const keys: Array<LiteralParsed | NmtokenParsed | CatchallKeyParsed> = [];
  while (pos < src.length) {
    const ws = whitespaces(src, pos);
    pos += ws;
    const ch = src[pos];
    if (ch === '{') break;

    if (ws === 0) {
      errors.push({ type: 'missing-char', char: ' ', start: pos });
    }

    let key: CatchallKeyParsed | LiteralParsed | NmtokenParsed;
    switch (ch) {
      case '*':
        key = { type: '*', start: pos, end: pos + 1 };
        break;
      case '(':
        key = parseLiteral(src, pos, errors);
        break;
      default:
        key = parseNmtoken(src, pos, errors);
    }
    if (key.end === pos) break; // error; reported in pattern.errors
    keys.push(key);
    pos = key.end;
  }

  if (selCount > 0 && keys.length !== selCount) {
    const end = keys.length === 0 ? pos : keys[keys.length - 1].end;
    errors.push({ type: 'key-mismatch', start, end });
  }

  const value = parsePattern(src, pos, errors);
  return { start, end: value.end, keys, value };
}

// Pattern ::= '{' (Text | Placeholder)* '}' /* ws: explicit */
function parsePattern(
  src: string,
  start: number,
  errors: ParseError[]
): PatternParsed {
  if (src[start] !== '{') {
    errors.push({ type: 'missing-char', char: '{', start });
    return { start, end: start, body: [] };
  }

  let pos = start + 1;
  const body: Array<TextParsed | PlaceholderParsed> = [];
  loop: while (pos < src.length) {
    switch (src[pos]) {
      case '{': {
        const ph = parsePlaceholder(src, pos, errors);
        body.push(ph);
        pos = ph.end;
        break;
      }
      case '}':
        break loop;
      default: {
        const tx = parseText(src, pos, errors);
        body.push(tx);
        pos = tx.end;
      }
    }
  }

  if (src[pos] === '}') {
    pos += 1;
  } else {
    errors.push({ type: 'missing-char', char: '}', start: pos });
  }

  return { start, end: pos, body };
}