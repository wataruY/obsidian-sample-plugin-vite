import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from "./settings";
import { ExampleModal } from "./modal";

// Remember to rename these classes and interfaces!
export function getRandomIntInclusive(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // 上限を含み、下限も含む
}
export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.addCommand({
      id: 'display-modala',
      name: 'Display Modal',
      callback: () => {
        new ExampleModal(this.app).open()
      },
    })
  }

  onunload() { }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<MyPluginSettings>,
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
