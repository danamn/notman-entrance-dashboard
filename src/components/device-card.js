import React from 'react';
import Moment from 'moment';

export default class DeviceCardComponent  extends React.Component {

  setDeviceData() {

     this.sourceIdx++;
     if (this.sourceIdx >= this.sources.length) {
         this.sourceIdx = 0;
     }

     // TODO improve this promise code

     var scope = this;
     var idx = this.sourceIdx;
     var data = fetch(scope.sources[idx].url).then(response => response.json()).then(function(data) {
        return data;
     }).then(function(data) {
         scope.setState({
            device:  scope.sources[idx],
            data: data,
            lastUpdated: new Date()
         });
     });

  }

  update() {

  }

  componentWillMount() {

    this.refreshIntervalMinutes = 1;
    this.sourceIdx = 0;
    this.sources = [{
       name:'Reely Active',
       logo: '/logos/reelyactive.png',
       url: 'https://www.hyperlocalcontext.com/contextat/directory/notman',
       text: value => `${value} occupant${value == 1 ? '' : 's'} detected via Bluetooth`,
       value: function(deviceData) {
            var deviceCount = 0;
            var i=0;

            if (typeof deviceData !== 'undefined') {
                var devices = deviceData.devices;
                var key;
                for (key in devices) {
                    var device = devices[key];
                    if (device.nearest && device.url !== 'http://reelyactive.com/products/ra-r436/') {
                        deviceCount++;
                    }
                }
            }
            return deviceCount;
       }
       }, {
  	   name:'mySeat',
  	   logo: '/logos/myseat.png',
  	   // TODO fetch key from somewhere
  	   url: ' https://apiv3.myseat.fr/Request/GetChairs/key/INSERT KEY HERE',
  	   text: value => `${value} Seated in Osmo Café`,
  	   value: function(deviceData) {
  	        console.log(deviceData);
            var seated = 0;
            try {
                if (deviceData && deviceData.Error.length === 0) {
                    var i, chairs = deviceData.Content.Chairs;
                    for (i=0; i<chairs.length; i++) {
                        if (chairs[i].id_geometry !== 0 && chairs[i].status === 1) {
                            seated++;
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }

            return seated;
  	   }
  	   }];

       this.setDeviceData();
  }


  componentDidMount() {
         window.setInterval(function () {
          this.setDeviceData();
        }.bind(this), (this.refreshIntervalMinutes * 60 * 1000));
  }

  render() {

    var lastUpdated = '';
    var lang = 'en';

    if (this.state && this.state.lastUpdated) {
        var time = Moment(this.state.lastUpdated).locale(lang).format('HH:mm');
        var date = Moment(this.state.lastUpdated).locale(lang).format('DD MMMM YYYY');

        lastUpdated = `Last updated at: ${time} on ${date}`;
    }

    if (!this.state) {
        return  <div className="DeviceCard Card"><div></div></div>;
    }

    return  <div className="DeviceCard Card">
                <div>
                    <img className="DeviceCard--icon" src="/house-emojis/hackthehouse-smiling.gif"/>
                    {this.state.device.text(this.state.device.value(this.state.data))}.

                    <div className="deviceVendor">

                        Data provided by <img className="vendorLogo" src={this.state.device.logo} />
                        <div className="lastUpdated">{lastUpdated}</div>
                    </div>
                </div>
            </div>;
  }

}