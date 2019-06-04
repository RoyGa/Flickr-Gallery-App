# Flickr Gallery

Welcome to the Flickr Gallery application.
This app is a simple gallery application that displays images in a grid. The images are retrieved using the Flickr API to fetch images by a tag.

##Some key features I implemented:

### Image Actions
Each image has three buttons that appear on mouse hover:
1. Flip: clicking the flip button flips the image horizontally.
2. Clone: clicking the clone button duplicates the image. 
3. Expand: clicking the expand button will display this image in a larger view.

### Gallery Actions
1. Favorites: enables the user to select their favorite images.  
   * is persistent - refreshing or closing the site will not reset the favorites.
2. Infinite Scroll: a mechanism that loads more images from flickr when the user is scrolling past the last image. I implemented the infinite scroll mechanism by myself (no npm package).
3. Drag & Drop: lets the users choose the order of the images by using the option to drag & drop images to their new position.

### Favorites Action:
1. Comment: enables the user to leave a comments on their favorite images.
   * is persistent - refreshing or closing the site will not reset the comments.

## Things I plan on adding
1. Tests for every feature
2. Lazy Load - when loading too many images the browser can become slow and heavy. I plan on solving it by implementing a Lazy Load mechanism.
