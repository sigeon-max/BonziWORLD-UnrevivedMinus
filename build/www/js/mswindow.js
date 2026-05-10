// msWindow - draggable Windows 98-style dialog
// Signature: new msWindow(title, htmlContent, x, y, width, height, buttons)
// buttons: array of {name: String} objects
(function () {
    var zTop = 1000;

    function msWindow(title, content, x, y, width, height, buttons) {
        zTop++;
        var w = width || 360;
        var left = (x != null && x !== undefined) ? x : Math.max(20, (window.innerWidth - w) / 2);
        var top  = (y != null && y !== undefined) ? y : Math.max(40, (window.innerHeight - 300) / 3);

        var btns = Array.isArray(buttons) ? buttons : [{name: 'Close'}];
        if (btns.length === 0) btns = [{name: 'Close'}];

        var btnHtml = btns.map(function(b) {
            return '<button class="msw-btn">' + (b.name || 'OK') + '</button>';
        }).join('');

        var el = document.createElement('div');
        el.className = 'msw-window';
        el.style.cssText = [
            'position:fixed',
            'left:' + left + 'px',
            'top:' + top + 'px',
            'width:' + w + 'px',
            'z-index:' + zTop,
            'background:#c0c0c0',
            'border:2px solid #fff',
            'border-right-color:#808080',
            'border-bottom-color:#808080',
            'outline:1px solid #000',
            'box-shadow:2px 2px 0 #000',
            'font-family:Tahoma,Arial,sans-serif',
            'font-size:12px',
            'user-select:none',
        ].join(';');

        el.innerHTML = [
            '<div class="msw-titlebar" style="',
                'background:linear-gradient(to right,#000080,#1084d0);',
                'color:#fff;padding:3px 4px;cursor:move;',
                'display:flex;align-items:center;justify-content:space-between;',
                'font-weight:bold;font-size:12px;',
            '">',
                '<span class="msw-title">' + (title || '') + '</span>',
                '<button class="msw-close" style="',
                    'background:#c0c0c0;border:1px solid #fff;border-right-color:#808080;',
                    'border-bottom-color:#808080;outline:1px solid #000;',
                    'color:#000;font-weight:bold;font-size:11px;',
                    'width:16px;height:14px;cursor:pointer;padding:0;line-height:1;',
                '">x</button>',
            '</div>',
            '<div class="msw-body" style="padding:8px;overflow:auto;max-height:500px;">',
                content || '',
            '</div>',
            '<div class="msw-footer" style="',
                'padding:4px 8px 6px;text-align:right;border-top:1px solid #808080;',
            '">',
                btnHtml,
            '</div>',
        ].join('');

        document.body.appendChild(el);

        // bring to front on click
        el.addEventListener('mousedown', function () {
            zTop++;
            el.style.zIndex = zTop;
        });

        // close button
        el.querySelector('.msw-close').addEventListener('click', function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        });

        // footer buttons (all close the window)
        var footerBtns = el.querySelectorAll('.msw-footer .msw-btn');
        footerBtns.forEach(function (b) {
            b.style.cssText = [
                'background:#c0c0c0',
                'border:1px solid #fff',
                'border-right-color:#808080',
                'border-bottom-color:#808080',
                'outline:1px solid #000',
                'padding:2px 12px',
                'margin-left:4px',
                'cursor:pointer',
                'font-family:Tahoma,Arial,sans-serif',
                'font-size:12px',
            ].join(';');
            b.addEventListener('click', function () {
                if (el.parentNode) el.parentNode.removeChild(el);
            });
        });

        // dragging
        var titlebar = el.querySelector('.msw-titlebar');
        var dragging = false, ox = 0, oy = 0;

        titlebar.addEventListener('mousedown', function (e) {
            if (e.target.classList.contains('msw-close')) return;
            dragging = true;
            ox = e.clientX - el.offsetLeft;
            oy = e.clientY - el.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            el.style.left = Math.max(0, e.clientX - ox) + 'px';
            el.style.top  = Math.max(0, e.clientY - oy) + 'px';
        });

        document.addEventListener('mouseup', function () {
            dragging = false;
        });

        this._el = el;
    }

    window.msWindow = msWindow;
    window.newMsWindowOpened = false;
})();
