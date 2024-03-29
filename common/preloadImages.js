const preloadedImages = [];

export function preloadImages(images) {
	images.forEach((image) => {
		const newImage = new Image();
		newImage.src = image;
		preloadedImages.push(newImage);
	});
}

