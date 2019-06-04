import FontAwesome from 'react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Image from '../Image';
import './Gallery.scss';

class Gallery extends React.Component {
  static propTypes = {
    tag: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      galleryWidth: this.getGalleryWidth(),
      galleryHeader: 'Search Results',
      favoriteImages: [],
      imagesToShow: [],
      // Try to remove this
      noFavoriteImages: true,
      currentPage: 1,
      totalPages: null,
      // Rename
      scrolling: false,
      // Try to remove
      expand: false,
      imageToExpand: null
    };
  }

  getGalleryWidth(){
    try {
      return document.body.clientWidth;
    } catch (e) {
      return 1000;
    }
  }

  getImages(tag) {
    const { currentPage, images } = this.state;
    const getImagesUrl = `services/rest/?method=flickr.photos.search&api_key=522c1f9009ca3609bcbaf08545f067ad&page=${currentPage}&tags=${tag}&tag_mode=any&format=json&safe_search=1&nojsoncallback=2`;
    const baseUrl = 'https://api.flickr.com/';
    axios({
      url: getImagesUrl,
      baseURL: baseUrl,
      method: 'GET'
    })
      .then(res => res.data)
      .then(res => {
        if (
          res &&
          res.photos &&
          res.photos.photo &&
          res.photos.photo.length > 0
        ) {
          this.setState({
            images: [...images,...res.photos.photo],
            imagesToShow: [...images,...res.photos.photo],
            scrolling: false,
            totalPages: res.photos.pages
          });
          this.getFavoriteImagesFromLocalStorage();
        }
      });
  }

  componentDidMount() {
    this.getImages(this.props.tag);
    this.setState({
      galleryWidth: document.body.clientWidth
    });
    this.scrollEventListener = window.addEventListener('scroll', () => {
      this.scrollEventHandler();
    });
  }

  componentWillReceiveProps(props) {
    this.setState({
      images: [],
      imagesToShow: []
    },this.getImages(props.tag));
  }

  storeFavoriteImagesToLocalStorage(favoriteImages) {
    localStorage.clear();
    localStorage.setItem('favoriteImages', JSON.stringify(favoriteImages));
  }

  getFavoriteImagesFromLocalStorage() {
    const favImages = JSON.parse(localStorage.getItem('favoriteImages'));
    if(favImages != null) {
      this.setState({
          favoriteImages: favImages,
          noFavoriteImages: false
      });
    } else {
      this.setState({ noFavoriteImages: true });
    }
  }

  addImageToFavoritesHandler(imageId) {
    const imageIndex = this.getImageIndexById(imageId, this.state.images);
    const cloneImage = {...this.state.images[imageIndex], comment: "Add a comment..." };
    const newFavoriteImages = [...this.state.favoriteImages,cloneImage];
    this.setState({ 
        favoriteImages: newFavoriteImages,
        noFavoriteImages: false
    });
    this.storeFavoriteImagesToLocalStorage(newFavoriteImages);
  }

  clearFavoritesHandler() {
    // Clear only favorites
    localStorage.clear();
    this.setState({
      favoriteImages: [],
      imagesToShow: [],
      noFavoriteImages: true
    });
  }

  showFavoritesHandler() {
    this.setState({
      galleryHeader: 'Favorites',
      imagesToShow: this.state.favoriteImages
    });
  }

  showSearchResultsHandler() {
    this.setState({ galleryHeader: 'Search Results' });
    this.getImages(this.props.tag);
  }

  cloneImageHandler(imageId) {
    const imageIndex = this.state.images.findIndex(i => {
      return i.id == imageId;
    });
    const cloneImage = {...this.state.images[imageIndex]};
    const newImageArr = [cloneImage,...this.state.images];
    this.setState({
      images: newImageArr,
      imagesToShow: newImageArr
    });
  }

  loadMoreImages() {
    this.setState({
      currentPage: this.state.currentPage + 1,
      scrolling: true
      }, this.getImages(this.props.tag));
  }

  scrollEventHandler() {
    const { scrolling, totalPages, currentPage } = this.state;
    if (this.state.galleryHeader == 'Favorites') return;// if on favorites
    if (scrolling) return;// while buffering more images
    if (totalPages <= currentPage) return;// if all pages were loaded
    const lastImage = document.querySelector('div.gallery-root > div:last-child');
    const lastImageOffset = lastImage.clientHeight + lastImage.offsetTop;// last image height + the distance from last image top to the top of parent element
    const pageOffset = window.pageYOffset + window.innerHeight;
    let loadingGap = 1500;
    if (pageOffset > lastImageOffset - loadingGap){
      this.loadMoreImages();
    } 
  }

  dragStartHandler(event) {
    event.dataTransfer.setData("Image", event.target.id);
  }

  dropHandler(event) {
    event.preventDefault();
    let draggedImageId = event.dataTransfer.getData("Image");
    let draggedImageIndex = this.getImageIndexById(draggedImageId, this.state.images);
    let draggedImage = this.cloneImageByIndex(draggedImageIndex, this.state.images);
    let dropzoneImageIndex = this.getImageIndexById(event.target.id, this.state.images);
    let newImageArr = [...this.state.images];
    newImageArr.splice(draggedImageIndex,1);
    newImageArr.splice(dropzoneImageIndex,0,draggedImage);
    this.setState({
      images: newImageArr,
      imagesToShow: newImageArr
     });
  }

  cloneImageByIndex(imageIndex, images) {
    return {...images[imageIndex]};
  }

  getImageIndexById(imageId, images) {
    return images.findIndex(image => {
      return image.id == imageId;
    });
  }

  cloneImageById(imageId, images) {
    const imageIndex = this.getImageIndexById(imageId, images);
    const cloneImage = this.cloneImageByIndex(imageIndex, images);
    return cloneImage;
  }

  expandImageHandler(imageId) {
    let images = null;
    if (this.state.galleryHeader == 'Favorites') {
      images = [...this.state.favoriteImages];
    } else {
      images = [...this.state.images];
    }
    const cloneImage = this.cloneImageById(imageId, images);
    this.setState({
      expand: true,
      imageToExpand: cloneImage
    });
  }

  closeWindowHandler() {
    this.setState({ expand: false });
  }

  urlFromDto(dto) {
    return `https://farm${dto.farm}.staticflickr.com/${dto.server}/${dto.id}_${dto.secret}.jpg`;
  }

  addCommentHandler(event) {
    const comment = event.target.value;
    const imageIndex = this.getImageIndexById(this.state.imageToExpand.id, this.state.favoriteImages);
    const cloneImage = {...this.state.imageToExpand};
    cloneImage.comment = comment;
    let newFavoriteImages = [...this.state.favoriteImages];
    newFavoriteImages[imageIndex] = cloneImage;
    this.setState({ favoriteImages: newFavoriteImages });
    this.storeFavoriteImagesToLocalStorage(newFavoriteImages);
  }

  render() {
    let favoritesOptions = null;
    let noFavoritesMsg = null;
    let expandedImage = null;
    let comment = null;

    if (this.state.galleryHeader == 'Favorites') {
      favoritesOptions = (
        <div className="nav-bar">
          <div className="btn-container">
            <div className="fav-btn" onClick={() => this.clearFavoritesHandler()}>Clear Favorites</div>
          </div>
        </div>
      );
      if(this.state.expand) {
        comment = (
            <input className="comment-input" type="text" onBlur={(event) => this.addCommentHandler(event)} placeholder={this.state.imageToExpand.comment}></input>
        );
      }
      
      if(this.state.noFavoriteImages) {
        noFavoritesMsg = (
          <div className="no-fav-images-msg-container">
            <div className="no-fav-images-msg">Sorry! You haven't saved any images yet...</div>
          </div>
        );
      }
    }
    
    if(this.state.expand) {
      let expandStyle = {
        backgroundImage: `url(${this.urlFromDto(this.state.imageToExpand)})`
      };
      expandedImage = (
        <div className="expand-box-container">
          <div className="expand-box">
          <FontAwesome className="exit-icon" name="fas fa-times-circle" title="exit" onClick={() => this.closeWindowHandler()}/>
          <h4>Image-{this.state.imageToExpand.id}</h4>
            <div className="image-container" style={expandStyle}></div>
            {comment}
          </div>
        </div>
      );
    }

    return (
      <div className="gallery-root">
        {expandedImage}
        <div className="triangle-topleft"></div> 
        <div className="nav-bar">
          <div className="btn-container">
            <div className="nav-btn" onClick={() => this.showSearchResultsHandler()}>Home</div>
            <div className="nav-btn" onClick={() => this.showFavoritesHandler()}>Favorites</div>
          </div>
        </div>
        <h3>{this.state.galleryHeader}</h3>
        {favoritesOptions}
        {noFavoritesMsg}

        {this.state.imagesToShow.map((dto,index) => {
          return <Image key={'image-'+dto.id+index}
                        dto={dto}
                        galleryWidth={this.state.galleryWidth}
                        clone={() => this.cloneImageHandler(dto.id)}
                        expand={() => this.expandImageHandler(dto.id)}
                        favorite={() => this.addImageToFavoritesHandler(dto.id)}
                        onDragStart={event => this.dragStartHandler(event)}
                        onDrop={event => this.dropHandler(event)}
                        imgSize={200}/>;
        })}
      </div>
    );
  }
}

export default Gallery;