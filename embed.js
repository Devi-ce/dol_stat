// embed.js - 티스토리와 동일한 렌더링
(function() {
    // 현재 문서의 너비 감지
    var containerWidth = document.currentScript.parentElement.offsetWidth || '100%';
    
    document.write(`
        <style>
            .ame-widget-container {
                position: relative;
                width: 100%;
                padding-bottom: 130%; /* 위젯 비율 유지 */
                overflow: hidden;
            }
            .ame-widget-container iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
            }
        </style>
        <div class="ame-widget-container">
            <iframe src="https://devi-ce.github.io/dol_stat/" scrolling="no"></iframe>
        </div>
    `);
})();
