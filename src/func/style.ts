const DynamicStyleSheetId = 'daily-note-today-dynamic-style-sheet';

export const updateStyleSheet = (css: string) => {
    let style = document.getElementById(DynamicStyleSheetId);
    if (style === null) {
        style = document.createElement('style');
        style.id = DynamicStyleSheetId;
        document.head.appendChild(style);
    }
    style.innerHTML = css;
}

export const removeStyleSheet = () => {
    let style = document.getElementById(DynamicStyleSheetId);
    if (style !== null) {
        style.remove();
    }
}
