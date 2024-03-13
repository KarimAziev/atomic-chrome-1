export interface Selection {
  /**
   * The zero-based index of the start of the selection.
   */
  start: number;
  /**
   * The zero-based index of the end of the selection, inclusive.
   */
  end: number;
}

export interface IPosition {
  /**
   * The 1-based line number where the cursor is positioned.
   */
  lineNumber?: number;
  /**
   * The 1-based column number of the cursor's position in the line.
   */
  column?: number;
  /**
   * An array of `Selection` objects representing the active text selections.
   */
  selections?: Selection[];
}

/**
 * Defines options for setting value.
 */
export interface UpdateTextPayload extends IPosition {
  text: string;
  triggerDOMEvent?: boolean;
}

/**
 * Defines options for handler configuration.
 */
export interface Options extends IPosition {
  extension?: string | string[] | null;
  rect?: DOMRect;
}

/**
 * Interface for handler operations.
 */
export interface IHandler {
  /**
   * Loads data or performs an initialization operation.
   */
  load(): Promise<Options>;

  /**
   * Sets a value with optional settings.
   * @param value - The value to set.
   * @param options - Additional options.
   */
  setValue(value: string, options?: UpdateTextPayload): void;

  /**
   * Retrieves the currently set value.
   * @returns A promise that resolves with the current value.
   */
  getValue(): Promise<UpdateTextPayload>;

  /**
   * Binds a change event listener.
   * @param f - The function to call when the event occurs.
   * @param useCapture - Whether the event should be captured.
   */
  bindChange(f: (event: Event) => void, useCapture?: boolean): void;

  /**
   * Unbinds a change event listener.
   * @param f - The function to remove from the event listener list.
   * @param useCapture - Whether the event was to be captured.
   */
  unbindChange(f: (event: Event) => void, useCapture?: boolean): void;
}

/**
 * Constructs handler objects capable of handling elements.
 */
export interface IHandlerConstructor {
  new (elem: Element, contentEvents: IContentEventsBinder): IHandler;

  /**
   * Determines if the handler can manage the provided element.
   * @param elem - The element to check.
   * @returns A boolean indicating if the handler can manage the element.
   */
  canHandle(elem: Element): boolean;
}

/**
 * Binds content events to a handler.
 */
export interface IContentEventsBinder {
  /**
   * Binds events to the provided window object and handler context.
   * @param context - The handler context to bind to.
   * @param window - The window in which to bind events.
   */
  bind(context: IHandler, window: Window): void;
}

export type PostToInjectorPayloadMap = {
  ready: Options;
  value: UpdateTextPayload;
  change: {};
};

export type BaseInjectedPostType = keyof PostToInjectorPayloadMap;

export interface RegisterPayload
  extends UpdateTextPayload,
    Omit<Options, 'rect'> {
  url: string;
  title: string;
  rect?: Record<keyof DOMRect, number>;
}

export type SocketPostPayloadMap = {
  register: RegisterPayload;
  updateText: UpdateTextPayload;
};

export type PostToInjectedPayloadMap = {
  initialize: { name: string; selector?: string };
  setValue: UpdateTextPayload;
  getValue: undefined;
  unload: undefined;
};

export interface ClosedMessagePayload {
  code: CloseEvent['code'];
  reason: CloseEvent['reason'];
  wasClean: CloseEvent['wasClean'];
}
