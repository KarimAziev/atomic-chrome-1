import { loadHandler } from '@/util/loadHandler';
import { handlerFactory } from '@/handlers';
import { DebouncedWindowEventListener } from '@/util/debounced-event-listener';
import { HintReader } from '@/content-script-tools/hint-reader';
import type { IHandlerConstructor } from '@/handlers/types';
import type { First } from '@/util/types';
import { loadSettings } from '@/options/load-settings';

export type ElementValue = First<ReturnType<typeof ElementReader.getElems>>;

class ElementReader {
  static getElems() {
    return ElementReader.getElemsWithHandlers().map(([handler, element]) => ({
      element: handler.getHintArea(element) || element,
      value: [handler, element] as [typeof handler, typeof element],
      tooltipText: handler.getName(),
    }));
  }

  static getCssSelectorsOfEditable() {
    return 'textarea, [contenteditable], *[contenteditable=true], *[role=textbox], div.ace_cursor, .cke_contents, .ck-editor__editable';
  }

  private static getEditableElements() {
    const selector = ElementReader.getCssSelectorsOfEditable();
    let elements = ElementReader.getVisibleElements<HTMLTextAreaElement>(
      function (e, v) {
        if (
          e.matches(selector) &&
          e.getAttribute('contenteditable') !== 'false' &&
          !(e as HTMLInputElement).disabled &&
          !(e as HTMLInputElement).readOnly
        ) {
          v.push(e as HTMLTextAreaElement);
        }
      },
    );

    return elements;
  }

  private static getVisibleElements<ResultElement extends Element>(
    filter: (e: Element, visibleElements: ResultElement[]) => void,
  ) {
    const all = Array.from(document.documentElement.getElementsByTagName('*'));
    const visibleElements: ResultElement[] = [];
    for (let i = 0; i < all.length; i++) {
      const e: Element = all[i];
      if (e.shadowRoot) {
        const cc: NodeList = e.shadowRoot.querySelectorAll('*');
        for (let j = 0; j < cc.length; j++) {
          all.push(cc[j] as Element);
        }
      }
      const rect: DOMRect = e.getBoundingClientRect();
      if (
        rect.top <= window.innerHeight &&
        rect.bottom >= 0 &&
        rect.left <= window.innerWidth &&
        rect.right >= 0 &&
        rect.height > 0 &&
        getComputedStyle(e).visibility !== 'hidden'
      ) {
        filter(e, visibleElements);
      }
    }
    return visibleElements;
  }

  private static getElemsWithHandlers() {
    const editableElems = ElementReader.getEditableElements();
    const result: [
      IHandlerConstructor<HTMLTextAreaElement>,
      HTMLTextAreaElement,
    ][] = [];

    for (let i = 0; i < editableElems.length; i++) {
      const el = editableElems[i];

      const handler = handlerFactory.handlerFor(el);
      if (handler) {
        result.push([handler, el]);
      }
    }

    return result;
  }

  public async readElement(): Promise<
    First<ReturnType<typeof ElementReader.getElems>> | undefined
  > {
    const settings = await loadSettings();

    const hintInstance = new HintReader({
      characters: settings.hints,
      exitKeybingings: settings.keybindings.exitHint,
    });
    const isHintReading = hintInstance.getIsReading();

    if (isHintReading) {
      return;
    }
    let scrolled = false;

    const scroller = new DebouncedWindowEventListener('scroll');

    try {
      do {
        const winner = await Promise.race([
          hintInstance.readItems(ElementReader.getElems),
          scroller.waitOnce(500).then(() => ({ value: true })),
        ]);
        if (Array.isArray(winner.value)) {
          scroller.clear();
          return winner as First<ReturnType<typeof ElementReader.getElems>>;
        }
        hintInstance.cancel();
        scrolled = winner.value === true;
      } while (scrolled);
    } catch (error) {
      scroller.clear();
      hintInstance.cancel();
    }
  }

  public async readAndLoadElement(): Promise<void> {
    if (!document?.hasFocus()) {
      return;
    }

    const hintItem = await this.readElement();

    if (hintItem) {
      await loadHandler(hintItem.value);
    }
  }
}

export default new ElementReader();
