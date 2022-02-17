import { Resource } from './data-model';
import type { Context } from './format-context';
import { MessageValue, ResolvedMessage } from './message-value';
import { PatternElementResolver, patternFormatters } from './pattern';
import type { Scope } from './pattern/variable-ref';
import { ResourceReader } from './resource-reader';
import { defaultRuntime, Runtime } from './runtime';

export interface MessageFormatOptions {
  elements?: (
    | 'element'
    | 'function'
    | 'literal'
    | 'term'
    | 'variable'
    | PatternElementResolver
  )[];
  localeMatcher?: 'best fit' | 'lookup';
  runtime?: Runtime;
}

export const MFruntime = Symbol('runtime');

/**
 * Create a new message formatter.
 *
 * If `runtime` is unset, a default minimal set is used, consisting of `plural`
 * for selection and `datetime` & `number` formatters based on the `Intl`
 * equivalents.
 */
export class MessageFormat {
  readonly #localeMatcher: 'best fit' | 'lookup';
  readonly #locales: string[];
  readonly #resolvers: readonly PatternElementResolver[];
  readonly #resource: ResourceReader;

  readonly [MFruntime]: Readonly<Runtime>;

  constructor(
    locales: string | string[],
    options: MessageFormatOptions | null,
    resource: Resource | ResourceReader
  ) {
    this.#resolvers =
      options?.elements?.map(fmtOpt => {
        if (typeof fmtOpt === 'string') {
          const fmt = patternFormatters.find(fmt => fmt.type === fmtOpt);
          if (!fmt) throw new RangeError(`Unsupported pattern type: ${fmtOpt}`);
          return fmt;
        } else return fmtOpt;
      }) ?? patternFormatters;
    this.#localeMatcher = options?.localeMatcher ?? 'best fit';
    this.#locales = Array.isArray(locales) ? locales.slice() : [locales];
    const rt = options?.runtime ?? defaultRuntime;
    this[MFruntime] = Object.freeze({ ...rt });
    this.#resource = ResourceReader.from(resource);
  }

  format(
    msgPath: string | string[],
    scope: Scope = {},
    onError?: (error: unknown, value: MessageValue) => void
  ) {
    const resMsg = this.getMessage(msgPath, scope, onError);
    return resMsg ? resMsg.toString(onError) : '';
  }

  getMessage(
    msgPath: string | string[],
    scope: Scope = {},
    onError?: (error: unknown, value: MessageValue) => void
  ): ResolvedMessage | undefined {
    const path = typeof msgPath === 'string' ? [msgPath] : msgPath;
    const msg = this.#resource.getMessage(path);
    if (!msg) return undefined;
    const ctx = this.createContext(scope, onError);
    return new ResolvedMessage(ctx, msg);
  }

  resolvedOptions() {
    return {
      elements: this.#resolvers.map(res => res.type),
      localeMatcher: this.#localeMatcher,
      locales: this.#locales.slice(),
      runtime: this[MFruntime]
    };
  }

  private createContext(
    scope: Scope,
    onError: Context['onError'] = () => {
      // Ignore errors by default
    }
  ): Context {
    const resolvers = this.#resolvers;

    const ctx: Context = {
      onError,
      resolve(elem) {
        const res = resolvers.find(res => res.type === elem.type);
        if (!res) throw new Error(`Unsupported pattern element: ${elem.type}`);
        return res.resolve(this, elem);
      },
      localeMatcher: this.#localeMatcher,
      locales: this.#locales,
      types: {}
    };

    for (const res of resolvers) {
      if (typeof res.initContext === 'function')
        ctx.types[res.type] = res.initContext(this, scope);
    }

    return ctx;
  }
}