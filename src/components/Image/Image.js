import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import './Image.scss';

class Image extends React.Component {
  static propTypes = {
    dto: PropTypes.object,
    galleryWidth: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.calcImageSize = this.calcImageSize.bind(this);
    this.state = {
      size: 200,
      flip: false,
      expand: false
    };
  }

  calcImageSize() {
    const {galleryWidth} = this.props;
    const targetSize = 200;
    const imagesPerRow = Math.round(galleryWidth / targetSize);
    const size = (galleryWidth / imagesPerRow);
    this.setState({
      size
    });
  }

  componentDidMount() {
    this.calcImageSize();
  }

  urlFromDto(dto) {
    return `https://farm${dto.farm}.staticflickr.com/${dto.server}/${dto.id}_${dto.secret}.jpg`;
  }

  flipImageHandler() {
    const isFliped = !this.state.flip;
    this.setState({ flip: isFliped });
  }

  allowDrop(event) {
    event.preventDefault();
  }

  expandImage() {
    this.setState({ expand: true });
  }

  render() {
    let defStyle = {
      backgroundImage: `url(${this.urlFromDto(this.props.dto)})`,
      width: this.state.size + 'px',
      height: this.state.size + 'px',
    }
    const styleFliped = {
    };

    if(this.state.flip) {
      defStyle.transform = 'scaleX(-1)';
      defStyle.filter = 'FlipH';
      styleFliped.transform = 'scaleX(-1)';
      styleFliped.filter = 'FlipH';
    }

    if(this.state.expand) {
      let newHeight = this.state.size * 2;
      let newWidth = this.state.size * 2;
      defStyle.height = newHeight +'px';
      defStyle.width = newWidth +'px';
      defStyle.display = 'block';
    }
    
    return (
      <div
        id={this.props.dto.id}
        className="image-root"
        style={defStyle}
        draggable="true"
        onDragOver={event => this.allowDrop(event)}
        onDragStart={this.props.onDragStart}
        onDrop={this.props.onDrop}
        >
        <div style={styleFliped}>
          <FontAwesome className="image-icon" name="arrows-alt-h" title="flip" onClick={() => this.flipImageHandler()}/>
          <FontAwesome className="image-icon" name="clone" title="clone" onClick={this.props.clone}/>
          <FontAwesome className="image-icon" name="expand" title="expand" onClick={this.props.expand}/>
          <FontAwesome className="image-icon" name="star" title="favorite" onClick={this.props.favorite}/>
        </div>
      </div>
    );
  }
}

export default Image;
