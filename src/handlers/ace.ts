import InjectorHandler from './injector';
import type { ContentEventsBinder } from './injector';

const aceClassName = 'ace_text-input';

class AceHandler extends InjectorHandler {
  constructor(elem: HTMLElement, contentEvents: ContentEventsBinder) {
    super(elem, contentEvents, 'ace');
  }
  static canHandle(elem: HTMLElement) {
    return elem.classList.contains(aceClassName);
  }
}

export default AceHandler;