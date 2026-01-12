import { App, Modal } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { Foo } from "./components/Foo";
import { createElement } from "react";

export class ExampleModal extends Modal {
  root: Root
  constructor(app: App) {
    super(app);
    this.root = createRoot(this.contentEl);
    this.root.render(createElement(Foo, { initialValue: 10 } as any));
  }

  onClose(): void {
    this.root.unmount()

  }
}
