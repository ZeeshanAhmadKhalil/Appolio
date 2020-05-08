import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import PropTypes from "prop-types";
import { MAP, MARKER } from "react-google-maps/lib/constants";
 
// export class Spiderfy extends Component {
//   static contextTypes = {
//     [MAP]: PropTypes.object
//   };

//   constructor(props, context) {
//     super(props, context);
//     const oms = require(`npm-overlapping-marker-spiderfier/lib/oms.min`)
//     this.oms = new oms.OverlappingMarkerSpiderfier(this.context[MAP], {});
//     this.markerNodeMounted = this.markerNodeMounted.bind(this);
//   }

//   markerNodeMounted(ref) {
//     const marker = ref.state[MARKER];
//     this.oms.addMarker(marker); 
//     window.google.maps.event.addListener(marker, "spider_click", (e) => {
//       if (this.props.onSpiderClick) this.props.onSpiderClick(e);
//     });
//   }

//   render() {
//     return React.Children.map(this.props.children, child =>
//       React.cloneElement(child, { ref: this.markerNodeMounted })
//     );
//   }
// }
export class MapContainer extends Component {
  calculateAge=(dateString)=>{
    var now = new Date();
    var today = new Date(now.getYear(), now.getMonth(), now.getDate());

    var yearNow = now.getYear();
    var monthNow = now.getMonth();
    var dateNow = now.getDate();
    dateString=dateString.split("-")
    // console.log(dateString[2])
    var dob = new Date(dateString[2].toString(),
      dateString[1].toString()-1,
      dateString[0].toString()
    );
    // console.log(dob)
    var yearDob = dob.getYear();
    var monthDob = dob.getMonth();
    var dateDob = dob.getDate();
    var age = {};
    var ageString = "";
    var yearString = "";
    var monthString = "";
    var dayString = "";


    var yearAge = yearNow - yearDob;

    if (monthNow >= monthDob)
      var monthAge = monthNow - monthDob;
    else {
      yearAge--;
      var monthAge = 12 + monthNow - monthDob;
    }

    if (dateNow >= dateDob)
      var dateAge = dateNow - dateDob;
    else {
      monthAge--;
      var dateAge = 31 + dateNow - dateDob;

      if (monthAge < 0) {
        monthAge = 11;
        yearAge--;
      }
    }

    age = {
      years: yearAge,
      months: monthAge,
      days: dateAge
    };

    if (age.years > 1) yearString = " years";
    else yearString = " year";
    if (age.months > 1) monthString = " months";
    else monthString = " month";
    if (age.days > 1) dayString = " days";
    else dayString = " day";


    if ((age.years > 0) && (age.months > 0) && (age.days > 0))
      ageString = age.years + yearString + ", " + age.months + monthString + ", and " + age.days + dayString + " old.";
    else if ((age.years == 0) && (age.months == 0) && (age.days > 0))
      ageString = "Only " + age.days + dayString + " old!";
    else if ((age.years > 0) && (age.months == 0) && (age.days == 0))
      ageString = age.years + yearString + " old. Happy Birthday!!";
    else if ((age.years > 0) && (age.months > 0) && (age.days == 0))
      ageString = age.years + yearString + " and " + age.months + monthString + " old.";
    else if ((age.years == 0) && (age.months > 0) && (age.days > 0))
      ageString = age.months + monthString + " and " + age.days + dayString + " old.";
    else if ((age.years > 0) && (age.months == 0) && (age.days > 0))
      ageString = age.years + yearString + " and " + age.days + dayString + " old.";
    else if ((age.years == 0) && (age.months > 0) && (age.days == 0))
      ageString = age.months + monthString + " old.";
    else ageString = "Oops! Could not calculate age!";

    return ageString  
  }
  renderMarkers(){
    // var longitudes=this.props.child_record.map(a=>parseFloat(a.longitude).toFixed(5))
    // console.log(longitudes)
    var longitudes=[]
    return this.props.child_record.map((child,index)=>{
      const {longitude,latitude,childname,dateofBirth}=child
      var ageString=this.calculateAge(dateofBirth)
      // var the_longitude=longitude
      // longitude=parseFloat(longitude).toFixed(5)
      // console.log(parseFloat(longitude).toFixed(5))
      // if(longitudes.includes(parseFloat(longitude).toFixed(5))){
      //   console.log("same")
      //   the_longitude=longitude-0.0001
      //   longitudes.push(parseFloat(the_longitude).toFixed(5))
      // } else{
      //   longitudes.push(parseFloat(longitude).toFixed(5))
      // }
      return(
        <Marker onClick={this.onMarkerClick}
                // name={'Current location'}
                title={childname+"("+ageString+")"}
                position={{lat:latitude,lng:longitude}}
                draggable={true}
        />
      )
    })
  }
  render() {
    // console.log(this.props.child_record);
    
    return (
      <Map 
        google={this.props.google} 
        zoom={14}
        initialCenter={{
            lat: 33.7660,
            lng: 72.3609
        }}
      >
        {/* <Spiderfy> */}
          {this.renderMarkers()}
        {/* </Spiderfy> */}
        
      </Map>
    );
  }
}
 
export default GoogleApiWrapper({
  apiKey: ("AIzaSyCZQdWZWsNyakL30EbvVherjO4c9HcqFc8")
})(MapContainer)