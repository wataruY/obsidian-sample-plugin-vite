import { App, Modal } from 'obsidian';
import { createRoot } from 'react-dom/client';
import { Foo } from './components/Foo';
import { createElement } from 'react';

export class ExampleModal extends Modal {
  constructor(app: App) {
    super(app);
    const root = createRoot(this.contentEl)
    root.render(createElement(Foo, { initialValue: 10 } as any))
  }
}
