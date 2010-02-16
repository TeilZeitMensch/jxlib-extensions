
Jx.Plugin.Editor.Link = new Class({
    
    Family: 'Jx.Plugin.Editor.Link',
    
    Extends: Jx.Plugin.Editor.Button,
    
    name: 'createlink',
    
    options: {
        image: Jx.aPixel.src,
        imageClass: 'Link',
        toggle: false,
        shortcut: 'l',
        title: 'Create Hyperlink'
    },
    
    tags: ['a'],
    
    action: 'createlink',
    
    command: function () {
        if (this.editor.selection.isCollapsed()) {
            new Jx.Dialog.Message({
                message: 'Please select the text you wish to hyperlink.'
            }).open();
        } else {
            var text = this.editor.selection.getText();
            new Jx.Dialog.Prompt({
                prompt: 'Enter the web address you wish to link to. <br/> The text you selected to link to: "' + text + '"' ,
                startingValue: 'http://',
                onClose: this.finish.bind(this)
            }).open();
        }
    },
    
    finish: function (dialog, result, url) {
        if (result.toLowerCase() === 'ok') {
            this.editor.execute('createlink', false, url.trim());
        }
    }
    
});