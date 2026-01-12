import { App, Modal } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { CaptureModal } from "./CaptureModal";
import { createElement } from "react";

export class ExampleModal extends Modal {
  root: Root
  saveButtonEl: HTMLButtonElement

  constructor(app: App) {
    super(app);

    // Create Save button directly under contentEl
    this.saveButtonEl = this.contentEl.createEl("button", {
      text: "💾 Save",
      cls: "save-button-top"
    });
    this.saveButtonEl.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1000;
      padding: 6px 12px;
      background: rgb(168 85 247);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
    `;
    this.saveButtonEl.addEventListener('mouseenter', () => {
      this.saveButtonEl.style.background = 'rgb(147 51 234)';
    });
    this.saveButtonEl.addEventListener('mouseleave', () => {
      this.saveButtonEl.style.background = 'rgb(168 85 247)';
    });

    // React root in a separate container
    const container = this.contentEl.createDiv();
    this.root = createRoot(container);
  }

  onOpen(): void {
    this.root.render(
      createElement(CaptureModal, {
        saveButtonRef: this.saveButtonEl,
        onConfirm: (text: string, action: string, mood: string) => {
          console.log("Saved:", { text, action, mood });
        },
      })
    );
  }

  onClose(): void {
    this.root.unmount();
  }
}
