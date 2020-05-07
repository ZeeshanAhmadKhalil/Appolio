import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
 
export class MapContainer extends Component {
  renderMarkers(){
    return this.props.child_record.map((child,index)=>{
      const {longitude,latitude,childname}=child
      return(
        <Marker onClick={this.onMarkerClick}
                name={'Current location'}
                title={childname}
                position={{lat:latitude,lng:longitude}}
                draggable={true}
        />
      )
    })
  }
  render() {
    console.log(this.props.child_record);
    
    return (
      <Map 
        google={this.props.google} 
        zoom={14}
        initialCenter={{
            lat: 33.7660,
            lng: 72.3609
        }}
      >
        {this.renderMarkers()}
        
        {/* <Marker onClick={this.onMarkerClick}
                name={'Current location'}
                title={'Center'}
                position={{lat:33.7620,lng:72.3669}}
                draggable={true}
        />
        <Marker onClick={this.onMarkerClick}
                name={'Current location'}
                title={'Center'}
                position={{lat:33.7680,lng:72.3659}}
                draggable={true}
        /> */}

        <InfoWindow onClose={this.onInfoWindowClose}>
            {/* <div>
              <h1>{"this.state.selectedPlace.name"}</h1>
            </div> */}
        </InfoWindow>
      </Map>
    );
  }
}
 
export default GoogleApiWrapper({
  apiKey: ("AIzaSyCZQdWZWsNyakL30EbvVherjO4c9HcqFc8")
})(MapContainer)