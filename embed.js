// embed.js
(function() {
    var id = 'ame-widget-' + Math.random().toString(36).substr(2, 9);
    
    document.write(`
        <div id="${id}" style="width:100%;position:relative;">
            <iframe 
                src="https://devi-ce.github.io/dol_stat/"
                style="width:100%;border:none;display:block;"
                scrolling="no">
            </iframe>
        </div>
    `);
    
    // 높이 자동 조절
    window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'ame-widget-height') {
            var container = document.getElementById(id);
            if (container) {
                var iframe = container.querySelector('iframe');
                iframe.style.height = e.data.height + 'px';
            }
        }
    });
})();
