
Jx.Plugin.Editor.Image = new Class({
    
    Family: 'Jx.Plugin.Editor.Image',
    
    Extends: Jx.Plugin.Editor.Button,
    
    name: 'image',
    
    options: {
        image: Jx.aPixel.src,
        imageClass: 'Image',
        toggle: false,
        shortcut: 'm',
        title: 'Insert Image'
    },
    
    tags: ['img'],
    
    action: 'insertimage',
    
    command: function () {
        new Jx.Dialog.Prompt({
            prompt: 'Enter the address of the image:' ,
            onClose: this.finish.bind(this)
        }).open();
    },
    
    finish: function (dialog, result, url) {
        if (result.toLowerCase() === 'ok') {
            this.editor.execute(this.action, false, url.trim());
        }
    }
    
});