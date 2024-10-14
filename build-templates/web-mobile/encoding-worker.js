self.onmessage = function (e) {
    const { imageBitmap, width, height } = e.data;

    const offscreen = new OffscreenCanvas(width, height);
    const context = offscreen.getContext('2d');
    context.drawImage(imageBitmap, 0, 0, width, height);

    offscreen.convertToBlob({ type: 'image/png' }).then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            const replacedBase64 = base64data.replace(/^data:image\/png;base64,/, '');
            self.postMessage({ replacedBase64 });
        };
        reader.readAsDataURL(blob);
    });
};
