import React, { Component } from 'react';
import firebase from 'firebase'
import admin from 'firebase-admin'
import './App.css';
import male_pic from './images/male.png'
import female_pic from './images/female.png'
import Chart from 'chart.js'
import MapContainer from './external_components/Goodle_Map.js';
const $ = window.$;
let profile_pic="";
if(window.localStorage.getItem("gender")=="Male"){
  profile_pic=male_pic
} else{
  profile_pic=female_pic
}
var firebaseConfig = {
  apiKey: "AIzaSyB5NIXeyJ6xFcXPROJW4DIhMWuBGdktIaA",
  authDomain: "appolio-1201a.firebaseapp.com",
  databaseURL: "https://appolio-1201a.firebaseio.com",
  projectId: "appolio-1201a",
  storageBucket: "appolio-1201a.appspot.com",
  messagingSenderId: "18463849163",
  appId: "1:18463849163:web:153628101f1a20d609394e"
};
firebase.initializeApp(firebaseConfig);
// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://appolio-1201a.firebaseio.com"
});
export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      role: "Admin",
      admin_data: "",
      workers_data:""
    }
  }
  login = () => {
    // alert("worked")
    if ($(".login_email_error").html() == "..." && $(".login_password_error").html() == "...") {
      if (this.state.role == "Admin") {
        console.log(this.state)
        if (this.state.email == this.state.admin_data.email && this.state.password == this.state.admin_data.password) {
          // console.log("logged In")
          window.localStorage.setItem("cnic", this.state.admin_data.cnic)
          window.localStorage.setItem("email", this.state.admin_data.email)
          window.localStorage.setItem("gender", this.state.admin_data.gender)
          window.localStorage.setItem("name", this.state.admin_data.name)
          window.localStorage.setItem("phone_no", this.state.admin_data.phone_no)
          window.localStorage.setItem("role", this.state.admin_data.role)
          window.location.reload();
        } else {
          alert("Wrong Email or Password")
        }

      } else {
        var result = firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(() => {
          console.log("Signed in")
          var structured_workers_data = []
          for (var key_ in this.state.workers_data) {
            // skip loop if the property is from prototype
            if (!this.state.workers_data.hasOwnProperty(key_)) continue;
            var obj = this.state.workers_data[key_];
            // console.log(key_)
            obj["key"] = key_
            structured_workers_data.push(obj)
          }
          console.log(structured_workers_data)
          var structured_workers_data = structured_workers_data.filter(obj => {
            return obj.email == this.state.email
          })
          console.log(this.state.email)
          console.log(structured_workers_data)
          window.localStorage.setItem("cnic", structured_workers_data[0].cnic)
          window.localStorage.setItem("email", structured_workers_data[0].email)
          window.localStorage.setItem("gender", structured_workers_data[0].gender)
          window.localStorage.setItem("name", structured_workers_data[0].name)
          window.localStorage.setItem("phone_no", structured_workers_data[0].phone_no)
          window.localStorage.setItem("role", structured_workers_data[0].role)
          window.localStorage.setItem("key", structured_workers_data[0].key)
          console.log(window.localStorage)
          window.location.reload();
        }).catch(function (error) {
          console.log(error)
          alert("Wrong Email or Password")
        })
        // .then(function(){
        //   var user = firebase.auth().currentUser
        //   console.log(user)
        // })
        console.log(result)
      }
    }
  }
  email_changed=(email)=>{
    this.setState({ email: email })
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(re.test(String(email).toLowerCase())){
      $(".login_email_error").html("...")
      $(".login_email_error").css("visibility", "hidden");
    } else{
      $(".login_email_error").html("Enter valid email")
      $(".login_email_error").css("visibility", "visible");
    }
  }
  password_changed=(password)=>{
    this.setState({ password: password })
    if(password.length<8){
      $(".login_password_error").html("Min chars could be 8")
      $(".login_password_error").css("visibility", "visible");
    } else if(!/[a-z]/.test(password)||!/[A-Z]/.test(password)||!/[0-9]/.test(password)){
      $(".login_password_error").html("There should be a num, lower and upper case letter")
      $(".login_password_error").css("visibility", "visible");
    }
    else{
      $(".login_password_error").html("...")
      $(".login_password_error").css("visibility", "hidden");
    }
  }
  componentDidMount() {
    var get_admin = firebase.database().ref('ADMIN');
    get_admin.on('value', (snapshot) => {
      this.setState({
        admin_data: snapshot.val()
      })
    });
    var get_workers = firebase.database().ref('WORKER');
    get_workers.on('value', (snapshot) => {
      this.setState({
        workers_data: snapshot.val()
      })
    });
  }
  render() {
    console.log(this.state)
    return (
      <div class="hero">
        <div class="form-box">
          <h3 class="loginform-title">{this.state.role} Login</h3>
          <div id="login" class="input-group" >
            <input onChange={(event) => { this.email_changed(event.target.value) }} type="email" class="input-field" name="coordinator_email" placeholder=" Enter Email" required />
            <span class="login_email_error validation_msg">Enter email</span>
            <input onChange={(event) => { this.password_changed(event.target.value) }} type="password" class="input-field" name="coordinator_password" placeholder=" Enter Password" required />
            <span class="login_password_error validation_msg">Enter password</span>
            <select class="Dropdown-control" id="lang" onChange={(event) => { this.setState({ role: event.target.value }) }} value={this.state.role.value}>
              <option value="Admin">Coordinator</option>
              <option value="Worker">Vaccinator</option>
            </select>
            <button onClick={this.login} type="submit" class="submit-btn" name="loginButton">Log in</button>
            <p><a style={{ cursor: "pointer" }} onClick={() => { this.props.changePage("signup") }}>Sign Up</a></p>
          </div>
        </div>
      </div>
    )
  }
}
export class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      repeat_password: "",
      cnic: "",
      name: "",
      gender: "Male",
      phone_no: "",
      role: "Worker",
      status:"In Progress",
      admin_data: "",
      worker_data:"",
    };
  }
  sign_up = () => {
    if ($(".signup_phone_no_error").html() == "..." && $(".signup_name_error").html() == "..." && $(".signup_cnic_error").html() == "..." && $(".signup_repeat_password_error").html() == "..." && $(".signup_password_error").html() == "..." && $(".signup_email_error").html() == "...") {
      if (this.state.role == "Admin") {
        var database = firebase.database().ref();
        database.child("ADMIN").set({
          email: this.state.email,
          password: this.state.password,
          repeat_password: this.state.repeat_password,
          cnic: this.state.cnic,
          name: this.state.name,
          gender: this.state.gender,
          phone_no: this.state.phone_no,
          role: this.state.role,
        })
        // console.log(database)
        window.location.reload();
      } else {
        var database = firebase.database().ref("WORKER");
        database.push().set({
          email: this.state.email,
          password: this.state.password,
          repeat_password: this.state.repeat_password,
          cnic: this.state.cnic,
          name: this.state.name,
          gender: this.state.gender,
          phone_no: this.state.phone_no,
          role: this.state.role,
          status: this.state.status,
        })
        // console.log(database)
        this.props.changePage("login")
      }
    }
  }
  email_changed=(email,emails)=>{
    this.setState({ email: email })
    console.log(emails)
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(String(email).toLowerCase())){
      $(".signup_email_error").html("Enter valid email")
      $(".signup_email_error").css("visibility", "visible");
    } else if(emails.includes(email)){
      $(".signup_email_error").html("Email already exists")
      $(".signup_email_error").css("visibility", "visible");
    } else{
      $(".signup_email_error").html("...")
      $(".signup_email_error").css("visibility", "hidden");
    }
  }
  password_changed=(password)=>{
    this.setState({ password: password })
    if(password.length<8){
      $(".signup_password_error").html("Min chars could be 8")
      $(".signup_password_error").css("visibility", "visible");
    } else if(!/[a-z]/.test(password)||!/[A-Z]/.test(password)||!/[0-9]/.test(password)){
      $(".signup_password_error").html("There should be a num, lower and upper case letter")
      $(".signup_password_error").css("visibility", "visible");
    }
    else{
      $(".signup_password_error").html("...")
      $(".signup_password_error").css("visibility", "hidden");
    }
    if(password!=$("#repeat_password_").val()){
      $(".signup_repeat_password_error").html("Password doesn't match")
      $(".signup_repeat_password_error").css("visibility", "visible");
    } else{
      $(".signup_repeat_password_error").html("...")
      $(".signup_repeat_password_error").css("visibility", "hidden");
    }
  }
  repeat_password_changed=(repeat_password)=>{
    this.setState({ repeat_password: repeat_password })
    if(repeat_password.length<8){
      $(".signup_repeat_password_error").html("Min chars could be 8")
      $(".signup_repeat_password_error").css("visibility", "visible");
    } else if(!/[a-z]/.test(repeat_password)||!/[A-Z]/.test(repeat_password)||!/[0-9]/.test(repeat_password)){
      $(".signup_repeat_password_error").html("There should be a num, lower and upper case letter")
      $(".signup_repeat_password_error").css("visibility", "visible");
    } else if(repeat_password!=this.state.password){
      $(".signup_repeat_password_error").html("Password doesn't match")
      $(".signup_repeat_password_error").css("visibility", "visible");
    }
    else{
      $(".signup_repeat_password_error").html("...")
      $(".signup_repeat_password_error").css("visibility", "hidden");
    }
  }
  cnic_changed=(cnic,cnics)=>{
    this.setState({ cnic: cnic })
    if(cnic.length!=13){
      $(".signup_cnic_error").html("The digits could be 13 exact")
      $(".signup_cnic_error").css("visibility", "visible");
    } else if(cnics.includes(cnic)){
      $(".signup_cnic_error").html("Cnic already exists")
      $(".signup_cnic_error").css("visibility", "visible");
    } else{
      $(".signup_cnic_error").html("...")
      $(".signup_cnic_error").css("visibility", "hidden");
    }
  }
  name_changed=(name)=>{
    this.setState({ name: name })
    if(name.length>10||name.length<5){
      $(".signup_name_error").html("5-10 chars are allowed")
      $(".signup_name_error").css("visibility", "visible");
    } else if(!/^[a-zA-Z ]*$/.test(name)){
      $(".signup_name_error").html("Only alphabets and spaces are allowed")
      $(".signup_name_error").css("visibility", "visible");
    } else{
      $(".signup_name_error").html("...")
      $(".signup_name_error").css("visibility", "hidden");
    }
  }
  phone_no_changed=(phone_no)=>{
    this.setState({ phone_no: phone_no })
    if(phone_no.length!=11){
      $(".signup_phone_no_error").html("The digits could be 11 exact")
      $(".signup_phone_no_error").css("visibility", "visible");
    } else{
      $(".signup_phone_no_error").html("...")
      $(".signup_phone_no_error").css("visibility", "hidden");
    }
  }
  componentWillMount() {
    var get_admin = firebase.database().ref('ADMIN');
    get_admin.on('value', (snapshot) => {
      this.setState({ admin_data: snapshot.val() })
      // console.log(this.state.admin_data)
    });
  }
  componentDidMount() {
    var get_workers = firebase.database().ref('WORKER');
    get_workers.on('value', (snapshot) => {
      this.setState({
        worker_data: snapshot.val()
      })
    })
  }
  render() {
    console.log(this.state)
    var structured_worker_data = []
    for (var key_ in this.state.worker_data) {
      // skip loop if the property is from prototype
      if (!this.state.worker_data.hasOwnProperty(key_)) continue;
      var obj = this.state.worker_data[key_];
      // console.log(key_)
      obj["key"] = key_
      structured_worker_data.push(obj)
    }
    var cnics = structured_worker_data.map(a => a.cnic);
    var emails = structured_worker_data.map(a => a.email);
    // console.log(cnics)
    // console.log(emails)
    if (this.state.admin_data == null) {
      return (
        <div>
          <div class="hero">
            <div class="form-box signup_form_box">
              <h3 class="loginform-title signup_title">{this.state.role}  Sign Up</h3>
              <div id="login" class="input-group signup_form">
                <input onChange={(event) => { this.email_changed(event.target.value,emails) }} type="email" class="input-field" name="coordinator_email" placeholder="Enter Email" required />
                <span class="signup_email_error validation_msg">Enter email</span>
                <input onChange={(event) => { this.password_changed(event.target.value)}} type="password" class="input-field" name="coordinator_password" placeholder="Enter Password" required />
                <span class="signup_password_error validation_msg">Enter Password</span>
                <input onChange={(event) => { this.repeat_password_changed(event.target.value) }} type="password" class="input-field" name="coordinator_password2" id="repeat_password_" placeholder="Repeat Password" required />
                <span class="signup_repeat_password_error validation_msg">Repeat Password</span>
                <input onChange={(event) => { this.cnic_changed(event.target.value,cnics) }} type="number" class="input-field" name="coordinator_CNIC" placeholder="Enter CNIC" required />
                <span class="signup_cnic_error validation_msg">Enter cnic</span>
                <input onChange={(event) => { this.name_changed(event.target.value) }} type="text" class="input-field" name="coordinator_name" placeholder="Enter Your Name" required />
                <span class="signup_name_error validation_msg">Enter name</span>
                <input onChange={(event) => { this.phone_no_changed(event.target.value) }} type="number" class="input-field" name="coordinator_phone_no" placeholder="Enter Phone no" required />
                <span class="signup_phone_no_error validation_msg">Enter phone no</span>
                <select class="Dropdown-control" id="lang" onChange={(event) => { this.setState({ gender: event.target.value }) }} value={this.state.gender.value}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <select class="Dropdown-control" id="lang" onChange={(event) => { this.setState({ role: event.target.value }) }} value={this.state.role.value}>
                  <option value="Worker">Vaccinator</option>
                  <option value="Admin">Coordinator</option>
                </select>
                <button onClick={this.sign_up} type="submit" class="submit-btn signup_btn" name="signUpButton">Sign Up</button>
                <p><a style={{ cursor: "pointer" }} onClick={() => { this.props.changePage("signup") }}>Sign Up</a></p>
              </div>
            </div>
          </div>
        </div>
      )
    }
    else {
      // console.log(this.state)
      return (
        <div>
          <div class="hero">
            <div class="form-box signup_form_box">
              <h3 class="loginform-title signup_title">{this.state.role} Sign Up</h3>
              <div id="login" class="input-group signup_form">
                <input onChange={(event) => { this.email_changed(event.target.value,emails) }} type="email" class="input-field" name="coordinator_email" placeholder="Enter Email" required />
                <span class="signup_email_error validation_msg">Enter email</span>
                <input onChange={(event) => { this.password_changed(event.target.value)}} type="password" class="input-field" name="coordinator_password" placeholder="Enter Password" required />
                <span class="signup_password_error validation_msg">Enter Password</span>
                <input onChange={(event) => { this.repeat_password_changed(event.target.value) }} type="password" class="input-field" name="coordinator_password2" id="repeat_password_" placeholder="Repeat Password" required />
                <span class="signup_repeat_password_error validation_msg">Repeat Password</span>
                <input onChange={(event) => { this.cnic_changed(event.target.value,cnics) }} type="number" class="input-field" name="coordinator_CNIC" placeholder="Enter CNIC" required />
                <span class="signup_cnic_error validation_msg">Enter cnic</span>
                <input onChange={(event) => { this.name_changed(event.target.value) }} type="text" class="input-field" name="coordinator_name" placeholder="Enter Your Name" required />
                <span class="signup_name_error validation_msg">Enter name</span>
                <input onChange={(event) => { this.phone_no_changed(event.target.value) }} type="number" class="input-field" name="coordinator_phone_no" placeholder="Enter Phone no" required />
                <span class="signup_phone_no_error validation_msg">Enter phone no</span>
                <select class="Dropdown-control" id="lang" onChange={(event) => { this.setState({ gender: event.target.value }) }} value={this.state.gender.value}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <select class="Dropdown-control" id="lang" onChange={(event) => { this.setState({ role: event.target.value }) }} value={this.state.value}>
                  <option value="Worker">Vaccinator</option>
                </select>
                <button onClick={this.sign_up} type="submit" class="submit-btn signup_btn" name="signUpButton">Sign Up</button>
                <p><a style={{ cursor: "pointer" }} onClick={() => { this.props.changePage("login") }}>Sign In</a></p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}
export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page:"dashboard_index",
    }
  }
  sign_out = () => {
    window.localStorage.removeItem("cnic")
    window.localStorage.removeItem("email")
    window.localStorage.removeItem("gender")
    window.localStorage.removeItem("name")
    window.localStorage.removeItem("phone_no")
    window.localStorage.removeItem("role")
    // this.props.changePage("login")
    window.location.reload()
  }
  change_page=(page)=>{
    // var anchors=document.getElementsByClassName("")
    $(".treeview").removeClass("active")
    $("#".concat(page)).addClass("active")
    this.setState({page:page})
  }
  componentDidMount(){
    // window.location.reload();
  }
  render() {
    console.log(window.localStorage)
    return (
      <div class="">
        {/* This is Dashboard of {window.localStorage.getItem("name")} */}
        <header class="main-header">
          {window.localStorage.getItem("role")=="Admin" &&
          <a style={{cursor:"pointer"}} class="logo">
            <span class="logo-mini"><b>C</b></span>
            <span class="logo-lg">Coordinator</span>
          </a>
          }
          {window.localStorage.getItem("role")=="Worker" &&
          <a style={{cursor:"pointer"}} class="logo">
            <span class="logo-mini"><b>V</b></span>
            <span class="logo-lg">Vaccinator</span>
          </a>
          }
          <nav class="navbar navbar-static-top">
            <a style={{cursor:"pointer"}} class="sidebar-toggle" data-toggle="push-menu" role="button">
              <span class="sr-only">Toggle navigation</span>
            </a>
            <div class="navbar-custom-menu">
              <ul class="nav navbar-nav">
                <li id="logout-top" onClick={this.sign_out} class="dropdown tasks-menu" title="Click to logout">
                  <a style={{cursor:"pointer"}} class="dropdown-toggle">
                    <i class="fa fa-power-off" ></i>
                  </a>
                </li>
                <li onClick={()=>{this.change_page("edit_profile")}} class="dropdown messages-menu" title="Click to edit profile">
                  <a style={{cursor:"pointer"}} class="dropdown-toggle" >
                    <i class="fa fa-edit" ></i>
                  </a>

                </li>
                <li onClick={()=>{this.change_page("profile")}} class="dropdown notifications-menu" title="Click to view profile">
                  <a style={{cursor:"pointer"}} class="dropdown-toggle">
                    <i class="fa fa-id-badge" ></i>
                  </a>
                </li>
                <li class="dropdown user user-menu">
                  <a class="dropdown-toggle" data-toggle="dropdown">
                    <img src={profile_pic} class="user-image" alt="User Image" />
                    <span class="hidden-xs">{window.localStorage.getItem("name")}</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </header>
        <aside class="main-sidebar">
          <section class="sidebar">
            <div class="user-panel">
              <div class="pull-left image">
                <img src={profile_pic} class="img-circle" alt="User Image" />
              </div>
              <div class="pull-left info">
                <p>{window.localStorage.getItem("name")}</p>
                <a> {window.localStorage.getItem("role")}</a>
              </div>
            </div>
            <form action="#" method="get" class="sidebar-form">
              <div class="input-group">
                <input type="text" name="q" class="form-control" placeholder="Availible in V1" />
                <span class="input-group-btn">
                  <button type="submit" name="search" id="search-btn" class="btn btn-flat"><i class="fa fa-search"></i>
                  </button>
                </span>
              </div>
            </form>

            <ul class="sidebar-menu" data-widget="tree">
              <li class="header">YOUR WORK</li>
                {window.localStorage.getItem("role")=="Admin" &&
                <li id="dashboard_index" class="active treeview">
                  <a onClick={()=>{this.change_page("dashboard_index")}} style={{cursor:"pointer"}}>
                    <i class="fa fa-dashboard"></i> <span>Dashboard</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Admin" &&
                <li id="add_workers" class=" treeview">
                  <a onClick={()=>{this.change_page("add_workers")}} style={{cursor:"pointer"}}>
                    <i class="fa fa-user-plus"></i> <span>Add Workers</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Admin" &&
                <li id="workers" class=" treeview">
                  <a onClick={()=>{this.change_page("workers")}} style={{cursor:"pointer"}}>
                    <i class="fa fa-users"></i> <span>Workers</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Admin" &&
                <li id="add_vaccine" class=" treeview">
                  <a onClick={()=>{this.change_page("add_vaccine")}} style={{cursor:"pointer"}}>
                    <i class="fas fa-clinic-medical"></i> <span>Add Vaccine</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Admin" &&
                <li id="vaccines" class=" treeview">
                  <a onClick={()=>{this.change_page("vaccines")}} style={{cursor:"pointer"}}>
                    <i class="fas fa-capsules"></i> <span>Vaccines</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Admin" &&
                <li id="report" class=" treeview">
                  <a onClick={()=>{this.change_page("report")}} style={{cursor:"pointer"}}>
                    <i class="fa fa-list-alt"></i> <span>Report</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Worker" &&
                <li id="dashboard_index" class="active treeview">
                  <a onClick={()=>{this.change_page("dashboard_index")}} style={{cursor:"pointer"}}>
                    <i class="fa fa-dashboard"></i> <span>Dashboard</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Worker" &&
                <li id="assigned_vaccines" class=" treeview">
                  <a onClick={()=>{this.change_page("assigned_vaccines")}} style={{cursor:"pointer"}}>
                    <i class="fa fa-briefcase"></i> <span>Assigned Vaccines</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Worker" &&
                <li id="vaccinate" class=" treeview">
                  <a onClick={()=>{this.change_page("vaccinate")}} style={{cursor:"pointer"}}>
                    <i class="fa fa-syringe"></i> <span>Vaccinate</span>
                  </a>
                </li>
                }
                {window.localStorage.getItem("role")=="Worker" &&
                <li id="report" class=" treeview">
                  <a onClick={()=>{this.change_page("report")}} style={{cursor:"pointer"}}>
                    <i class="fa fa-list-alt"></i> <span>Report</span>
                  </a>
                </li>
                }
              {/* BELOW CODE IS FOR LATER ENHENCMENT OF APP */}
              {/* <li class="treeview">
                <a style={{cursor:"pointer"}}>
                  <i class="fa fa-share"></i> <span>Ignore It</span>
                  <span class="pull-right-container">
                    <i class="fa fa-angle-left pull-right"></i>
                  </span>
                </a>
                <ul class="treeview-menu">
                  <li><a style={{cursor:"pointer"}}><i class="fa fa-circle-o"></i> Level One</a></li>
                  <li class="treeview">
                    <a style={{cursor:"pointer"}}><i class="fa fa-circle-o"></i> Level One
                      <span class="pull-right-container">
                        <i class="fa fa-angle-left pull-right"></i>
                      </span>
                    </a>
                    <ul class="treeview-menu">
                      <li><a style={{cursor:"pointer"}}><i class="fa fa-circle-o"></i> Level Two</a></li>
                      <li class="treeview">
                        <a style={{cursor:"pointer"}}><i class="fa fa-circle-o"></i> Level Two
                          <span class="pull-right-container">
                            <i class="fa fa-angle-left pull-right"></i>
                          </span>
                        </a>
                        <ul class="treeview-menu">
                          <li><a style={{cursor:"pointer"}}><i class="fa fa-circle-o"></i> Level Three</a></li>
                          <li><a style={{cursor:"pointer"}}><i class="fa fa-circle-o"></i> Level Three</a></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li><a style={{cursor:"pointer"}}><i class="fa fa-circle-o"></i> Level One</a></li>
                </ul>
              </li> */}
              <li class="header">ACCOUNT ACTIONS</li>
              <li id="profile" class=" treeview"><a onClick={()=>{this.change_page("profile")}} style={{cursor:"pointer"}}><i class="fa fa-circle-o text-aqua"></i> <span>Profile</span></a></li>
              <li id="edit_profile" class=" treeview"><a style={{cursor:"pointer"}} onClick={()=>{this.change_page("edit_profile")}}><i class="fa fa-circle-o text-yellow"></i> <span>Edit Profile</span></a></li>
              <li id="logout-bottom" class=""><a style={{cursor:"pointer"}} onClick={this.sign_out}><i class="fa fa-circle-o text-red"></i> <span>Logout</span></a></li>
            </ul>

          </section>
        </aside>
        <div class="content-wrapper">
          {this.state.page=="dashboard_index" &&
            <Dashboard_Index/>
          }
          {this.state.page=="add_workers" &&
            <Add_Workers />
          }
          {this.state.page=="workers" &&
            <Workers/>
          }
          {this.state.page=="add_vaccine" &&
            <Add_Vaccine changePage={this.change_page}/>
          }
          {this.state.page=="vaccines" &&
            <Vaccines/>
          }
          {this.state.page=="profile" &&
            <Profile changePage={this.change_page}/>
          }
          {this.state.page=="edit_profile" &&
            <Edit_Profile changePage={this.change_page}/>
          }
          {this.state.page=="assigned_vaccines" &&
            <Assigned_Vaccines changePage={this.change_page}/>
          }
          {this.state.page=="vaccinate" &&
            <Vaccinate changePage={this.change_page}/>
          }
          {this.state.page=="report" &&
            <Report changePage={this.change_page}/>
          }
        </div>
        <footer class="main-footer">
          <div class="pull-right hidden-xs">
            <b>Version</b> 0.8.5-Beta
          </div>
          <strong>Copyright &copy; 2018-2020 <a>Appolio</a>.</strong> All rights
          reserved.
        </footer>
      </div>
    )
  }
}
export class Dashboard_Index extends Component{
  constructor(props) {
    super(props);
    this.state = {
      vaccines:"",
      workers:"",
      child_record:"",
      workers_accepted:0,
      workers_rejected:0,
      workers_pending:0,
      vaccines_unassigned:0,
      vaccines_assigned:0,
      vaccines_used:0,
    }
  }
  collapse_charts(){
    console.log("collapsing")
    if($("#charts_icon").hasClass("fa-minus")){
      // console.log("class found")
      $("#charts_icon").removeClass("fa-minus")
      $("#charts_icon").addClass("fa-plus")
    } else{
      $("#charts_icon").removeClass("fa-plus")
      $("#charts_icon").addClass("fa-minus")
    }
    if($("#charts_box").hasClass("collapsed-box")){
      $("#charts_box").removeClass("collapsed-box")
    } else{
      $("#charts_box").addClass("collapsed-box")
    }
  }
  collapse_charts1(){
    console.log("collapsing")

    if($("#charts_icon1").hasClass("fa-minus")){
      // console.log("class found")
      $("#charts_icon1").removeClass("fa-minus")
      $("#charts_icon1").addClass("fa-plus")
    } else{
      $("#charts_icon1").removeClass("fa-plus")
      $("#charts_icon1").addClass("fa-minus")
    }
    if($("#charts_box1").hasClass("collapsed-box")){
      $("#charts_box1").removeClass("collapsed-box")
    } else{
      $("#charts_box1").addClass("collapsed-box")
    }
  }
  componentWillMount() {
    console.log("Component Mounted")
    var get_workers = firebase.database().ref('WORKER');
    get_workers.on('value', (snapshot) => {
      this.setState({
        workers: snapshot.val()
      })
    })

    var get_vaccines = firebase.database().ref('VACCINE');
    get_vaccines.on('value', (snapshot) => {
      this.setState({
        vaccines: snapshot.val()
      })
    })

    var get_child_record = firebase.database().ref('CHILD RECORD');
    get_child_record.on('value', (snapshot) => {
      this.setState({
        child_record: snapshot.val()
      })
    })
    // console.log(workers_accepted)
    // console.log(workers_pending)
    // console.log(workers_rejected)
    // this.donutChart()
  }
  render() {
    var structured_workers = []
    for (var key_ in this.state.workers) {
      // skip loop if the property is from prototype
      if (!this.state.workers.hasOwnProperty(key_)) continue;
      var obj = this.state.workers[key_];
      // console.log(key_)
      obj["key"] = key_
      structured_workers.push(obj)
    }
    var workers_accepted = structured_workers.filter(obj => {
      return obj.status === "Accepted"
    }).length
    if (this.state.workers_accepted != workers_accepted) {
      this.setState({
        workers_accepted: workers_accepted
      })
    }
    // console.log(workers_accepted)
    var workers_rejected = structured_workers.filter(obj => {
      return obj.status === "Rejected"
    }).length
    if (this.state.workers_rejected != workers_rejected) {
      this.setState({
        workers_rejected: workers_rejected
      })
    }
    // console.log(workers_rejected)
    var workers_pending = structured_workers.filter(obj => {
      return obj.status === "In Progress"
    }).length
    if (this.state.workers_pending != workers_pending) {
      this.setState({
        workers_pending: workers_pending
      })
    }
    // console.log(workers_pending)

    var structured_vaccines = []
    for (var key_ in this.state.vaccines) {
      // skip loop if the property is from prototype
      if (!this.state.vaccines.hasOwnProperty(key_)) continue;
      var obj = this.state.vaccines[key_];
      obj["key"] = key_
      structured_vaccines.push(obj)
    }
    var vaccines_used = structured_vaccines.filter(obj => {
      return obj.status.includes("used")
    }).length
    if (this.state.vaccines_used != vaccines_used) {
      this.setState({
        vaccines_used: vaccines_used
      })
    }
    // console.log(vaccines_used)
    var vaccines_assigned = structured_vaccines.filter(obj => {
      return obj.status.includes("assigned-")
    }).length
    if (this.state.vaccines_assigned != vaccines_assigned) {
      this.setState({
        vaccines_assigned: vaccines_assigned
      })
    }
    // console.log(vaccines_assigned)
    var vaccines_unassigned = structured_vaccines.filter(obj => {
      return obj.status.includes("unassigned")
    }).length
    if (this.state.vaccines_unassigned != vaccines_unassigned) {
      this.setState({
        vaccines_unassigned: vaccines_unassigned
      })
    }
    
    var structured_child_record = []
    for (var key_ in this.state.child_record) {
      // skip loop if the property is from prototype
      if (!this.state.child_record.hasOwnProperty(key_)) continue;
      var obj = this.state.child_record[key_];
      obj["key"] = key_
      structured_child_record.push(obj)
    }
    console.log(structured_child_record)
    // var longitudes = structured_child_record.map(a => a.longitude);
    // var latitudes = structured_child_record.map(a => a.latitude);
    // var titles = structured_child_record.map(a => a.childname);
    // console.log(this.state)
    return(
      <div>
        <section className="content">
          <div class="header">Dashboard</div>
          {window.localStorage.getItem("role")=="Admin" &&
          <div id="charts_box" class="box box-info">
            <div class="box-header with-border">
              <h3 class="box-title">Workers And Vaccines Overview</h3>
              <div onClick={this.collapse_charts} class="box-tools pull-right">
                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i id="charts_icon" class="fa fa-minus"></i>
                </button>
              </div>
            </div>
            <div class="box-body charts_box">
              {(this.state.workers_accepted+this.state.workers_rejected+this.state.workers_pending)!=0 &&
              <Doughnut
              x1={this.state.workers_accepted}
              x1_title="Accepted"
              x2={this.state.workers_rejected}
              x2_title="Rejected"
              x3={this.state.workers_pending}
              x3_title="Pending"
              title="Workers"/>}
              {(this.state.vaccines_assigned+this.state.vaccines_unassigned+this.state.vaccines_used)!=0 &&
              <Doughnut
              x1={this.state.vaccines_used}
              x1_title="Used"
              x2={this.state.vaccines_assigned}
              x2_title="Assigned"
              x3={this.state.vaccines_unassigned}
              x3_title="Unassigned"
              title="Vaccines"/>}
            </div>
          </div>}
          <div id="charts_box1" class="box box-info" >
            <div class="box-header with-border">
              <h3 class="box-title">Locations of Vaccinated Children</h3>
              <div onClick={this.collapse_charts1} class="box-tools pull-right">
                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i id="charts_icon1" class="fa fa-minus"></i>
                </button>
              </div>
            </div>
            <div class="box-body map_box_" >
              <div id="google_map">
                <MapContainer 
                  child_record={structured_child_record}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
export class Add_Workers extends Component{
  constructor(props) {
    super(props);
    this.state = {
      workers: "",
      vaccines:"",
      worker_vaccine:"",
    };
  }
  reject_worker = (status, email, index, key, password,cnic) => {
    console.log("rejecting..")
    $("#reject-btn-"+cnic).addClass("disabled-li")
    if(!$("#accept-btn-"+cnic).hasClass("disabled-li")){
      $("#accept-btn-"+cnic).addClass("disabled-li")
    }
    $("#logout-top").addClass("disabled-li")
    $("#logout-bottom").addClass("disabled-li")
    var update = {}
    update["WORKER/" + key + "/status"] = "Rejected"
    firebase.database().ref().update(update)
    var temp_workers = this.state.workers
    temp_workers[key].status = "Rejected"
    this.setState({
      workers: temp_workers
    })
    if (status == "Accepted") {
      console.log("was accepted..")
      firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
        console.log("signing..")
      }).catch(function (error) {
        console.log(error.code)
        console.log(error.message)
      }).then(function(){
        var user = firebase.auth().currentUser
        return user
      }).then(function (user) {
        // console.log(result)
        if (user != null) {
          user.delete().then(function () {
            console.log("User is deleted")
            alert("The Worker is Rejected")
            $("#accept-btn-" + cnic).removeClass("disabled-li")
            $("#logout-top").removeClass("disabled-li")
            $("#logout-bottom").removeClass("disabled-li")
          }).catch(function (error) {
            // An error happened.
            console.log("USER DELETION ERR=" + error)
          });
        } else {
          console.log("user was null")
        }
      })

      // var structured_vaccines=[]
      // for (var key in this.state.vaccines) {
      //   // skip loop if the property is from prototype
      //   if (!this.state.vaccines.hasOwnProperty(key)) continue;
      //   var obj = this.state.vaccines[key];
      //   // console.log(key)
      //   obj["key"] = key
      //   structured_vaccines.push(obj)
      // }

      var structured_worker_vaccine=[]
      for (var key_ in this.state.worker_vaccine) {
        // skip loop if the property is from prototype
        if (!this.state.worker_vaccine.hasOwnProperty(key_)) continue;
        var obj = this.state.worker_vaccine[key_];
        // console.log(key_)
        obj["key"] = key_
        structured_worker_vaccine.push(obj)
      }
      var structured_worker_vaccine = structured_worker_vaccine.filter(obj => {
        return obj.worker_cnic === cnic
      })
      // console.log(structured_worker_vaccine)
      console.log(this.state.vaccines)
      structured_worker_vaccine.forEach(element => {
        console.log(element.vaccine_id)
        // console.log(element.key)
        console.log(this.state.vaccines[element.vaccine_id].status)
        var update = {}
        if (!this.state.vaccines[element.vaccine_id].status.includes("used")) {
          update["VACCINE/" + element.vaccine_id + "/status"] = "unassigned"
          update["WORKER_VACCINE/" + element.key] = null
          firebase.database().ref().update(update)
        }
      });
    } else {
      $("#accept-btn-" + cnic).removeClass("disabled-li")
      $("#logout-top").removeClass("disabled-li")
      $("#logout-bottom").removeClass("disabled-li")
    }
  }
  accept_worker = (status, email, index, key, password,cnic) => {
    if(!$("#reject-btn-"+cnic).hasClass("disabled-li")){
      $("#reject-btn-"+cnic).addClass("disabled-li")
    }
    $("#accept-btn-"+cnic).addClass("disabled-li")
    $("#logout-top").addClass("disabled-li")
    $("#logout-bottom").addClass("disabled-li")
    var update = {}
    update["WORKER/" + key + "/status"] = "Accepted"
    firebase.database().ref().update(update)
    var temp_workers = this.state.workers
    temp_workers[key].status = "Accepted"
    this.setState({
      workers: temp_workers
    })
    if (status != "Accepted") {
      console.log(password)
      firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
        alert("The Worker is Accepted")
        $("#reject-btn-" + cnic).removeClass("disabled-li")
        $("#logout-top").removeClass("disabled-li")
        $("#logout-bottom").removeClass("disabled-li")
      }).catch(function (error) {
        console.log(error.code);
        console.log(error.message);
      });
    } else {
      $("#reject-btn-" + cnic).removeClass("disabled-li")
      $("#logout-top").removeClass("disabled-li")
      $("#logout-bottom").removeClass("disabled-li")
    }
  }
  renderTdStatus(status){
    if (status == "In Progress") {
      return(<td><span class='label label-warning'>Pending</span></td>)
    } else if (status == "Accepted") {
      return(<td><span class='label label-success'>Accepted</span></td>)
    } else if (status == "Rejected") {
      return(<td><span class='label label-danger'>Rejected</span></td>)
    }
  }
  renderAcceptBtn(status,email,index,key,password,cnic){
    if (status == "In Progress"||status == "Rejected") {
      return(<td><button id={"accept-btn-"+cnic} onClick={()=>{this.accept_worker(status,email,index,key,password,cnic)}} class='btn btn-success'>Accept</button></td>)
    } else if (status == "Accepted") {
      return(<td><button id={"accept-btn-"+cnic} disabled={true} onClick={()=>{this.accept_worker(status,email,index,key,password,cnic)}} class='btn btn-success'>Accept</button></td>)
    }
  }
  renderRejectBtn(status,email,index,key,password,cnic){
    if (status == "In Progress"||status == "Accepted") {
      return(<td><button id={"reject-btn-"+cnic} onClick={()=>{this.reject_worker(status,email,index,key,password,cnic)}} class='btn btn-danger'>Reject</button></td>)
    } else if (status == "Rejected") {
      return(<td><button id={"reject-btn-"+cnic} disabled={true} onClick={()=>{this.reject_worker(status,email,index,key,password,cnic)}} class='btn btn-danger'>Reject</button></td>)
    }
  }
  renderTableData(){
    var structured_workers=[];
    for (var key in this.state.workers) {
      // skip loop if the property is from prototype
      if (!this.state.workers.hasOwnProperty(key)) continue;
      var obj = this.state.workers[key];
      // console.log(key)
      obj["key"]=key
      structured_workers.push(obj)
    }
    if(structured_workers.length==0){
      return <td colSpan={6}><h3 class="no_data">There are no workers signed up yet</h3></td>
    } else{
      return structured_workers.map((worker, index) => {
        const { cnic, email, gender,name, psw,phone_no,repeat_pass,role,status,key } = worker //destructuring
        // console.log(psw)
        // console.log(repeat_pass)
        // console.log(worker.password)
        // console.log(name)
        return (
           <tr key={index}>
              <td>{cnic}</td>
              <td>{name}</td>
              <td>{email}</td>
              {this.renderTdStatus(status)}
              {this.renderAcceptBtn(status,email,index,key,worker.password,cnic)}
              {this.renderRejectBtn(status,email,index,key,worker.password,cnic)}
           </tr>
        )
     })
    }
  }
  componentDidMount() {
      var get_workers = firebase.database().ref('WORKER');
      get_workers.on('value', (snapshot) => {
        this.setState({
          workers: snapshot.val()
        })
      })
      var get_vaccines = firebase.database().ref('VACCINE');
      get_vaccines.on('value', (snapshot) => {
        this.setState({
          vaccines: snapshot.val()
        })
      })
      var get_worker_vaccine = firebase.database().ref('WORKER_VACCINE');
      get_worker_vaccine.on('value', (snapshot) => {
        this.setState({
          worker_vaccine: snapshot.val()
        })
      })
  }
  componentWillMount() {
  }
  render(){
    console.log(this.state)
    return(
      <div>
        <section className="content">
        <div class="header">Add Workers</div>
              <table class="table table-responsive" border="1">
                <tr>
                  <th>CNIC</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Accept</th>
                  <th>Reject</th>
                </tr>
                {this.renderTableData()}
              </table>
        </section>
      </div>
    )
  }
}
export class Workers extends Component{
  constructor(props) {
    super(props);
    this.state = {
      workers: "",
      worker_vaccine:"",
      vaccines:"",
    };
  }
  getWorkDone(vaccines_used,vaccines_assigned){
    var work_done=(vaccines_used/(vaccines_used+vaccines_assigned))*100
    // var work_done=12.324
    work_done=work_done.toFixed(0)
    // console.log(work_done)
    if(!isNaN(work_done)){
      return work_done
    }
    return 100
  }
  renderWorkers(){
    var structured_workers=[];
    for (var key in this.state.workers) {
      // skip loop if the property is from prototype
      if (!this.state.workers.hasOwnProperty(key)) continue;
      var obj = this.state.workers[key];
      // console.log(key)
      obj["key"]=key
      structured_workers.push(obj)
    }
    var structured_workers = structured_workers.filter(obj => {
      return obj.status === "Accepted"
    })
    if(structured_workers.length==0){
      return <div style={{textAlign:"center"}}><h3 class="text-centered">There are no workers accepted yet</h3></div>
    } else{
      return structured_workers.map((worker, index) => {
        const { cnic, email, gender,name, psw,phone_no,repeat_pass,role,status,key_ } = worker //destructuring

        var vaccines_assigned=0;
        var structured_worker_vaccine = [];
        for (var key in this.state.worker_vaccine) {
          // skip loop if the property is from prototype
          if (!this.state.worker_vaccine.hasOwnProperty(key)) continue;
          var obj = this.state.worker_vaccine[key];
          // console.log(key)
          obj["key"] = key
          structured_worker_vaccine.push(obj)
        }
        var structured_worker_vaccine = structured_worker_vaccine.filter(obj => {
          return obj.worker_cnic === cnic
        })
        vaccines_assigned=structured_worker_vaccine.length

        var vaccines_used=0;
        var structured_vaccines = [];
        for (var key in this.state.vaccines) {
          // skip loop if the property is from prototype
          if (!this.state.vaccines.hasOwnProperty(key)) continue;
          var obj = this.state.vaccines[key];
          // console.log(key)
          obj["key"] = key
          structured_vaccines.push(obj)
        }
        structured_worker_vaccine.forEach(element => {
          var structured_vaccines_extracted = structured_vaccines.filter(obj => {
            return obj.key === element.vaccine_id
          })
          if(structured_vaccines_extracted[0]!=undefined){
            if(structured_vaccines_extracted[0].status.includes("used"))
              vaccines_used++
          }
        });
        // console.log(vaccines_used)
        vaccines_assigned=vaccines_assigned-vaccines_used
        var work_done=this.getWorkDone(vaccines_used,vaccines_assigned)
        // console.log(work_done.toString())

        return (
          <div class="col-md-4">
            <div class="box box-widget widget-user-2">
              <div class="widget-user-header bg-yellow">
                <div class="widget-user-image">
                  {gender=="Male" &&
                  <img class="img-circle" src={male_pic} alt="User Avatar" />}
                  {gender=="Female" &&
                  <img class="img-circle" src={female_pic} alt="User Avatar" />}
                </div>
                <h3 class="widget-user-username worker_card_name">{name}</h3>
                <h6 class="widget-user-desc worker_card_email">{email}</h6>
              </div>
              <div class="box-footer no-padding">
                <ul class="nav nav-stacked">
                  <li><a href="#">Level <span class="pull-right badge bg-blue">{vaccines_used}</span></a></li>
                  <li><a href="#">Vaccines <span class="pull-right badge bg-aqua">{vaccines_assigned}</span></a></li>
                  <li>
                    <a href="#">
                      <span class="work_done">Work Done</span><span class="pull-right badge bg-green">{work_done}%</span>
                      <div class="progress progress-xs progress-striped active work_done_bar">
                        <div class="progress-bar progress-bar-success" style={{ width: work_done.toString().concat("%") }}></div>
                      </div>
                    </a>

                  </li>
                </ul>
              </div>
            </div>
          </div>
        )
     })
    }
  }
  componentDidMount() {
    var get_workers = firebase.database().ref('WORKER');
    get_workers.on('value', (snapshot) => {
      this.setState({
        workers: snapshot.val()
      })
    })
    var get_vaccines = firebase.database().ref('VACCINE');
    get_vaccines.on('value', (snapshot) => {
      this.setState({
        vaccines: snapshot.val()
      })
    })
    var get_worker_vaccine = firebase.database().ref('WORKER_VACCINE');
    get_worker_vaccine.on('value', (snapshot) => {
      this.setState({
        worker_vaccine: snapshot.val()
      })
    })
  }
  render(){
    // console.log(this.state)
    return(
      <section class="content">
        <div class="header"> Workers</div>
        <div class="row">
          {this.renderWorkers()}
        </div>
      </section>
    )
  }
}
export class Add_Vaccine extends Component{
  constructor(props) {
    super(props);
    this.state = {
      vaccine_name:"",
      company_name:"",
      vaccine_type:"ipv",
      vaccine_quality:"low",
    };
  }
  add_vaccine=()=>{
    console.log("adding vaccine")
    var database = firebase.database().ref("VACCINE");
    var vaccine_id = Math.random().toString(36).substring(7);
      database.child(vaccine_id).set({
        vaccine_name:this.state.vaccine_name,
        company_name:this.state.company_name,
        vaccine_type:this.state.vaccine_type,
        vaccine_quality:this.state.vaccine_quality,
        status:"unassigned",
        vaccine_id:vaccine_id,
      })
      this.props.changePage("vaccines")
  }
  render(){
    // console.log(this.state)
    return(
      <div>
        <section className="content">
          <div class="header">Add Vaccine</div>
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Add Vaccine Details</h3>
            </div>
            <div>
              <div class="box-body">
                <div class="form-group">
                  <label for="exampleInputEmail1">Vaccine Name</label>
                  <input onChange={(event) => { this.setState({ vaccine_name: event.target.value }) }} type="email" class="form-control" id="exampleInputEmail1" placeholder="Enter vaccine name" />
                </div>
                <div class="form-group">
                  <label for="exampleInputPassword1">Company Name</label>
                  <input onChange={(event) => { this.setState({ company_name: event.target.value }) }} type="email" class="form-control" id="exampleInputPassword1"
                    placeholder="Enter Company Name" />
                </div>
                <div class="form-group">
                  <label>Vaccine Type</label>
                  <select class="Dropdown-control form-control " id="lang1" onChange={(event) => { this.setState({ vaccine_type: event.target.value }) }} value={this.state.vaccine_type}>
                    <option value="ipv" selected="selected">Inactivated Polio Vaccine(IPV)</option>
                    <option value="opv">Oral Polio Vaccine(OPV)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Vaccine Quality</label>
                  <select class="Dropdown-control form-control " id="lang2" onChange={(event) => { this.setState({ vaccine_quality: event.target.value }) }} value={this.state.vaccine_quality}>
                    <option value="low" selected="selected">Low</option>
                    <option value="average">Average</option>
                    <option value="best">Best</option>
                  </select>
                </div>
              </div>
              <div class="box-footer">
                <button  onClick={this.add_vaccine} type="submit" class="btn btn-primary">Add Vaccine</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
export class Vaccines extends Component{ 
  constructor(props) {
    super(props);
    this.state = {
      vaccines: "",
      workers:"",
      worker_vaccine:"",
    };
  }
  assign_vaccine=(key)=>{
    console.log("assigning vaccine")
    $("#btn-"+key).attr("disabled", true)
    var worker_vaccine = firebase.database().ref("WORKER_VACCINE")
    worker_vaccine.push().set({
      worker_cnic: $("#" + key).val(),
      vaccine_id: key
    }).then(()=>{
      var update = {}
      update["VACCINE/" + key + "/status"] = "assigned".concat("-",$("#" + key).val())
      firebase.database().ref().update(update)
      var temp_vaccines = this.state.vaccines
      temp_vaccines[key].status = "assigned".concat("-",$("#" + key).val())
      this.setState({
        vaccines: temp_vaccines
      })
    })
  }
  renderSelectData(){
    var structured_workers=[];
    for (var key in this.state.workers) {
      // skip loop if the property is from prototype
      if (!this.state.workers.hasOwnProperty(key)) continue;
      var obj = this.state.workers[key];
      // console.log(key)
      obj["key"]=key
      structured_workers.push(obj)
    }
    structured_workers = structured_workers.filter(obj => {
      return obj.status === "Accepted"
    })
    return structured_workers.map((worker, index) => {
      const { cnic, email, gender,name, psw,phone_no,repeat_pass,role,status,key} = worker //destructuring
      // console.log(psw)
      // console.log(repeat_pass)
      // console.log(worker.password)
      // console.log(name)
      return (
        <option value={cnic} >{name}</option>
      )
    })
  }
  renderSelect(status,key_){
    if(status=="unassigned"){
      return(
        <select class="Dropdown-control form-control " id={key_}>
          {this.renderSelectData()}
        </select>
      )
    }
    else {
      var structured_workers = [];
      for (var key in this.state.workers) {
        // skip loop if the property is from prototype
        if (!this.state.workers.hasOwnProperty(key)) continue;
        var obj = this.state.workers[key];
        // console.log(key)
        obj["key"] = key
        structured_workers.push(obj)
      }
      structured_workers = structured_workers.filter(obj => {
        return obj.status === "Accepted"
      })

      var structured_worker_vaccine = [];
      for (var key in this.state.worker_vaccine) {
        // skip loop if the property is from prototype
        if (!this.state.worker_vaccine.hasOwnProperty(key)) continue;
        var obj = this.state.worker_vaccine[key];
        // console.log(key)
        obj["key"] = key
        structured_worker_vaccine.push(obj)
      }
      // console.log(structured_worker_vaccine)
      // console.log(key_)
      structured_worker_vaccine = structured_worker_vaccine.filter(obj => {
        return obj.vaccine_id == key_
      })
      var worker_name="";
      if(structured_worker_vaccine[0]!=undefined&&structured_workers[0]!=undefined){
        structured_workers = structured_workers.filter(obj => {
          return obj.cnic === structured_worker_vaccine[0].worker_cnic
        })
        if (structured_workers[0] != undefined) {
          console.log(structured_workers[0].name)
          worker_name = structured_workers[0].name
        }
      }
      if(worker_name!=""){
        return(
          <select disabled={true} class="Dropdown-control form-control ">
            <option selected="selected">{worker_name}</option>
          </select>
        )
      } else{
        return(
          <select disabled={true} class="Dropdown-control form-control ">
            <option selected="selected">Rejected</option>
          </select>
        )
      }
    }
  }
  renderTdStatus(status){
    if (status == "unassigned") {
      return(<td><span class='label label-warning'>Unassigned</span></td>)
    } else if (status.includes("used")) {
      return(<td><span class='label label-success'>Used</span></td>)
    } else {
      return(<td><span class='label label-danger'>Assigned</span></td>)
    }
  }
  renderAssignBtn(status,key){
    if (status == "unassigned") {
      return(<td><button id={"btn-"+key} ref={btn => { this.btn = btn; }}  onClick={()=>{this.assign_vaccine(key)}} class='btn btn-success'>Assign</button></td>)
    } else {
      return(<td><button ref="btn" disabled={true} class='btn btn-success'>Assign</button></td>)
    }
  }
  renderTableData(){
    var structured_vaccines=[];
    for (var key in this.state.vaccines) {
      // skip loop if the property is from prototype
      if (!this.state.vaccines.hasOwnProperty(key)) continue;
      var obj = this.state.vaccines[key];
      // console.log(key)
      obj["key"]=key
      structured_vaccines.push(obj)
    }
    // console.log(structured_vaccines)
    // console.log(key)
    if(structured_vaccines.length!=0){
      return structured_vaccines.map((vaccine, index) => {
        const { company_name, status, vaccine_name,vaccine_quality, vaccine_type,key} = vaccine //destructuring
        // console.log(psw)
        // console.log(repeat_pass)
        // console.log(vaccine.password)
        // console.log(name)
        return (
          <tr>
            <td>{key}</td>
            <td>{vaccine_name}</td>
            <td>{vaccine_type}</td>
            <td>{vaccine_quality}</td>
            {this.renderTdStatus(status)}
            <td>
            {this.renderSelect(status,key)}
            </td>
            {this.renderAssignBtn(status,key)}
          </tr>
        )
     })
    } else{
      return <td colSpan={7}><h3 class="no_data">There are no Vaccines</h3></td>
    }
  }
  componentDidMount() {
    var get_vaccines = firebase.database().ref('VACCINE');
    get_vaccines.on('value', (snapshot) => {
      this.setState({
        vaccines: snapshot.val()
      })
    })
    var get_workers = firebase.database().ref('WORKER');
    get_workers.on('value', (snapshot) => {
      this.setState({
        workers: snapshot.val()
      })
    })
    var get_worker_vaccine = firebase.database().ref('WORKER_VACCINE');
    get_worker_vaccine.on('value', (snapshot) => {
      this.setState({
        worker_vaccine: snapshot.val()
      })
    })
  }
  render(){
    // console.log(this.state)
    return(
      <div>
        <section className="content">
          <div class="header">Vaccines</div>
          <table class="table table-responsive" border="1">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Qual</th>
              <th>Status</th>
              <th>Worker</th>
              <th>Action</th>
            </tr>
            {this.renderTableData()}
          </table>
        </section>
      </div>
    )
  }
}
export class Profile extends Component{
  render(){
    return(
      <div>
        <section className="content">
          <div class="header">Profile</div>
          <div class="col-md-12">
            <div class="box box-widget widget-user">
              <div class="widget-user-header bg-aqua-active">
                <h3 class="widget-user-username">{window.localStorage.getItem("name")}</h3>
                <h5 class="widget-user-desc">{window.localStorage.getItem("email")}</h5>
              </div>
              <div class="widget-user-image">
                <img class="img-circle" src={profile_pic} alt="User Avatar" />
              </div>
              <div class="box-footer">
                <table class="profile_table" border="1">
                  <tr>
                    <th>Cnic</th>
                    <td>{window.localStorage.getItem("cnic")} </td>
                  </tr>
                  <tr>
                    <th>Phone</th>
                    <td>{window.localStorage.getItem("phone_no")} </td>
                  </tr>
                  <tr>
                    <th>Gender</th>
                    <td>{window.localStorage.getItem("gender")} </td>
                  </tr>
                  <tr>
                    <th>Role</th>
                    <td>{window.localStorage.getItem("role")} </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <button onClick={()=>{this.props.changePage("edit_profile")}} class="btn btn-primary form-control">Edit Profile</button>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
export class Edit_Profile extends Component{
  constructor(props) {
    super(props);
    this.state = {
      current_user_data:"",
      edit_bth_disabled:true
    };
  }
  phone_no_changed=(phone_no)=>{
    this.setState({ phone_no: phone_no })
    if(phone_no.length!=11){
      $(".edit_phone_no_error").html("The digits could be 11 exact")
      $(".edit_phone_no_error").css("visibility", "visible");
    } else{
      $(".edit_phone_no_error").html("...")
      $(".edit_phone_no_error").css("visibility", "hidden");
    }
  }
  password_changed=(password)=>{
    this.setState({ password: password })
    if(password.length<8){
      $(".edit_password_error").html("Min chars could be 8")
      $(".edit_password_error").css("visibility", "visible");
    } else if(!/[a-z]/.test(password)||!/[A-Z]/.test(password)||!/[0-9]/.test(password)){
      $(".edit_password_error").html("There should be a num, lower and upper case letter")
      $(".edit_password_error").css("visibility", "visible");
    }
    else{
      $(".edit_password_error").html("...")
      $(".edit_password_error").css("visibility", "hidden");
    }
    if(password!=$("#repeat_password").val()){
      $(".edit_repeat_password_error").html("Password doesn't match")
      $(".edit_repeat_password_error").css("visibility", "visible");
    } else{
      $(".edit_repeat_password_error").html("...")
      $(".edit_repeat_password_error").css("visibility", "hidden");
    }
  }
  repeat_password_changed=(repeat_password)=>{
    this.setState({ repeat_password: repeat_password })
    if(repeat_password.length<8){
      $(".edit_repeat_password_error").html("Min chars could be 8")
      $(".edit_repeat_password_error").css("visibility", "visible");
    } else if(!/[a-z]/.test(repeat_password)||!/[A-Z]/.test(repeat_password)||!/[0-9]/.test(repeat_password)){
      $(".edit_repeat_password_error").html("There should be a num, lower and upper case letter")
      $(".edit_repeat_password_error").css("visibility", "visible");
    } else if(repeat_password!=this.state.password){
      $(".edit_repeat_password_error").html("Password doesn't match")
      $(".edit_repeat_password_error").css("visibility", "visible");
    }
    else{
      $(".edit_repeat_password_error").html("...")
      $(".edit_repeat_password_error").css("visibility", "hidden");
    }
  }
  name_changed=(name)=>{
    this.setState({ name: name })
    if(name.length>10||name.length<5){
      $(".edit_name_error").html("5-10 chars are allowed")
      $(".edit_name_error").css("visibility", "visible");
    } else if(!/^[a-zA-Z ]*$/.test(name)){
      $(".edit_name_error").html("Only alphabets and spaces are allowed")
      $(".edit_name_error").css("visibility", "visible");
    } else{
      $(".edit_name_error").html("...")
      $(".edit_name_error").css("visibility", "hidden");
    }
  }

  edit_profile=()=>{
    console.log("edit check")
    if ($(".edit_phone_no_error").html() == "..." && $(".edit_name_error").html() == "..." && $(".edit_repeat_password_error").html() == "..." && $(".edit_password_error").html() == "..."){
      console.log("editing")
      var update = {}
      if(this.state.current_user_data.role=="Admin"){
        console.log("admin record")
        if(this.state.name!=undefined){
          update["ADMIN/name"] = this.state.name
          window.localStorage.setItem("name", this.state.name)
        }
        if(this.state.phone_no!=undefined){
          update["ADMIN/phone_no"] = this.state.phone_no
          window.localStorage.setItem("phone_no", this.state.phone_no)
        }
        if(this.state.password!=undefined){
          update["ADMIN/password"] = this.state.password
        }
        if(this.state.repeat_password!=undefined){
          update["ADMIN/repeat_password"] = this.state.repeat_password
        }

      } else{
        console.log("worker record")
        if(this.state.name!=undefined){
          update["WORKER/"+window.localStorage.getItem("key")+"/name"] = this.state.name
          window.localStorage.setItem("name", this.state.name)
        }
        if(this.state.phone_no!=undefined){
          update["WORKER/"+window.localStorage.getItem("key")+"/phone_no"] = this.state.phone_no
          window.localStorage.setItem("phone_no", this.state.phone_no)
        }
        if(this.state.password!=undefined){
          update["WORKER/"+window.localStorage.getItem("key")+"/password"] = this.state.password
        }
        if(this.state.repeat_password!=undefined){
          update["WORKER/"+window.localStorage.getItem("key")+"/repeat_password"] = this.state.repeat_password
        }
      }
      firebase.database().ref().update(update)
      this.props.changePage("profile")
    }
  }

  componentDidMount(){
    if(window.localStorage.getItem("role")=="Admin"){
      var get_data = firebase.database().ref('ADMIN');
    } else{
      console.log(window.localStorage.getItem("key"))
      var get_data = firebase.database().ref("WORKER/"+window.localStorage.getItem("key"));
    }
    console.log(get_data)
    get_data.on('value', (snapshot) => {
      this.setState({
        current_user_data: snapshot.val()
      })
      console.log("enabeling edit btn")
      this.setState({
        edit_bth_disabled:false
      })
      // $("#edit_btn").prop("disabled",false)

    })
  }
  render(){
    console.log(this.state)
    return(
      <div>
        <section className="content">
          <div class="header">Edit Profile</div>
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Change Details to Edit them</h3>
            </div>
            <div>
              <div class="box-body">
                <div class="form-group edit_profile_form_group">
                  <label for="exampleInputEmail1">Name</label>
                  <input onChange={(event) => { this.name_changed(event.target.value) }} type="text" class="form-control" id="exampleInputEmail1" defaultValue={this.state.current_user_data.name}/>
                  <span class="help_block edit_name_error validation_msg">...</span>
                </div>
                <div class="form-group edit_profile_form_group">
                  <label for="exampleInputEmail1">Phone</label>
                  <input onChange={(event) => { this.phone_no_changed(event.target.value) }} type="number" class="form-control" id="exampleInputEmail1" defaultValue={this.state.current_user_data.phone_no}/>
                  <span class="help_block edit_phone_no_error validation_msg">...</span>
                </div>
                {window.localStorage.getItem("role")=="Admin" &&
                <div class="form-group edit_profile_form_group">
                  <label for="exampleInputPassword1">Password</label>
                  <input onChange={(event) => { this.password_changed(event.target.value)}} type="password" class="form-control" id="exampleInputPassword1" defaultValue={this.state.current_user_data.password}/>
                  <span class="help_block edit_password_error validation_msg">...</span>
                </div>}
                {window.localStorage.getItem("role")=="Admin" &&
                <div class="form-group edit_profile_form_group">
                  <label for="exampleInputPassword1">Confirm Password</label>
                  <input onChange={(event) => { this.repeat_password_changed(event.target.value) }} type="password" class="form-control" id="repeat_password" defaultValue={this.state.current_user_data.password}/>
                  <span class="help_block edit_repeat_password_error validation_msg">...</span>
                </div>}
                {window.localStorage.getItem("role")=="Worker" &&
                <div class="form-group edit_profile_form_group">
                  <label for="exampleInputPassword1">Password</label>
                  <input readOnly={true} onChange={(event) => { this.password_changed(event.target.value)}} type="password" class="form-control" id="exampleInputPassword1" defaultValue={this.state.current_user_data.password}/>
                  <span class="help_block edit_password_error validation_msg">...</span>
                </div>}
                {window.localStorage.getItem("role")=="Worker" &&
                <div class="form-group edit_profile_form_group">
                  <label for="exampleInputPassword1">Confirm Password</label>
                  <input readOnly={true} onChange={(event) => { this.repeat_password_changed(event.target.value) }} type="password" class="form-control" id="repeat_password" defaultValue={this.state.current_user_data.password}/>
                  <span class="help_block edit_repeat_password_error validation_msg">...</span>
                </div>}
              </div>
              <div class="box-footer">
                <button id="edit_btn" disabled={this.state.edit_bth_disabled} onClick={this.edit_profile} type="submit" class="btn btn-primary">Edit Profile</button>
              </div>
            </div>
          </div>
        </section>
        </div>
    )
  }
}
export class Assigned_Vaccines extends Component{
  constructor(props) {
    super(props);
    this.state = {
      workers: "",
      worker_vaccine: "",
      vaccines: "",
    };
  }
  renderTdStatus(status){
    if (status == "unassigned") {
      return(<td><span class='label label-warning'>Unassigned</span></td>)
    } else if (status.includes("used")) {
      return(<td><span class='label label-success'>Used</span></td>)
    } else {
      return(<td><span class='label label-danger'>Assigned</span></td>)
    }
  }
  renderTableData(){
    var vaccines_assigned_count = 0;
    var vaccines_assigned = [];
    var structured_worker_vaccine = [];
    console.log(this.state.worker_vaccine)
    for (var key in this.state.worker_vaccine) {
      // skip loop if the property is from prototype
      if (!this.state.worker_vaccine.hasOwnProperty(key)) continue;
      var obj = this.state.worker_vaccine[key];
      // console.log(key)
      obj["key"] = key
      structured_worker_vaccine.push(obj)
    }
    var structured_worker_vaccine = structured_worker_vaccine.filter(obj => {
      return obj.worker_cnic === window.localStorage.getItem("cnic")
    })
    vaccines_assigned_count = structured_worker_vaccine.length
    console.log(structured_worker_vaccine)
    var structured_vaccines = [];
    console.log(this.state.vaccines)
    for (var key in this.state.vaccines) {
      // skip loop if the property is from prototype
      if (!this.state.vaccines.hasOwnProperty(key)) continue;
      var obj = this.state.vaccines[key];
      // console.log(key)
      obj["key"] = key
      structured_vaccines.push(obj)
    }
    console.log(structured_vaccines)
    structured_worker_vaccine.forEach(element => {
      var structured_vaccines_extracted = structured_vaccines.filter(obj => {
        return obj.key === element.vaccine_id
      })
      if(structured_vaccines_extracted[0]!=undefined){
        vaccines_assigned.push(structured_vaccines_extracted[0])
      }

      // if (structured_vaccines_extracted[0].status.includes("used"))
    });
    console.log("Assigned=" + vaccines_assigned_count)
    console.log(vaccines_assigned)
    if(vaccines_assigned.length==0){
      return <td colSpan={6}><h3 class="no_data">There are no Vaccines assiged to you</h3></td>
    } else{
      return vaccines_assigned.map((vaccine, index) => {
        const { company_name, key, status,vaccine_name, vaccine_quality,vaccine_type } = vaccine //destructuring
        return (
           <tr key={index}>
              <td>{key}</td>
              <td>{vaccine_name}</td>
              <td>{company_name}</td>
              <td>{vaccine_type}</td>
              <td>{vaccine_quality}</td>
              {this.renderTdStatus(status)}
           </tr>
        )
     })
    }
  }
  componentDidMount() {
    var get_workers = firebase.database().ref('WORKER');
    get_workers.on('value', (snapshot) => {
      this.setState({
        workers: snapshot.val()
      })
    })
    var get_vaccines = firebase.database().ref('VACCINE');
    get_vaccines.on('value', (snapshot) => {
      this.setState({
        vaccines: snapshot.val()
      })
    })
    var get_worker_vaccine = firebase.database().ref('WORKER_VACCINE');
    get_worker_vaccine.on('value', (snapshot) => {
      this.setState({
        worker_vaccine: snapshot.val()
      })
    })
  }
  render(){
    return(
      <div>
        <section className="content">
          <div class="header">Assigned Vaccines</div>
          <table class="table table-responsive" border="1">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Company</th>
              <th>Type</th>
              <th>Qual</th>
              <th>Status</th>
            </tr>
            {this.renderTableData()}
          </table>
        </section>
      </div>
    )
  }
}
export class Vaccinate extends Component{
  constructor(props) {
    super(props);
    this.state = {
      workers: "",
      worker_vaccine: "",
      vaccines: "",
      //For Vaccination or Child
      phonenumber:"",
      mothername:"",
      longitude:"",
      latitude:"",
      fathername:"",
      email:"",
      dateofBirth:"",
      cnic:"",
      childname:"",
      childgender:"Boy",
      bForm:"",
      address:"",
      vaccine_id:"",
      vaccine_name:"",
      company_name:"",
      vaccine_quality:"",
      vaccine_type:"",
    };
  }
  renderVaccineName=(vaccines_assigned_and_not_used)=>{
    var vaccine_name=""
    var vaccines_assigned_and_not_used = vaccines_assigned_and_not_used.filter(obj => {
      return obj.key === this.state.vaccine_id
    })
    if(this.state.vaccine_id!="" && vaccines_assigned_and_not_used[0]!=undefined){
      vaccine_name=vaccines_assigned_and_not_used[0].vaccine_name
      if(this.state.vaccine_name!=vaccine_name){
        this.setState({vaccine_name:vaccine_name})
      }
    }
    return (
      <input readOnly={true} class="form-control" defaultValue={vaccine_name} />
   )
  }
  renderCompanyName=(vaccines_assigned_and_not_used)=>{
    var company_name=""
    var vaccines_assigned_and_not_used = vaccines_assigned_and_not_used.filter(obj => {
      return obj.key === this.state.vaccine_id
    })
    if(this.state.vaccine_id!="" && vaccines_assigned_and_not_used[0]!=undefined){
      company_name=vaccines_assigned_and_not_used[0].company_name
      if(this.state.company_name!=company_name){
        this.setState({company_name:company_name})
      }
    }
    return (
      <input readOnly={true} class="form-control" defaultValue={company_name} />
   )
  }
  renderVaccineQuality=(vaccines_assigned_and_not_used)=>{
    var vaccine_quality=""
    var vaccines_assigned_and_not_used = vaccines_assigned_and_not_used.filter(obj => {
      return obj.key === this.state.vaccine_id
    })
    if(this.state.vaccine_id!="" && vaccines_assigned_and_not_used[0]!=undefined){
      vaccine_quality=vaccines_assigned_and_not_used[0].vaccine_quality
      if(this.state.vaccine_quality!=vaccine_quality){
        this.setState({vaccine_quality:vaccine_quality})
      }
    }
    return (
      <input readOnly={true} class="form-control" defaultValue={vaccine_quality} />
   )
  }
  renderVaccineType=(vaccines_assigned_and_not_used)=>{
    var vaccine_type=""
    var vaccines_assigned_and_not_used = vaccines_assigned_and_not_used.filter(obj => {
      return obj.key === this.state.vaccine_id
    })
    if(this.state.vaccine_id!="" && vaccines_assigned_and_not_used[0]!=undefined){
      vaccine_type=vaccines_assigned_and_not_used[0].vaccine_type
      if(this.state.vaccine_type!=vaccine_type){
        this.setState({vaccine_type:vaccine_type})
      }
    }
    return (
      <input readOnly={true} class="form-control" defaultValue={vaccine_type} />
   )
  }
  renderSelectOptions=(vaccines_assigned_and_not_used)=>{
    // console.log(vaccines_assigned_and_not_used)
    if(vaccines_assigned_and_not_used.length>0 && this.state.vaccine_id==""){
      this.setState({vaccine_id:vaccines_assigned_and_not_used[0].key})
    }
    return vaccines_assigned_and_not_used.map((vaccine, index) => {
      const { company_name, key, status,vaccine_name, vaccine_quality,vaccine_type } = vaccine //destructuring
      // console.log(psw)
      // console.log(repeat_pass)
      // console.log(worker.password)
      // console.log(name)
      return (
         <option value={key}>{key}</option>
      )
   })
  }
  child_name_changed=(name)=>{
    this.setState({ childname: name })
    if(name.length>10||name.length<5){
      $(".vaccinate_child_name").html("5-10 chars are allowed")
      $(".vaccinate_child_name").css("visibility", "visible");
    } else if(!/^[a-zA-Z ]*$/.test(name)){
      $(".vaccinate_child_name").html("Only alphabets and spaces are allowed")
      $(".vaccinate_child_name").css("visibility", "visible");
    } else{
      $(".vaccinate_child_name").html("...")
      $(".vaccinate_child_name").css("visibility", "hidden");
    }
  }
  child_bform_changed=(cnic)=>{
    this.setState({ bForm: cnic })
    if(cnic.length!=13){
      $(".vaccinate_child_bform").html("The digits could be 13 exact")
      $(".vaccinate_child_bform").css("visibility", "visible");
    } else{
      $(".vaccinate_child_bform").html("...")
      $(".vaccinate_child_bform").css("visibility", "hidden");
    }
  }
  father_name_changed=(name)=>{
    this.setState({ fathername: name })
    if(name.length>10||name.length<5){
      $(".vaccinate_father_name").html("5-10 chars are allowed")
      $(".vaccinate_father_name").css("visibility", "visible");
    } else if(!/^[a-zA-Z ]*$/.test(name)){
      $(".vaccinate_father_name").html("Only alphabets and spaces are allowed")
      $(".vaccinate_father_name").css("visibility", "visible");
    } else{
      $(".vaccinate_father_name").html("...")
      $(".vaccinate_father_name").css("visibility", "hidden");
    }
  }
  mother_name_changed=(name)=>{
    this.setState({ mothername: name })
    if(name.length>10||name.length<5){
      $(".vaccinate_mother_name").html("5-10 chars are allowed")
      $(".vaccinate_mother_name").css("visibility", "visible");
    } else if(!/^[a-zA-Z ]*$/.test(name)){
      $(".vaccinate_mother_name").html("Only alphabets and spaces are allowed")
      $(".vaccinate_mother_name").css("visibility", "visible");
    } else{
      $(".vaccinate_mother_name").html("...")
      $(".vaccinate_mother_name").css("visibility", "hidden");
    }
  }
  mother_cnic_changed=(cnic)=>{
    this.setState({ cninc: cnic })
    if(cnic.length!=13){
      $(".vaccinate_mother_cnic").html("The digits could be 13 exact")
      $(".vaccinate_mother_cnic").css("visibility", "visible");
    } else{
      $(".vaccinate_mother_cnic").html("...")
      $(".vaccinate_mother_cnic").css("visibility", "hidden");
    }
  }
  email_changed=(email)=>{
    this.setState({ emial: email })
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(re.test(String(email).toLowerCase())){
      $(".vaccinate_email").html("...")
      $(".vaccinate_email").css("visibility", "hidden");
    } else{
      $(".vaccinate_email").html("Enter valid email")
      $(".vaccinate_email").css("visibility", "visible");
    }
  }
  phone_no_changed=(phone_no)=>{
    this.setState({ phonenumber: phone_no })
    if(phone_no.length!=11){
      $(".vaccinate_phone_no").html("The digits could be 11 exact")
      $(".vaccinate_phone_no").css("visibility", "visible");
    } else{
      $(".vaccinate_phone_no").html("...")
      $(".vaccinate_phone_no").css("visibility", "hidden");
    }
  }
  address_changed=(name)=>{
    this.setState({ address: name })
    if(name.length>50||name.length<15){
      $(".vaccinate_address").html("15-50 chars are allowed")
      $(".vaccinate_address").css("visibility", "visible");
    } else if(!/^[a-zA-Z ]*$/.test(name)){
      $(".vaccinate_address").html("Only alphabets and spaces are allowed")
      $(".vaccinate_address").css("visibility", "visible");
    } else{
      $(".vaccinate_address").html("...")
      $(".vaccinate_address").css("visibility", "hidden");
    }
  }
  vaccinate = () => {
    console.log(this.state.vaccine_id);
    if (this.state.vaccine_id!=""&&$(".vaccinate_child_name").html() == "..." && $(".vaccinate_child_bform").html() == "..." && $(".vaccinate_father_name").html() == "..." && $(".vaccinate_mother_name").html() == "..." && $(".vaccinate_mother_cnic").html() == "..." && $(".vaccinate_email").html() == "..." && $(".vaccinate_phone_no").html() == "..." && $(".vaccinate_address").html() == "...") {
      // console.log($("#datepicker").val())
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          console.log('Your latitude is :' + lat + ' and longitude is ' + long);
          this.setState({
            longitude: long
          })
          this.setState({
            latitude: lat
          })
          var database = firebase.database().ref("CHILD RECORD");
          database.push().set({
            phonenumber: this.state.phonenumber,
            mothername: this.state.mothername,
            longitude: this.state.longitude,
            latitude: this.state.latitude,
            fathername: this.state.fathername,
            emial: this.state.emial,
            dateofBirth: $("#datepicker").val(),
            cninc: this.state.cninc,
            childname: this.state.childname,
            childgender: this.state.childgender,
            bForm: this.state.bForm,
            address: this.state.address,
            vaccine_id:this.state.vaccine_id,
            vaccine_name:this.state.vaccine_name,
            vaccine_quality:this.state.vaccine_quality,
            vaccine_type:this.state.vaccine_type,
            company_name:this.state.company_name,
          })
          var update = {}
          update["VACCINE/" + this.state.vaccine_id + "/status"] = "used".concat("-",window.localStorage.getItem("cnic"))
          firebase.database().ref().update(update)
          // var vaccines=this.state.vaccines
          // vaccines[this.state.vaccine_id].status="used".concat("-",window.localStorage.getItem("cnic"))
          // this.setState({vaccines:vaccines})
          this.props.changePage("report")
        });
      } else {
        alert("geolocation is not supported by browser")
      }
    }
  }
  componentDidMount() {
    var get_workers = firebase.database().ref('WORKER');
    get_workers.on('value', (snapshot) => {
      this.setState({
        workers: snapshot.val()
      })
    })
    var get_vaccines = firebase.database().ref('VACCINE');
    get_vaccines.on('value', (snapshot) => {
      this.setState({
        vaccines: snapshot.val()
      })
    })
    var get_worker_vaccine = firebase.database().ref('WORKER_VACCINE');
    get_worker_vaccine.on('value', (snapshot) => {
      this.setState({
        worker_vaccine: snapshot.val()
      })
    })
  }
  render(){
    // console.log(this.state)
    var vaccines_assigned_and_not_used_count = 0;
    var vaccines_assigned_and_not_used = [];
    var structured_worker_vaccine = [];
    for (var key in this.state.worker_vaccine) {
      // skip loop if the property is from prototype
      if (!this.state.worker_vaccine.hasOwnProperty(key)) continue;
      var obj = this.state.worker_vaccine[key];
      // console.log(key)
      obj["key"] = key
      structured_worker_vaccine.push(obj)
    }
    var structured_worker_vaccine = structured_worker_vaccine.filter(obj => {
      return obj.worker_cnic === window.localStorage.getItem("cnic")
    })
    vaccines_assigned_and_not_used_count = structured_worker_vaccine.length

    var structured_vaccines = [];
    for (var key in this.state.vaccines) {
      // skip loop if the property is from prototype
      if (!this.state.vaccines.hasOwnProperty(key)) continue;
      var obj = this.state.vaccines[key];
      // console.log(key)
      obj["key"] = key
      structured_vaccines.push(obj)
    }

    structured_worker_vaccine.forEach(element => {
      var structured_vaccines_extracted = structured_vaccines.filter(obj => {
        return obj.key === element.vaccine_id
      })
      if(structured_vaccines_extracted[0]!=undefined){
        if (!structured_vaccines_extracted[0].status.includes("used")){
          vaccines_assigned_and_not_used.push(structured_vaccines_extracted[0])
        }
      }
    });
    // console.log("Assigned=" + vaccines_assigned_and_not_used_count)
    // console.log(vaccines_assigned_and_not_used)
    var endDate = new Date();
    endDate.setMonth(endDate.getMonth() - 3);    // Calculate Age Range b/t 3 months to 6 years
    var startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 6);
    $('#datepicker').datepicker({
      autoclose: true,
      format: 'dd-mm-yyyy',
      endDate: endDate,
      startDate: startDate
      // maxDate: new Date,
      // minDate: new Date(2014, 1, 1)
    })
    return(
      <div>
        <section className="content">
          <div class="header">Vaccinate</div>
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Enter Vaccination Details</h3>
            </div>
            <div role="form">
              <div class="box-body">
                <div class="form-group">
                  <label for="exampleInputEmail1">Child Name</label>
                  <input onChange={(event)=>{this.child_name_changed(event.target.value)}} class="form-control" id="exampleInputEmail1" placeholder="Enter child name" />
                  <span class="vaccinate_child_name validation_msg">Enter child name</span>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Child Gender</label>
                  <select class="Dropdown-control form-control " id="lang" onChange={(event) => { this.setState({ childgender:event.target.value }) }} value={this.state.childgender}>
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Child bForm</label>
                  <input type="number" onChange={(event)=>{this.child_bform_changed(event.target.value)}} class="form-control" id="exampleInputEmail1" placeholder="Enter child bForm" />
                  <span class="vaccinate_child_bform validation_msg">Enter child bForm</span>
                </div>
                <div class="form-group">
                  <label>Child Date Of Birth</label>
                  <div class="input-group date">
                    <div class="input-group-addon">
                      <i class="fa fa-calendar"></i>
                    </div>
                    <input readOnly={true} type="text" class="form-control pull-right" id="datepicker" />
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Father Name</label>
                  <input onChange={(event)=>{this.father_name_changed(event.target.value)}} class="form-control" id="exampleInputEmail1" placeholder="Enter father name" />
                  <span class="vaccinate_father_name validation_msg">Enter father name</span>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Mother Name</label>
                  <input onChange={(event)=>{this.mother_name_changed(event.target.value)}} class="form-control" id="exampleInputEmail1" placeholder="Enter mother name" />
                  <span class="vaccinate_mother_name validation_msg">Enter mother name</span>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Mother Cnic</label>
                  <input type="number" onChange={(event)=>{this.mother_cnic_changed(event.target.value)}} class="form-control" id="exampleInputEmail1" placeholder="Enter mother cnic" />
                  <span class="vaccinate_mother_cnic validation_msg">Enter mother cnic</span>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Email</label>
                  <input onChange={(event)=>{this.email_changed(event.target.value)}} class="form-control" id="exampleInputEmail1" placeholder="Enter email" />
                  <span class="vaccinate_email validation_msg">Enter email</span>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Phone</label>
                  <input type="number" onChange={(event)=>{this.phone_no_changed(event.target.value)}} class="form-control" id="exampleInputEmail1" placeholder="Enter phone no" />
                  <span class="vaccinate_phone_no validation_msg">Enter phone no</span>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Vaccine ID</label>
                  <select id="vaccine_id" class="Dropdown-control form-control " id="lang" onChange={(event) => { this.setState({ vaccine_id: event.target.value }) }} value={this.state.vaccine_id}>
                    {this.renderSelectOptions(vaccines_assigned_and_not_used)}
                  </select>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Vaccine Name</label>
                  {this.renderVaccineName(vaccines_assigned_and_not_used)}
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Company Name</label>
                  {this.renderCompanyName(vaccines_assigned_and_not_used)}
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Vaccine Type</label>
                  {this.renderVaccineType(vaccines_assigned_and_not_used)}
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Vaccine Quality</label>
                  {this.renderVaccineQuality(vaccines_assigned_and_not_used)}
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Address</label>
                  <input onChange={(event)=>{this.address_changed(event.target.value)}} class="form-control" id="exampleInputEmail1" placeholder="Enter address" />
                  <span class="vaccinate_address validation_msg">Enter address</span>
                </div>
              </div>
              <div class="box-footer">
                <button onClick={this.vaccinate} class="btn btn-primary">Vaccinate</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
export class Report extends Component{
  constructor(props) {
    super(props);
    this.state = {
      child_record:"",
      worker_vaccine:"",
    }
  }
  renderAge(dateofBirth){
    var dateofBirth=dateofBirth.split("-")
    var birthday=new Date(dateofBirth[2],dateofBirth[1],dateofBirth[0])
    var ageDifMs = Date.now() - birthday.getTime();
    var age_in_days= parseInt((ageDifMs / (1000*60*60*24)))
    var remaning_days_after_years=age_in_days%365
    var age_in_years=parseInt(age_in_days/365)
    var remaning_days_after_months=remaning_days_after_years%30
    var age_in_months=parseInt(remaning_days_after_years/30)
    // var ageDate = new Date(ageDifMs); // miliseconds from epoch
    // var age=Math.abs(ageDate.getUTCFullYear() - 1970);
    return(
    <td>{age_in_years} years {age_in_months} months {remaning_days_after_months} days</td>
    )
  }
  renderTableData() {
    var structured_worker_vaccine = [];
    for (var key in this.state.worker_vaccine) {
      // skip loop if the property is from prototype
      if (!this.state.worker_vaccine.hasOwnProperty(key)) continue;
      var obj = this.state.worker_vaccine[key];
      // console.log(key)
      obj["key"] = key
      structured_worker_vaccine.push(obj)
    }
    var structured_worker_vaccine = structured_worker_vaccine.filter(obj => {
      return obj.worker_cnic === window.localStorage.getItem("cnic")
    })
    console.log(structured_worker_vaccine)
    var vaccine_ids = structured_worker_vaccine.map(a => a.vaccine_id);

    var structured_child_record = [];
    for (var key in this.state.child_record) {
      // skip loop if the property is from prototype
      if (!this.state.child_record.hasOwnProperty(key)) continue;
      var obj = this.state.child_record[key];
      // console.log(key)
      obj["key"] = key
      structured_child_record.push(obj)
    }
    if(window.localStorage.getItem("role")!="Admin"){
      var structured_child_record = structured_child_record.filter(obj => {
        return vaccine_ids.includes(obj.vaccine_id)
      })
    }
    console.log(structured_child_record)
    if(structured_child_record.length==0){
      return <td colSpan={6}><h3 class="no_data">There are no vaccinations done Yet</h3></td>
    } else{
      return structured_child_record.map((child,index)=>{
        const {bForm,childgender,childname,cninc,dateofBirth,emial,fathername,latitude,longitude,mothername,phonenumber,vaccine_id}=child
        return(
          <tr>
            <td>{vaccine_id}</td>
            <td>{childname}</td>
            <td>{childgender}</td>
            {this.renderAge(dateofBirth)}
            <td>{mothername}</td>
            <td>{emial}</td>
          </tr>
        )
      })
    }
  }
  componentDidMount() {
    var get_worker_vaccine = firebase.database().ref('WORKER_VACCINE');
    get_worker_vaccine.on('value', (snapshot) => {
      this.setState({
        worker_vaccine: snapshot.val()
      })
    })
    var get_child_record = firebase.database().ref('CHILD RECORD');
    get_child_record.on('value', (snapshot) => {
      this.setState({
        child_record: snapshot.val()
      })
    })
  }
  render(){
    return(
      <div>
        <section className="content">
          <div class="header">Report</div>
          <table class="table table-responsive" border="1">
            <tr>
              <th>Vaccine</th>
              <th>Child Name</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Mother</th>
              <th>Email</th>
            </tr>
            {this.renderTableData()}
          </table>
        </section>
      </div>
    )
  }
}
export class Doughnut extends Component {
  donutChart=()=>{
    //-------------
    //- PIE CHART -
    //-------------
    // Get context with jQuery - using jQuery's .get() method.
    //Create pie or douhnut chart
    // You can switch between pie and douhnut using the method below.
    // pieChart.Doughnut(PieData, pieOptions)
    var config = {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [
            this.props.x1,
            this.props.x2,
            this.props.x3
          ],
          backgroundColor: [
            "#00A65A",
            "#DD4B39",
            "#6AA8CC"
          ],
        }],
        labels: [
          this.props.x1_title,
          this.props.x2_title,
          this.props.x3_title
        ]
      },
      options:{
        legend: {
          display: false,
          position: 'bottom',
          labels: {
            fontSize: 20,
          }
        },
        tooltips: {
          titleFontSize: 30,
          bodyFontSize: 30
        },
        elements: {
          center: {
            text: this.props.title,
          }
        }
      },
    };
    if(this.props.title=="Workers"){
      var ctx = document.getElementById("pieChart").getContext("2d");
    } else {
      var ctx = document.getElementById("pieChart2").getContext("2d");
    }
    window.myPie = new Chart(ctx, config);
    Chart.pluginService.register({
      beforeDraw: function(chart) {
        var width = chart.chart.width,
            height = chart.chart.height,
            ctx = chart.chart.ctx;

        ctx.restore();
        var fontSize = (height / 114).toFixed(2)-1;
        ctx.font = fontSize + "em sans-serif";
        ctx.textBaseline = "middle";
        var centerConfig = chart.config.options.elements.center;
        var text = centerConfig.text,
            textX = Math.round((width - ctx.measureText(text).width) / 2),
            textY = height / 2;

        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    });
  }
  componentDidMount(){
    this.donutChart()
  }
  render(){
    return(
      <div class="charts_div">
        {this.props.title=="Workers" &&
        <canvas id="pieChart"></canvas>}
        {this.props.title=="Vaccines" &&
        <canvas id="pieChart2"></canvas>}
      </div>
    )
  }
}
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "login"
    };
  }
  change_page = (page) => {
    this.setState({ page: page })
  }
  componentDidMount() {
    // console.log(window.localStorage.getItem("email"))
  }
  render() {

    if (this.state.page == "dashboard" || window.localStorage.getItem("email") != null) {
      return (
        <div>
          <Dashboard changePage={this.change_page}/>
          {/* This is dashboard of {window.localStorage.name} */}
        </div>
      )
    }
    else {
      if (this.state.page == "login") {
        return (
          <div>
            <Login changePage={this.change_page} />
          </div>
        )
      }
      else if (this.state.page == "signup") {
        return (
          <div>
            <SignUp changePage={this.change_page} />
          </div>
        )
      }
    }
  }
}