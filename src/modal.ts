import { App, Modal, Platform } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { CaptureModal } from "./CaptureModal";
import { createElement } from "react";
import Fuse from 'fuse.js'

// Fuzzy matching function - returns true if query characters appear in target in order
function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  let queryIdx = 0;
  let targetIdx = 0;

  while (queryIdx < q.length && targetIdx < t.length) {
    if (q[queryIdx] === t[targetIdx]) {
      queryIdx++;
    }
    targetIdx++;
  }

  return queryIdx === q.length;
}



export class ExampleModal extends Modal {
  root: Root
  saveButtonEl: HTMLButtonElement
  tags: string[]

  constructor(app: App) {
    super(app);




    // Create Save button directly under contentEl
    this.saveButtonEl = this.modalEl.createEl("button", {
      text: "💾 Save",
      cls: ["save-button-top", "mod-raised", "clickable-icon"]
    });
    this.saveButtonEl.style.cssText = `
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

    if (Platform.isPhone || app.workspace.containerEl.clientWidth < 500) {
      this.modalEl.setCssStyles({
        height: "100%"
      })
    }

    this.tags = (this.app.metadataCache as any).getTags()
  }

  onOpen(): void {
    const fuse = new Fuse(Object.keys(this.tags).map((x) => { return { tag: x } }), {
      keys: ["tag"]
    })
    this.root.render(
      createElement(CaptureModal, {
        saveButtonRef: this.saveButtonEl,
        onConfirm: (text: string, action: string, mood: string) => {
          console.log("Saved:", { text, action, mood });
        },
        items: (_query) => {
          return Object.keys(this.tags);
        }
      })
    );
  }

  onClose(): void {
    this.root.unmount();
  }
}
