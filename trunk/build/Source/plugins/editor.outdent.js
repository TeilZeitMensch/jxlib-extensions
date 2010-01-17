
Jx.Plugin.Editor.Outdent = new Class({
    
    Family: 'Jx.Plugin.Editor.Outdent',
    
    Extends: Jx.Plugin.Editor.Button,
    
    name: 'outdent',
    
    options: {
        image: Jx.aPixel.src,
        imageClass: 'Outdent',
        toggle: false,
        title: 'Outdent'
    },
    
    
    action: 'outdent'
    
});