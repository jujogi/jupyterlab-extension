import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { CondaStoreWidget } from './widget';
import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

/**
 * Initialization data for the myextension extension.
 */

const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  autoStart: true,
  id: 'myextension:plugin',
  requires: [ISettingRegistry, ICommandPalette, ILayoutRestorer]
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function activate(
  app: JupyterFrontEnd,
  settingRegistry: ISettingRegistry,
  palette: ICommandPalette,
  restorer: ILayoutRestorer
) {
  console.log('JupyterLab extension conda-store is activated!');

  // Attempt to load application settings
  let settings: ISettingRegistry.ISettings;
  let widget: Widget;
  let condaStoreExtension: CondaStoreWidget;

  try {
    settings = await settingRegistry.load(plugin.id);

    const command = 'condastore:open';

    app.commands.addCommand(command, {
      label: 'Conda Store',
      execute: () => {
        if (!widget || widget.isDisposed) {
          condaStoreExtension = new CondaStoreWidget(settings);
          widget = new MainAreaWidget({ content: condaStoreExtension });
          widget.id = 'jp-conda-store';
          widget.title.label = 'conda-store';
          widget.title.closable = true;
        }

        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }

        widget.update();

        // Activate the widget
        app.shell.activateById(widget.id);

        settings.changed.connect(() => {
          condaStoreExtension.rerender();
        });
      }
    });

    palette.addItem({ command, category: 'Tutorial' });
  } catch (error) {
    console.error(
      'Failed to load settings for the conda-store Extension.\n%1',
      error
    );
  }
}

export default plugin;
